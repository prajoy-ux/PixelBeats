# Static triage for PE files and associated package files
import pefile
import re
import math
import os
import json
from datetime import datetime, timezone

TARGET_DIR = r"C:\Users\admindhemna\Downloadsuse\mc mods\Moon-Sweepers-UCOnline2-Fix-AnkerGames"
FILES = [
    os.path.join(TARGET_DIR, "version.dll"),
    os.path.join(TARGET_DIR, r"MoonSweepers_Data\Plugins\x86_64\steam_api64.dll"),
]
CONFIG_FILES = [
    os.path.join(TARGET_DIR, "uco2-fix-manifest.json"),
    os.path.join(TARGET_DIR, "union-crax.ini"),
]

SUSPICIOUS_APIS = {
    "createremotethread", "virtualallocex", "writeprocessmemory", "openprocess",
    "setwindowshookexa", "setwindowshookexw", "urldownloadtofilea", "urldownloadtofilew",
    "internetopenurla", "internetopenurlw", "httpsendrequesta", "httpsendrequestw",
    "winexec", "shellexecutea", "shellexecutew", "createprocessa", "createprocessw",
    "regsetvalueexa", "regsetvalueexw", "getasynckeystate", "ntunmapviewofsection",
    "queueuserapc", "isdebuggerpresent", "checkremotedebuggerpresent",
    "adjusttokenprivileges", "getadaptersinfo", "getclipboarddata", "cryptprotectdata",
    "cryptunprotectdata", "peeknamedpipe"
}
NET_APIS = {
    "wsastartup", "socket", "connect", "send", "recv", "gethostbyname",
    "inet_addr", "httpopenrequesta", "httpopenrequestw", "internetconnecta",
    "internetconnectw", "winhttpopen", "winhttpsendrequest", "winhttpconnect"
}

RE_PATTERNS = [
    ("URL", re.compile(rb"https?://[^\x00\s\"'<>]{4,120}")),
    ("IPv4", re.compile(rb"\b(?:\d{1,3}\.){3}\d{1,3}\b")),
    ("DiscordWebhook", re.compile(rb"discord(?:app)?\.com/api/webhooks[^\x00\s\"']{0,80}")),
    ("Telegram", re.compile(rb"api\.telegram\.org[^\x00\s\"']{0,80}")),
    ("BrowserCreds", re.compile(rb"(?:Login Data|Cookies|Local State|Web Data|\\User Data|Opera Software|BraveSoftware)", re.I)),
    ("CryptoWallet", re.compile(rb"(?:metamask|exodus|atomic wallet|electrum|wallet\.dat|tronlink)", re.I)),
    ("PowerShell", re.compile(rb"powershell[^\x00]{0,60}", re.I)),
    ("CmdLine", re.compile(rb"cmd(?:\.exe)?\s*/[cC][^\x00]{0,80}")),
    ("Persistence", re.compile(rb"(?:CurrentVersion\\Run|Startup\\|schtasks)", re.I)),
    ("EmuMarker", re.compile(rb"(?:goldberg|spacewar|union.?crax|uconline|steam_emul|gse_|online.?fix)", re.I)),
    ("PDBPath", re.compile(rb"[A-Za-z]:\\[^\x00]{3,120}?\.pdb")),
    ("IniRef", re.compile(rb"[^\x00\s]{1,60}\.ini")),
]

def shannon(data: bytes) -> float:
    if not data:
        return 0.0
    counts = [0] * 256
    for b in data:
        counts[b] += 1
    n = len(data)
    return -sum((c / n) * math.log2(c / n) for c in counts if c)

def print_separator(title=""):
    print("=" * 70)
    if title:
        print(f" {title.upper()} ".center(70, "="))
        print("=" * 70)

def dump_configs():
    print_separator("PACKAGE CONFIG FILES")
    for cfg in CONFIG_FILES:
        print(f"\n--- File: {cfg} ---")
        if os.path.exists(cfg):
            try:
                with open(cfg, "r", encoding="utf-8", errors="replace") as f:
                    content = f.read()
                    print(content.strip())
            except Exception as e:
                print(f"Error reading {cfg}: {e}")
        else:
            print("File does not exist.")

def analyze_pe(filepath: str):
    print_separator(f"STATIC PE ANALYSIS: {os.path.basename(filepath)}")
    print(f"Full Path: {filepath}")
    if not os.path.exists(filepath):
        print("FILE NOT FOUND.")
        return

    file_size = os.path.getsize(filepath)
    print(f"File Size: {file_size} bytes ({file_size / 1024:.2f} KB)")

    with open(filepath, "rb") as f:
        file_bytes = f.read()

    overall_entropy = shannon(file_bytes)
    print(f"Overall File Entropy: {overall_entropy:.3f} / 8.000")
    if overall_entropy > 7.2:
        print(" [!] HIGH OVERALL ENTROPY: Likely packed, encrypted, or compressed.")
    elif overall_entropy > 6.5:
        print(" [*] Moderate entropy: Standard compiled binary or minor compression.")
    else:
        print(" [*] Normal/Low entropy: Typical uncompressed binary.")

    try:
        pe = pefile.PE(filepath)
    except Exception as e:
        print(f"Failed to parse PE: {e}")
        return

    # Machine / Architecture
    machine = hex(pe.FILE_HEADER.Machine)
    arch = "x64 (64-bit)" if pe.FILE_HEADER.Machine == 0x8664 else "x86 (32-bit)" if pe.FILE_HEADER.Machine == 0x14c else f"Unknown ({machine})"
    timestamp = datetime.fromtimestamp(pe.FILE_HEADER.TimeDateStamp, tz=timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')
    print(f"Architecture: {arch}")
    print(f"Compile Timestamp: {timestamp} (raw: {hex(pe.FILE_HEADER.TimeDateStamp)})")
    print(f"Subsystem: {pe.OPTIONAL_HEADER.Subsystem}")
    print(f"Entry Point RVA: {hex(pe.OPTIONAL_HEADER.AddressOfEntryPoint)}")
    print(f"Image Base: {hex(pe.OPTIONAL_HEADER.ImageBase)}")
    print(f"Number of Sections: {pe.FILE_HEADER.NumberOfSections}")

    # Sections & Entropy
    print("\n--- Sections ---")
    suspicious_sections = False
    for sec in pe.sections:
        sec_name = sec.Name.decode('utf-8', errors='replace').strip('\x00')
        sec_entropy = sec.get_entropy()
        raw_size = sec.SizeOfRawData
        virt_size = sec.Misc_VirtualSize
        flag_warn = ""
        if sec_entropy > 7.3:
            flag_warn += " [HIGH ENTROPY/PACKED]"
            suspicious_sections = True
        if raw_size == 0 and virt_size > 0:
            flag_warn += " [UNINITIALIZED DATA]"
        print(f"  {sec_name:<10} VirtSize: 0x{virt_size:08x} ({virt_size:>8} B)  RawSize: 0x{raw_size:08x} ({raw_size:>8} B)  Entropy: {sec_entropy:.3f}{flag_warn}")

    # Exports
    print("\n--- Exported Functions ---")
    if hasattr(pe, 'DIRECTORY_ENTRY_EXPORT'):
        exports = pe.DIRECTORY_ENTRY_EXPORT.symbols
        print(f"Total Exports: {len(exports)}")
        for exp in exports[:30]:
            name = exp.name.decode('utf-8', errors='replace') if exp.name else f"Ordinal({exp.ordinal})"
            forwarder = f" -> {exp.forwarder.decode('utf-8', errors='replace')}" if exp.forwarder else ""
            print(f"  [ord {exp.ordinal:>4}] RVA: 0x{exp.address:08x}  {name}{forwarder}")
        if len(exports) > 30:
            print(f"  ... and {len(exports) - 30} more exports.")
    else:
        print("  None (No export directory).")

    # Imports
    print("\n--- Imported Libraries & Functions ---")
    suspicious_found = []
    net_found = []
    total_imports = 0
    if hasattr(pe, 'DIRECTORY_ENTRY_IMPORT'):
        for entry in pe.DIRECTORY_ENTRY_IMPORT:
            dll_name = entry.dll.decode('utf-8', errors='replace')
            func_names = []
            for imp in entry.imports:
                total_imports += 1
                if imp.name:
                    fname = imp.name.decode('utf-8', errors='replace')
                    fname_lower = fname.lower()
                    if fname_lower in SUSPICIOUS_APIS:
                        suspicious_found.append(f"{dll_name}!{fname}")
                    if fname_lower in NET_APIS:
                        net_found.append(f"{dll_name}!{fname}")
                    func_names.append(fname)
                else:
                    func_names.append(f"Ord({imp.ordinal})")
            print(f"  {dll_name} ({len(func_names)} imports)")
            # Show first few imports
            sample = ", ".join(func_names[:5])
            if len(func_names) > 5:
                sample += f", ... (+{len(func_names)-5} more)"
            print(f"    Sample: {sample}")
    else:
        print("  None (No import directory - very unusual for uncompressed DLLs).")

    print(f"\nTotal imported functions: {total_imports}")
    if suspicious_found:
        print(f" [!] POTENTIALLY SUSPICIOUS APIs ({len(suspicious_found)}):")
        for s in suspicious_found:
            print(f"      - {s}")
    else:
        print(" [*] No high-risk process injection/infostealer APIs found in static imports.")

    if net_found:
        print(f" [!] NETWORK/SOCKET APIs ({len(net_found)}):")
        for n in net_found:
            print(f"      - {n}")
    else:
        print(" [*] No raw socket or WinHTTP network APIs found in static imports.")

    # Resources
    print("\n--- Resources ---")
    if hasattr(pe, 'DIRECTORY_ENTRY_RESOURCE'):
        res_types = []
        for res_type in pe.DIRECTORY_ENTRY_RESOURCE.entries:
            type_name = pefile.RESOURCE_TYPE.get(res_type.struct.Id, str(res_type.struct.Id))
            res_types.append(str(type_name))
        print(f"  Resource types present: {', '.join(res_types)}")
    else:
        print("  No resources found.")

    # String & Pattern Scanning
    print("\n--- String & Pattern Analysis ---")
    for tag, pattern in RE_PATTERNS:
        matches = set()
        for match in pattern.finditer(file_bytes):
            val = match.group(0).decode('utf-8', errors='replace').strip()
            # Filter noise
            if tag == "IPv4":
                # Filter common loopbacks, version numbers, or zeros
                if val.startswith("0.") or val.startswith("127.") or val == "255.255.255.255":
                    continue
                parts = [int(p) for p in val.split(".") if p.isdigit()]
                if len(parts) != 4 or any(p > 255 for p in parts):
                    continue
            matches.add(val)

        if matches:
            print(f"  [{tag}] ({len(matches)} matches):")
            for m in list(matches)[:15]:
                print(f"    - {m}")
            if len(matches) > 15:
                print(f"    ... and {len(matches) - 15} more.")
        else:
            if tag in ("DiscordWebhook", "Telegram", "BrowserCreds", "CryptoWallet", "Persistence"):
                print(f"  [*] {tag}: Clean (0 matches)")

def main():
    dump_configs()
    for fp in FILES:
        analyze_pe(fp)

if __name__ == "__main__":
    main()

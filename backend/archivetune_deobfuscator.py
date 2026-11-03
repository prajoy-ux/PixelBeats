"""
ArchiveTune MoriDeobfuscator - Python Port
Handles signature deciphering (Reverse, Swap, Splice) and signatureTimestamp fetching from YouTube base.js.
Matches com.archivetune.deobfuscator.MoriDeobfuscator from ArchiveTune.
"""

import re
import logging
import requests
from typing import Optional, List, Dict, Any

logger = logging.getLogger("pixelbeats.archivetune_deobfuscator")

class MoriDeobfuscator:
    _cached_base_js: Optional[str] = None
    _cached_timestamp: int = 19800

    @classmethod
    def get_signature_timestamp(cls) -> int:
        if cls._cached_base_js is None:
            cls.fetch_base_js()
        return cls._cached_timestamp

    @classmethod
    def fetch_base_js(cls):
        try:
            req_headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
            }
            resp = requests.get("https://music.youtube.com", headers=req_headers, timeout=5)
            if resp.status_code == 200:
                html = resp.text
                js_match = re.search(r'/s/player/[a-zA-Z0-9_-]+/player_ias\.vflset/[a-zA-Z0-9_-]+/base\.js', html)
                if js_match:
                    js_path = js_match.group(0)
                    js_resp = requests.get(f"https://music.youtube.com{js_path}", headers=req_headers, timeout=5)
                    if js_resp.status_code == 200:
                        cls._cached_base_js = js_resp.text
                        sts_match = re.search(r'signatureTimestamp:(\d+)', js_resp.text)
                        if sts_match:
                            cls._cached_timestamp = int(sts_match.group(1))
                            logger.info(f"Fetched YouTube signatureTimestamp: {cls._cached_timestamp}")
        except Exception as e:
            logger.warning(f"Failed to fetch base.js signatureTimestamp: {e}")

    @staticmethod
    def decipher_signature(s: str, operations: List[Dict[str, Any]]) -> str:
        """
        Deciphers a scrambled signature string according to YouTube's 3 primitive operations:
        - reverse
        - swap (first char with index i)
        - splice (delete first i chars)
        """
        chars = list(s)
        for op in operations:
            op_type = op.get("type")
            if op_type == "reverse":
                chars.reverse()
            elif op_type == "swap":
                idx = op.get("index", 0) % len(chars)
                chars[0], chars[idx] = chars[idx], chars[0]
            elif op_type == "splice":
                count = op.get("count", 0)
                chars = chars[count:]
        return "".join(chars)

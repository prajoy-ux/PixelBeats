"""
ArchiveTune Lyrics Helper - Python Port
Dual-engine lyrics retrieval: SimpMusic (Piped) + LRCLib with candidate duration matching & LRC timestamp parsing.
Matches com.archivetune.lyrics.LyricsHelper from ArchiveTune.
"""

import re
import urllib.parse
import logging
import requests
from typing import Optional, List, Dict, Any

logger = logging.getLogger("pixelbeats.archivetune_lyrics")

NOISE_REGEX = re.compile(
    r"\((Official|Lyric|Audio|Video|Visualizer|HD|4K|feat\..*?|ft\..*?)\)",
    re.IGNORECASE
)
BRACKET_NOISE_REGEX = re.compile(
    r"\[(Official|Lyric|Audio|Video|Visualizer|HD|4K|feat\..*?|ft\..*?)\]",
    re.IGNORECASE
)
LRC_LINE_REGEX = re.compile(r"^\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)$")

def clean_title(title: str) -> str:
    """Removes noise words like '(Official Video)', '(Audio)', etc."""
    cleaned = NOISE_REGEX.sub("", title)
    cleaned = BRACKET_NOISE_REGEX.sub("", cleaned)
    return cleaned.strip()

def parse_duration_to_seconds(dur_str: Optional[str]) -> int:
    if not dur_str or dur_str == "--:--":
        return 0
    try:
        parts = [int(p) for p in dur_str.strip().split(":")]
        if len(parts) == 2:
            return parts[0] * 60 + parts[1]
        elif len(parts) == 3:
            return parts[0] * 3600 + parts[1] * 60 + parts[2]
    except Exception:
        pass
    return 0

def parse_lrc(lrc_text: str, video_id: str, source: str) -> List[Dict[str, Any]]:
    """
    Parses standard LRC synced format into millisecond/second timestamped lines.
    """
    lines: List[Dict[str, Any]] = []
    for raw in lrc_text.splitlines():
        line = raw.strip()
        if not line:
            continue
        m = LRC_LINE_REGEX.match(line)
        if m:
            mins = int(m.group(1))
            secs = int(m.group(2))
            ms_str = m.group(3)
            # Normalize 2 digits (centiseconds) to ms, or 3 digits
            millis = int(ms_str) * (10 if len(ms_str) == 2 else 1)
            total_seconds = mins * 60 + secs + (millis / 1000.0)
            text = m.group(4).strip()
            lines.append({
                "time": round(total_seconds, 2),
                "text": text
            })
    return lines

def fetch_simp_music(video_id: str) -> Optional[List[Dict[str, Any]]]:
    """1. SimpMusic / Piped lyrics query by videoId."""
    piped_instances = [
        "https://pipedapi.kavin.rocks",
        "https://api.piped.private.coffee",
        "https://pipedapi.in.projectsegfau.lt"
    ]
    for base in piped_instances:
        try:
            url = f"{base}/lyrics?videoId={video_id}"
            resp = requests.get(url, headers={"User-Agent": "ArchiveTune/1.0"}, timeout=3)
            if resp.status_code == 200 and resp.text:
                parsed = parse_lrc(resp.text, video_id, "SimpMusic")
                if parsed:
                    return parsed
        except Exception:
            continue
    return None

def fetch_lrclib(title: str, artist: str, duration_sec: int, video_id: str) -> Optional[List[Dict[str, Any]]]:
    """2. LRCLib exact search and candidate filtering with duration tolerance."""
    cleaned = clean_title(title)
    q_title = urllib.parse.quote(cleaned)
    q_artist = urllib.parse.quote(artist)

    # A: Direct get if exact
    try:
        get_url = f"https://lrclib.net/api/get?track_name={q_title}&artist_name={q_artist}"
        if duration_sec > 0:
            get_url += f"&duration={duration_sec}"
        r = requests.get(get_url, headers={"User-Agent": "ArchiveTune/1.0"}, timeout=3)
        if r.status_code == 200:
            item = r.json()
            if item.get("instrumental"):
                return [{"time": 0.0, "text": "♪ Instrumental ♪"}]
            synced = item.get("syncedLyrics")
            if synced:
                parsed = parse_lrc(synced, video_id, "LRCLib")
                if parsed:
                    return parsed
    except Exception:
        pass

    # B: Search API
    try:
        search_url = f"https://lrclib.net/api/search?track_name={q_title}&artist_name={q_artist}"
        r = requests.get(search_url, headers={"User-Agent": "ArchiveTune/1.0"}, timeout=4)
        if r.status_code == 200:
            array = r.json()
            if isinstance(array, list):
                for item in array:
                    cand_dur = int(item.get("duration") or 0)
                    if duration_sec > 0 and abs(cand_dur - duration_sec) > 4:
                        continue
                    if item.get("instrumental"):
                        return [{"time": 0.0, "text": "♪ Instrumental ♪"}]
                    synced = item.get("syncedLyrics")
                    if synced:
                        parsed = parse_lrc(synced, video_id, "LRCLib")
                        if parsed:
                            return parsed
    except Exception:
        pass

    # C: Fuzzy search by combined query if artist was complex
    try:
        combined = urllib.parse.quote(f"{cleaned} {artist}".strip())
        s_url = f"https://lrclib.net/api/search?q={combined}"
        r = requests.get(s_url, headers={"User-Agent": "ArchiveTune/1.0"}, timeout=3)
        if r.status_code == 200:
            array = r.json()
            if isinstance(array, list):
                for item in array:
                    synced = item.get("syncedLyrics")
                    if synced:
                        parsed = parse_lrc(synced, video_id, "LRCLib")
                        if parsed:
                            return parsed
    except Exception:
        pass

    return None

def get_lyrics(
    video_id: str,
    title: str,
    artist: str,
    duration: Optional[str] = None
) -> Dict[str, Any]:
    """
    Waterfall lyrics retrieval:
    1. SimpMusic (direct videoId lookup)
    2. LRCLib (title/artist search with duration tolerance <= 4s)
    """
    dur_sec = parse_duration_to_seconds(duration)

    # 1. SimpMusic
    lyrics = fetch_simp_music(video_id)
    if lyrics:
        return {"source": "SimpMusic", "lines": lyrics}

    # 2. LRCLib
    lyrics = fetch_lrclib(title, artist, dur_sec, video_id)
    if lyrics:
        return {"source": "LRCLib", "lines": lyrics}

    return {"source": "none", "lines": []}

"""
ArchiveTune Player Utils - Python Port
Directly resolves highest quality audio streams using the proven ArchiveTune iOS client profile.
Bypasses YouTube's LOGIN_REQUIRED bot wall and provides direct unthrottled streams.
"""

import logging
import requests
from typing import Optional, Dict, Any, List

logger = logging.getLogger("pixelbeats.archivetune_player")

IOS_CLIENT = {
    "clientName": "IOS",
    "clientVersion": "20.03.02",
    "deviceMake": "Apple",
    "deviceModel": "iPhone16,2",
    "hl": "en",
    "gl": "US",
    "osName": "iOS",
    "osVersion": "18.3.2.22D82"
}

IOS_HEADERS = {
    "User-Agent": "com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_3_2 like Mac OS X;)",
    "X-YouTube-Client-Name": "5",
    "X-YouTube-Client-Version": "20.03.02",
    "Content-Type": "application/json"
}

def resolve_archivetune_stream(video_id: str) -> Optional[Dict[str, Any]]:
    """
    Queries YouTube InnerTube player endpoint with the exact ArchiveTune iOS client profile.
    Returns stream details or None.
    """
    try:
        payload = {
            "context": {
                "client": IOS_CLIENT
            },
            "videoId": video_id,
            "playbackContext": {
                "contentPlaybackContext": {
                    "html5Preference": "HTML5_PREF_WANTS"
                }
            },
            "contentCheckOk": True,
            "racyCheckOk": True
        }

        resp = requests.post(
            "https://www.youtube.com/youtubei/v1/player?prettyPrint=false",
            json=payload,
            headers=IOS_HEADERS,
            timeout=8
        )
        if resp.status_code != 200:
            logger.warning(f"ArchiveTune player query returned status {resp.status_code} for {video_id}")
            return None

        data = resp.json()
        playability = data.get("playabilityStatus", {}).get("status")
        if playability != "OK":
            reason = data.get("playabilityStatus", {}).get("reason", "Unknown playability reason")
            logger.warning(f"ArchiveTune playabilityStatus is {playability} for {video_id}: {reason}")
            return None

        streaming_data = data.get("streamingData", {})
        adaptive_formats: List[Dict[str, Any]] = streaming_data.get("adaptiveFormats", [])
        if not adaptive_formats:
            return None

        # Filter audio formats with direct valid URLs
        audio_formats = [
            f for f in adaptive_formats
            if f.get("mimeType", "").startswith("audio/") and f.get("url")
        ]

        if not audio_formats:
            return None

        # Preference matching ArchiveTune YTPlayerUtils:
        # itag 251 (Opus ~160k) or itag 140 (AAC 128k) or highest bitrate
        preferred = next((f for f in audio_formats if f.get("itag") == 251), None)
        if not preferred:
            preferred = next((f for f in audio_formats if f.get("itag") == 140), None)
        if not preferred:
            preferred = max(audio_formats, key=lambda f: f.get("bitrate", 0))

        raw_url = preferred.get("url")
        if not raw_url:
            return None

        # ArchiveTune unthrottling range tag:
        # Appends &range=0-9999999 to bypass YouTube single-connection bandwidth cap
        unthrottled_url = raw_url
        if "&range=" not in unthrottled_url:
            unthrottled_url = f"{unthrottled_url}&range=0-9999999"

        # Extract video details
        v_details = data.get("videoDetails", {})
        title = v_details.get("title", "Unknown Title")
        artist = v_details.get("author", "Unknown Artist")
        duration_sec = int(v_details.get("lengthSeconds", 0)) if v_details.get("lengthSeconds") else 0
        mins = duration_sec // 60
        secs = duration_sec % 60
        duration_str = f"{mins:02d}:{secs:02d}"

        # Thumbnails
        thumbs = v_details.get("thumbnail", {}).get("thumbnails", [])
        thumbnail_url = thumbs[-1].get("url") if thumbs else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

        # Loudness
        player_config = data.get("playerConfig", {})
        loudness_db = player_config.get("audioConfig", {}).get("loudnessDb")

        return {
            "videoId": video_id,
            "stream_url": unthrottled_url,
            "raw_url": raw_url,
            "title": title,
            "artist": artist,
            "duration": duration_str,
            "durationSeconds": duration_sec,
            "thumbnail": thumbnail_url,
            "itag": preferred.get("itag"),
            "bitrate": preferred.get("bitrate", 128000),
            "mimeType": preferred.get("mimeType", "audio/mp4"),
            "contentLength": preferred.get("contentLength"),
            "loudnessDb": loudness_db,
            "source": "ArchiveTune-iOS"
        }

    except Exception as e:
        logger.error(f"Error in resolve_archivetune_stream for {video_id}: {e}")
        return None

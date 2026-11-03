"""
ArchiveTune InnerTube Client - Python Port
Direct, lightweight YouTube Music search and queue endpoints via WEB_REMIX client context.
Matches com.archivetune.core.InnerTubeClient from ArchiveTune.
"""

import logging
import requests
from typing import List, Dict, Any, Optional

logger = logging.getLogger("pixelbeats.archivetune_innertube")

BASE_URL = "https://music.youtube.com/youtubei/v1"
WEB_REMIX_CLIENT = {
    "clientName": "WEB_REMIX",
    "clientVersion": "1.20260101.01.00",
    "hl": "en",
    "gl": "US"
}

WEB_REMIX_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://music.youtube.com/",
    "Content-Type": "application/json"
}

def search_tracks(query: str, limit: int = 20) -> List[Dict[str, Any]]:
    """
    Direct song search on music.youtube.com using ArchiveTune's filtered InnerTube call.
    Filtered to songs: params = 'EgWKAQIIAWoMCAMQBBAFEAkQChAF'
    """
    try:
        payload = {
            "context": {
                "client": WEB_REMIX_CLIENT
            },
            "query": query,
            "params": "EgWKAQIIAWoMCAMQBBAFEAkQChAF"
        }

        resp = requests.post(
            f"{BASE_URL}/search?prettyPrint=false",
            json=payload,
            headers=WEB_REMIX_HEADERS,
            timeout=8
        )
        if resp.status_code != 200:
            logger.warning(f"InnerTube search failed with status {resp.status_code}")
            return []

        data = resp.json()
        tracks: List[Dict[str, Any]] = []

        tabs = data.get("contents", {}).get("tabbedSearchResultsRenderer", {}).get("tabs", [])
        if not tabs:
            return []

        tab_content = tabs[0].get("tabRenderer", {}).get("content", {})
        section_list = tab_content.get("sectionListRenderer", {}).get("contents", [])

        for section in section_list:
            shelf = section.get("musicShelfRenderer", {})
            items = shelf.get("contents", [])
            for item in items:
                flex = item.get("musicResponsiveListItemRenderer")
                if not flex:
                    continue

                track = parse_flex_item(flex)
                if track:
                    tracks.append(track)
                    if len(tracks) >= limit:
                        break
            if len(tracks) >= limit:
                break

        return tracks
    except Exception as e:
        logger.error(f"Error in ArchiveTune search_tracks for '{query}': {e}")
        return []

def get_next_queue(video_id: str, limit: int = 25) -> List[Dict[str, Any]]:
    """
    Directly fetches Up Next queue for radio / auto-cycle using ArchiveTune's InnerTube next endpoint.
    """
    try:
        payload = {
            "context": {
                "client": WEB_REMIX_CLIENT
            },
            "videoId": video_id,
            "isAudioOnly": True
        }

        resp = requests.post(
            f"{BASE_URL}/next?prettyPrint=false",
            json=payload,
            headers=WEB_REMIX_HEADERS,
            timeout=8
        )
        if resp.status_code != 200:
            logger.warning(f"InnerTube next queue failed with status {resp.status_code}")
            return []

        data = resp.json()
        tracks: List[Dict[str, Any]] = []

        tabs = (
            data.get("contents", {})
            .get("singleColumnMusicWatchNextResultsRenderer", {})
            .get("tabbedRenderer", {})
            .get("watchNextTabbedResultsRenderer", {})
            .get("tabs", [])
        )
        if not tabs:
            return []

        queue_tab = next(
            (t for t in tabs if t.get("tabRenderer", {}).get("title") == "Up next"
             or "musicQueueRenderer" in t.get("tabRenderer", {}).get("content", {})),
            tabs[0]
        )

        queue_renderer = (
            queue_tab.get("tabRenderer", {})
            .get("content", {})
            .get("musicQueueRenderer", {})
        )
        items = (
            queue_renderer.get("content", {})
            .get("playlistPanelRenderer", {})
            .get("contents", [])
        )

        for item in items:
            video_renderer = item.get("playlistPanelVideoRenderer")
            if not video_renderer:
                continue

            vid = video_renderer.get("videoId")
            if not vid or vid == video_id:
                continue

            title_runs = video_renderer.get("title", {}).get("runs", [])
            title = title_runs[0].get("text", "Unknown Title") if title_runs else "Unknown Title"

            byline_runs = video_renderer.get("longBylineText", {}).get("runs", [])
            artist = byline_runs[0].get("text", "Unknown Artist") if byline_runs else "Unknown Artist"

            length_runs = video_renderer.get("lengthText", {}).get("runs", [])
            duration = length_runs[0].get("text", "--:--") if length_runs else "--:--"

            thumbs = video_renderer.get("thumbnail", {}).get("thumbnails", [])
            thumbnail = thumbs[-1].get("url") if thumbs else f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
            if "=w120-h120" in thumbnail:
                thumbnail = thumbnail.replace("=w120-h120", "=w544-h544")

            tracks.append({
                "videoId": vid,
                "title": title,
                "artist": artist,
                "album": "Up Next Radio",
                "duration": duration,
                "thumbnail": thumbnail
            })
            if len(tracks) >= limit:
                break

        return tracks
    except Exception as e:
        logger.error(f"Error in ArchiveTune get_next_queue for {video_id}: {e}")
        return []

def parse_flex_item(item: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    flex_cols = item.get("flexColumns", [])
    if not flex_cols:
        return None

    # Title & Video ID
    col1_renderer = flex_cols[0].get("musicResponsiveListItemFlexColumnRenderer", {})
    col1_runs = col1_renderer.get("text", {}).get("runs", [])
    if not col1_runs:
        return None

    title = col1_runs[0].get("text")
    if not title:
        return None

    nav = col1_runs[0].get("navigationEndpoint", {})
    video_id = (
        nav.get("watchEndpoint", {}).get("videoId")
        or item.get("playlistItemData", {}).get("videoId")
    )
    if not video_id:
        return None

    # Artist & Duration from Column 2
    artist = "Unknown Artist"
    duration = "--:--"
    album = "Single"

    if len(flex_cols) > 1:
        col2_renderer = flex_cols[1].get("musicResponsiveListItemFlexColumnRenderer", {})
        col2_runs = col2_renderer.get("text", {}).get("runs", [])
        texts = [r.get("text", "") for r in col2_runs if r.get("text") and r.get("text") != " • "]
        if texts:
            artist = texts[0]
            # Duration is typically the last text containing colon
            dur_candidate = next((t for t in reversed(texts) if ":" in t), None)
            if dur_candidate:
                duration = dur_candidate
            # Album is often in between artist and duration
            if len(texts) >= 3 and texts[1] != duration:
                album = texts[1]

    # Thumbnail
    thumbs = (
        item.get("thumbnail", {})
        .get("musicThumbnailRenderer", {})
        .get("thumbnail", {})
        .get("thumbnails", [])
    )
    thumbnail = thumbs[-1].get("url") if thumbs else f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
    if "=w120-h120" in thumbnail:
        thumbnail = thumbnail.replace("=w120-h120", "=w544-h544")

    return {
        "videoId": video_id,
        "title": title,
        "artist": artist,
        "album": album,
        "duration": duration,
        "thumbnail": thumbnail
    }

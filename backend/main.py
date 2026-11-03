import re
import os
import time
import random
import logging
import threading
import concurrent.futures
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Query, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import requests
from ytmusicapi import YTMusic
import yt_dlp

# ArchiveTune core engines
from archivetune_player import resolve_archivetune_stream
from archivetune_innertube import search_tracks as archivetune_search, get_next_queue as archivetune_next_queue
from archivetune_lyrics import get_lyrics as archivetune_get_lyrics
from archivetune_deobfuscator import MoriDeobfuscator

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pixelbeats")

app = FastAPI(
    title="PixelBeats Backend API (ArchiveTune Powered)",
    description="High-performance, ad-free retro music streaming extractor API powered by ArchiveTune InnerTube engine",
    version="2.0.0"
)

# Enable full CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YTMusic lazily
try:
    yt_music = YTMusic()
except Exception as e:
    logger.warning(f"Failed to initialize YTMusic with default settings: {e}. Will lazily retry.")
    yt_music = None

# Simple in-memory cache with TTL
CACHE: Dict[str, Dict[str, Any]] = {}

def get_from_cache(key: str) -> Optional[Any]:
    item = CACHE.get(key)
    if not item:
        return None
    if time.time() > item["expires"]:
        del CACHE[key]
        return None
    return item["data"]

def set_in_cache(key: str, data: Any, ttl_seconds: int = 900):
    CACHE[key] = {
        "data": data,
        "expires": time.time() + ttl_seconds
    }

class Song(BaseModel):
    videoId: str
    title: str
    artist: str
    album: Optional[str] = "Single"
    duration: Optional[str] = "--:--"
    thumbnail: Optional[str] = ""

class StreamInfo(BaseModel):
    videoId: str
    stream_url: str
    proxy_url: Optional[str] = ""
    title: str
    artist: str
    thumbnail: Optional[str] = ""
    duration: Optional[str] = "--:--"
    loudnessDb: Optional[float] = None
    bitrate: Optional[int] = None
    itag: Optional[int] = None
    source: Optional[str] = "ArchiveTune-iOS"

class LyricLine(BaseModel):
    time: float
    text: str

class LyricsResponse(BaseModel):
    videoId: str
    source: str
    lines: List[LyricLine]

def format_duration(seconds: Optional[int]) -> str:
    if seconds is None:
        return "--:--"
    mins = int(seconds) // 60
    secs = int(seconds) % 60
    return f"{mins:02d}:{secs:02d}"

@app.get("/api")
def root():
    return {
        "name": "PixelBeats API",
        "engine": "ArchiveTune InnerTube Core",
        "status": "online",
        "version": "2.0.0",
        "endpoints": [
            "/api/search?q={query}",
            "/api/stream?id={videoId}",
            "/api/lyrics?id={videoId}&title={title}&artist={artist}",
            "/api/recommendations?videoId={videoId}",
            "/api/trending",
            "/api/albums?q={query}",
            "/api/album?browseId={id}",
            "/api/playlist?url={playlist_url}",
            "/api/proxy?url={stream_url}",
            "/api/health"
        ]
    }

@app.api_route("/api/health", methods=["GET", "HEAD"])
def health():
    return {
        "status": "ok",
        "engine": "ArchiveTune Core",
        "timestamp": time.time()
    }

@app.get("/api/search", response_model=List[Song])
def search_songs(q: str = Query(..., min_length=1, description="Search term")):
    cache_key = f"search:{q.strip().lower()}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    results: List[Song] = []

    # 1. ArchiveTune InnerTube WEB_REMIX Search (Instant ~250ms direct API call)
    try:
        at_tracks = archivetune_search(q, limit=20)
        if at_tracks:
            for item in at_tracks:
                results.append(Song(
                    videoId=item["videoId"],
                    title=item["title"],
                    artist=item["artist"],
                    album=item.get("album", "Single"),
                    duration=item.get("duration", "--:--"),
                    thumbnail=item.get("thumbnail", "")
                ))
            logger.info(f"ArchiveTune search resolved {len(results)} songs for '{q}'")
    except Exception as e:
        logger.warning(f"ArchiveTune search notice for '{q}': {e}")

    # 2. Fall back to ytmusicapi if ArchiveTune returned empty
    if not results:
        global yt_music
        try:
            if yt_music is None:
                yt_music = YTMusic()
            
            raw_results = yt_music.search(q, filter="songs")
            for item in raw_results:
                video_id = item.get("videoId")
                if not video_id:
                    continue

                title = item.get("title", "Unknown Title")
                artists = item.get("artists", [])
                artist_name = ", ".join([a.get("name", "") for a in artists if a.get("name")]) if artists else "Unknown Artist"
                album = item.get("album", {})
                album_name = album.get("name", "Single") if album else "Single"
                duration = item.get("duration", "--:--")
                thumbnails = item.get("thumbnails", [])
                thumbnail_url = ""
                if thumbnails:
                    sorted_thumbs = sorted(thumbnails, key=lambda x: (x.get("width", 0) * x.get("height", 0)), reverse=True)
                    thumbnail_url = sorted_thumbs[0].get("url", "")
                if not thumbnail_url:
                    thumbnail_url = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
                if "=w120-h120" in thumbnail_url:
                    thumbnail_url = thumbnail_url.replace("=w120-h120", "=w544-h544")

                results.append(Song(
                    videoId=video_id,
                    title=title,
                    artist=artist_name,
                    album=album_name,
                    duration=duration,
                    thumbnail=thumbnail_url
                ))
                if len(results) >= 20:
                    break
        except Exception as e:
            logger.warning(f"ytmusicapi search error for '{q}': {e}. Falling back to yt-dlp.")

    # 3. Fall back to yt-dlp if ytmusicapi also failed
    if not results:
        try:
            ydl_opts = {
                'quiet': True,
                'no_warnings': True,
                'extract_flat': True,
                'skip_download': True,
                'noplaylist': True,
            }
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                search_query = f"ytsearch15:{q}"
                info = ydl.extract_info(search_query, download=False)
                if 'entries' in info:
                    for entry in info['entries']:
                        if not entry:
                            continue
                        vid = entry.get('id')
                        if not vid:
                            continue
                        title = entry.get('title', 'Unknown')
                        uploader = entry.get('uploader') or entry.get('channel') or 'Unknown Artist'
                        dur = format_duration(entry.get('duration'))
                        thumb = entry.get('thumbnail', '')
                        results.append(Song(
                            videoId=vid,
                            title=title,
                            artist=uploader,
                            album="Single",
                            duration=dur,
                            thumbnail=thumb
                        ))
        except Exception as e:
            logger.error(f"yt-dlp fallback search error for '{q}': {e}")
            raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")

    set_in_cache(cache_key, [r.model_dump() for r in results], ttl_seconds=1800)
    return results

@app.api_route("/api/stream", methods=["GET", "HEAD"], response_model=StreamInfo)
def extract_stream(id: str = Query(..., min_length=1, description="YouTube Video ID or URL")):
    cache_key = f"stream:{id}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    clean_vid = id.split("v=")[-1].split("&")[0] if "v=" in id else id

    # 1. ArchiveTune Direct InnerTube iOS Resolution
    # (Ultra-fast <300ms, direct Opus 160k / AAC 128k, bypasses bot wall & login requirements)
    if len(clean_vid) == 11 or not clean_vid.startswith("http"):
        try:
            at_res = resolve_archivetune_stream(clean_vid)
            if at_res:
                stream_url = at_res["stream_url"]
                proxy_url = f"/api/proxy?url={requests.utils.quote(stream_url)}"
                stream_info = StreamInfo(
                    videoId=clean_vid,
                    stream_url=stream_url,
                    proxy_url=proxy_url,
                    title=at_res["title"],
                    artist=at_res["artist"],
                    thumbnail=at_res["thumbnail"],
                    duration=at_res["duration"],
                    loudnessDb=at_res.get("loudnessDb"),
                    bitrate=at_res.get("bitrate"),
                    itag=at_res.get("itag"),
                    source="ArchiveTune-iOS"
                )
                logger.info(f"ArchiveTune resolved stream for {clean_vid}: {at_res['title']} ({at_res.get('bitrate')} bps)")
                set_in_cache(cache_key, stream_info.model_dump(), ttl_seconds=14400)
                return stream_info
        except Exception as e:
            logger.warning(f"ArchiveTune resolution failed for {clean_vid}: {e}. Falling back to yt-dlp.")

    # 2. Fallback to yt-dlp
    url = id if id.startswith("http") else f"https://www.youtube.com/watch?v={id}"
    ydl_opts = {
        'format': 'bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio/best',
        'quiet': True,
        'no_warnings': True,
        'noplaylist': True,
        'extract_flat': False,
        'skip_download': True,
        'cachedir': False,
        'socket_timeout': 10,
        'http_headers': {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            stream_url = info.get('url')
            
            if not stream_url:
                formats = info.get('formats', [])
                audio_formats = [f for f in formats if f.get('vcodec') == 'none' and f.get('url')]
                if audio_formats:
                    audio_formats.sort(key=lambda x: x.get('abr') or 0, reverse=True)
                    stream_url = audio_formats[0].get('url')
                elif formats:
                    stream_url = formats[-1].get('url')

            if not stream_url:
                raise HTTPException(status_code=404, detail="Could not extract direct audio stream URL")

            title = info.get('title', 'Unknown Title')
            artist = info.get('artist') or info.get('uploader') or info.get('channel') or 'Unknown Artist'
            thumbnail = info.get('thumbnail', '')
            duration = format_duration(info.get('duration'))
            video_id = info.get('id', id)

            proxy_url = f"/api/proxy?url={requests.utils.quote(stream_url)}"
            stream_info = StreamInfo(
                videoId=video_id,
                stream_url=stream_url,
                proxy_url=proxy_url,
                title=title,
                artist=artist,
                thumbnail=thumbnail,
                duration=duration,
                source="yt-dlp"
            )
            set_in_cache(cache_key, stream_info.model_dump(), ttl_seconds=14400)
            return stream_info

    except Exception as e:
        logger.error(f"yt-dlp extraction failed for id {id}: {e}")

        # 3. Third-party Piped/Invidious mirror fallback
        try:
            invidious_endpoints = [
                f"https://invidious.f5.si/api/v1/videos/{clean_vid}",
                f"https://invidious.projectsegfau.lt/api/v1/videos/{clean_vid}"
            ]
            for endpoint in invidious_endpoints:
                try:
                    resp = requests.get(endpoint, timeout=4)
                    if resp.status_code == 200:
                        data = resp.json()
                        adaptive = data.get("adaptiveFormats", [])
                        audio_streams = [f for f in adaptive if f.get("type", "").startswith("audio/") and f.get("url")]
                        if audio_streams:
                            audio_streams.sort(key=lambda x: int(x.get("bitrate", 0)), reverse=True)
                            chosen = audio_streams[0]
                            f_url = chosen.get("url")
                            stream_info = StreamInfo(
                                videoId=clean_vid,
                                stream_url=f_url,
                                proxy_url=f"/api/proxy?url={requests.utils.quote(f_url)}",
                                title=data.get("title", "Unknown Title"),
                                artist=data.get("author", "Unknown Artist"),
                                thumbnail=f"https://i.ytimg.com/vi/{clean_vid}/hqdefault.jpg",
                                duration=format_duration(data.get("lengthSeconds")),
                                source="invidious"
                            )
                            set_in_cache(cache_key, stream_info.model_dump(), ttl_seconds=14400)
                            return stream_info
                except Exception:
                    continue
        except Exception:
            pass

        raise HTTPException(status_code=500, detail=f"Failed to extract stream: {str(e)}")

# ================= SYNCHRONIZED LYRICS (ARCHIVETUNE DUAL-ENGINE) =================
@app.get("/api/lyrics", response_model=LyricsResponse)
def get_song_lyrics(
    id: str = Query(..., description="Video ID"),
    title: str = Query("", description="Song title"),
    artist: str = Query("", description="Artist name"),
    duration: Optional[str] = Query(None, description="Song duration")
):
    cache_key = f"lyrics:{id}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    result = archivetune_get_lyrics(id, title, artist, duration)
    response_data = {
        "videoId": id,
        "source": result.get("source", "none"),
        "lines": result.get("lines", [])
    }
    set_in_cache(cache_key, response_data, ttl_seconds=86400)
    return response_data

# ================= AUDIO STREAMING PROXY (SMART CHUNKED RANGE ENGINE) =================
@app.api_route("/api/proxy", methods=["GET", "HEAD"])
def proxy_stream(request: Request, url: str = Query(..., description="Direct audio stream URL")):
    try:
        req_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        range_header = request.headers.get("range")

        # Handle HEAD requests
        if request.method == "HEAD":
            try:
                # Probe with first byte to retrieve total size & content headers
                r = requests.get(url, headers={**req_headers, "Range": "bytes=0-1024"}, timeout=6)
                total_size = None
                cr = r.headers.get("content-range")
                if cr and "/" in cr:
                    total_size = cr.split("/")[-1]
                content_type = r.headers.get("content-type", "audio/mp4")
                if content_type.startswith("video/"):
                    content_type = content_type.replace("video/", "audio/")

                resp_headers = {
                    "Accept-Ranges": "bytes",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges",
                    "Content-Type": content_type
                }
                if total_size and total_size.isdigit():
                    resp_headers["Content-Length"] = total_size
                return Response(status_code=200, media_type=content_type, headers=resp_headers)
            except Exception:
                return Response(status_code=200, media_type="audio/mp4", headers={
                    "Accept-Ranges": "bytes",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges"
                })

        # Handle GET requests with Range (HTML5 audio, ExoPlayer, iOS/Android)
        if range_header and range_header.startswith("bytes="):
            rng = range_header.replace("bytes=", "").strip()
            parts = rng.split("-")
            start = int(parts[0]) if parts[0] else 0
            end = int(parts[1]) if len(parts) > 1 and parts[1] else None

            # Clamp single request slice to 256KB to satisfy YouTube CDN chunk rules
            MAX_CHUNK = 262144
            if end is None:
                fetch_end = start + MAX_CHUNK - 1
            else:
                fetch_end = min(end, start + MAX_CHUNK - 1)

            upstream_headers = {**req_headers, "Range": f"bytes={start}-{fetch_end}"}
            r = requests.get(url, headers=upstream_headers, stream=True, timeout=12)

            resp_headers = {
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges"
            }
            if "content-range" in r.headers:
                resp_headers["Content-Range"] = r.headers["content-range"]
            if "content-length" in r.headers:
                resp_headers["Content-Length"] = r.headers["content-length"]

            content_type = r.headers.get("content-type", "audio/mp4")
            if content_type.startswith("video/"):
                content_type = content_type.replace("video/", "audio/")

            return StreamingResponse(
                r.iter_content(chunk_size=32768),
                status_code=r.status_code if r.status_code in [200, 206] else 206,
                media_type=content_type,
                headers=resp_headers
            )

        # GET request without Range: sequential chunk generator to avoid CDN 403
        def iter_sequential_chunks():
            offset = 0
            CHUNK_SIZE = 262144
            while True:
                h = {**req_headers, "Range": f"bytes={offset}-{offset + CHUNK_SIZE - 1}"}
                resp = requests.get(url, headers=h, timeout=12)
                if resp.status_code not in [200, 206] or not resp.content:
                    break
                yield resp.content
                offset += len(resp.content)
                cr = resp.headers.get("content-range")
                if cr and "/" in cr:
                    tot = cr.split("/")[-1]
                    if tot.isdigit() and offset >= int(tot):
                        break
                if len(resp.content) < CHUNK_SIZE:
                    break

        return StreamingResponse(
            iter_sequential_chunks(),
            status_code=200,
            media_type="audio/mp4",
            headers={
                "Accept-Ranges": "bytes",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Expose-Headers": "Content-Range, Content-Length, Accept-Ranges"
            }
        )
    except Exception as e:
        logger.error(f"Proxy streaming error: {e}")
        raise HTTPException(status_code=500, detail=f"Proxy error: {str(e)}")

# Image Proxy: Allows canvas/browser to load any cross-origin thumbnail cleanly
@app.api_route("/api/image_proxy", methods=["GET", "HEAD"])
def image_proxy(url: str = Query(..., description="Image URL")):
    try:
        req_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        r = requests.get(url, headers=req_headers, timeout=10)
        content_type = r.headers.get("content-type", "image/jpeg")
        return Response(
            content=r.content,
            media_type=content_type,
            headers={
                "Access-Control-Allow-Origin": "*",
                "Cache-Control": "public, max-age=86400"
            }
        )
    except Exception as e:
        logger.error(f"Image proxy error for {url}: {e}")
        raise HTTPException(status_code=500, detail=f"Image proxy error: {str(e)}")

# Download endpoint
@app.get("/api/download")
def download_song(id: str = Query(..., description="Video ID"), title: Optional[str] = Query(None)):
    try:
        stream_info = extract_stream(id=id)
        if isinstance(stream_info, dict):
            stream_url = stream_info.get("stream_url")
            raw_title = title or stream_info.get("title")
        else:
            stream_url = getattr(stream_info, "stream_url", "")
            raw_title = title or getattr(stream_info, "title", "track")

        if not stream_url:
            raise HTTPException(status_code=404, detail="Stream URL not found")

        safe_title = re.sub(r'[\\/*?:"<>|]', "", raw_title).strip() or "track"
        filename = f"{safe_title}.mp3"

        req_headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
        }
        
        def iter_download_chunks():
            offset = 0
            CHUNK_SIZE = 262144
            while True:
                h = {**req_headers, "Range": f"bytes={offset}-{offset + CHUNK_SIZE - 1}"}
                resp = requests.get(stream_url, headers=h, timeout=15)
                if resp.status_code not in [200, 206] or not resp.content:
                    break
                yield resp.content
                offset += len(resp.content)
                cr = resp.headers.get("content-range")
                if cr and "/" in cr:
                    tot = cr.split("/")[-1]
                    if tot.isdigit() and offset >= int(tot):
                        break
                if len(resp.content) < CHUNK_SIZE:
                    break

        resp_headers = {
            "Content-Disposition": f'attachment; filename="{filename}"',
            "Content-Type": "audio/mpeg",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Expose-Headers": "Content-Disposition, Content-Length"
        }

        return StreamingResponse(
            iter_download_chunks(),
            status_code=200,
            headers=resp_headers
        )
    except Exception as e:
        logger.error(f"Download failed for {id}: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {str(e)}")

# Playlist extractor
@app.get("/api/playlist")
def extract_playlist(url: str = Query(..., min_length=1, description="Playlist URL")):
    cache_key = f"playlist:{url}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    ydl_opts = {
        'extract_flat': True,
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            playlist_title = info.get('title', 'Playlist')
            entries = info.get('entries', [])
            
            tracks = []
            for entry in entries:
                if not entry:
                    continue
                vid = entry.get('id')
                if not vid:
                    continue
                title = entry.get('title', 'Unknown Title')
                artist = entry.get('uploader') or entry.get('channel') or 'Unknown Artist'
                duration = format_duration(entry.get('duration'))
                thumbnail = entry.get('thumbnail', '')
                tracks.append({
                    "videoId": vid,
                    "title": title,
                    "artist": artist,
                    "duration": duration,
                    "thumbnail": thumbnail,
                    "album": playlist_title
                })

            result = {
                "title": playlist_title,
                "trackCount": len(tracks),
                "tracks": tracks
            }
            set_in_cache(cache_key, result, ttl_seconds=1800)
            return result
    except Exception as e:
        logger.error(f"Playlist extraction failed for {url}: {e}")
        raise HTTPException(status_code=500, detail=f"Playlist extraction failed: {str(e)}")

# Similar tracks (ArchiveTune Next Queue + Fallback)
@app.get("/api/similar", response_model=List[Song])
def get_similar_tracks(id: str = Query(..., description="Base Video ID")):
    cache_key = f"similar:{id}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    results: List[Song] = []

    # 1. ArchiveTune Next Queue
    try:
        at_queue = archivetune_next_queue(id, limit=20)
        if at_queue:
            for item in at_queue:
                results.append(Song(
                    videoId=item["videoId"],
                    title=item["title"],
                    artist=item["artist"],
                    album=item.get("album", "Single"),
                    duration=item.get("duration", "--:--"),
                    thumbnail=item.get("thumbnail", "")
                ))
    except Exception as e:
        logger.warning(f"ArchiveTune similar tracks lookup notice: {e}")

    # 2. Try ytmusicapi.get_watch_playlist
    if not results:
        global yt_music
        try:
            if yt_music is None:
                yt_music = YTMusic()
            watch_data = yt_music.get_watch_playlist(videoId=id, limit=25)
            tracks = watch_data.get("tracks", [])
            for t in tracks:
                vid = t.get("videoId")
                if not vid or vid == id:
                    continue
                title = t.get("title", "Unknown Title")
                artists = t.get("artists", [])
                artist_name = ", ".join([a.get("name", "") for a in artists if a.get("name")]) if artists else "Unknown Artist"
                album = t.get("album", {})
                album_name = album.get("name", "Single") if album else "Single"
                duration = t.get("length") or "--:--"
                thumbnails = t.get("thumbnail", []) or []
                thumbnail_url = ""
                if thumbnails:
                    sorted_thumbs = sorted(thumbnails, key=lambda x: (x.get("width", 0) * x.get("height", 0)), reverse=True)
                    thumbnail_url = sorted_thumbs[0].get("url", "")
                if not thumbnail_url:
                    thumbnail_url = f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
                if "=w120-h120" in thumbnail_url:
                    thumbnail_url = thumbnail_url.replace("=w120-h120", "=w544-h544")

                results.append(Song(
                    videoId=vid,
                    title=title,
                    artist=artist_name,
                    album=album_name,
                    duration=duration,
                    thumbnail=thumbnail_url
                ))
                if len(results) >= 20:
                    break
        except Exception as e:
            logger.warning(f"Similar tracks ytmusicapi lookup failed for {id}: {e}")

    set_in_cache(cache_key, [r.model_dump() for r in results], ttl_seconds=3600)
    return results

STOP_WORDS = {"the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "by", "from", "remix", "official", "video", "audio", "lyrics", "song", "version", "ft", "feat", "full"}

def extract_primary_keywords(title: str) -> List[str]:
    cleaned = re.sub(r'[\(\)\[\]\{\}\-_,.\?!:;\'"\/\\\|~`@#\$%\^&\*\+=]', ' ', title.lower())
    words = [w for w in cleaned.split() if len(w) > 2 and w not in STOP_WORDS]
    return words[:2]

# Diverse recommendations (ArchiveTune Next Queue + Deduplication Filter)
@app.api_route("/api/recommendations", methods=["GET", "HEAD"], response_model=List[Song])
def get_recommendations(
    videoId: str = Query(..., description="Base Video ID"),
    artist: Optional[str] = Query(None, description="Current Artist Name")
):
    cache_key = f"rec:{videoId}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    results: List[Song] = []

    # 1. ArchiveTune Next Queue
    try:
        at_queue = archivetune_next_queue(videoId, limit=35)
        if at_queue:
            seen_ids = {videoId}
            keyword_counts: Dict[str, int] = {}
            for t in at_queue:
                vid = t["videoId"]
                if vid in seen_ids:
                    continue
                title = t["title"]
                kw_list = extract_primary_keywords(title)
                if any(keyword_counts.get(kw, 0) >= 2 for kw in kw_list):
                    continue
                seen_ids.add(vid)
                for kw in kw_list:
                    keyword_counts[kw] = keyword_counts.get(kw, 0) + 1
                results.append(Song(
                    videoId=vid,
                    title=title,
                    artist=t["artist"],
                    album=t.get("album", "Up Next Radio"),
                    duration=t.get("duration", "--:--"),
                    thumbnail=t.get("thumbnail", "")
                ))
                if len(results) >= 20:
                    break
    except Exception as e:
        logger.warning(f"ArchiveTune recommendations notice: {e}")

    # Fallback if empty
    if not results:
        results = get_similar_tracks(id=videoId)

    set_in_cache(cache_key, [r.model_dump() for r in results], ttl_seconds=1800)
    return results

# Trending feed
TRENDING_ARTISTS_VIBES = [
    "A.R. Rahman hit song",
    "The Weeknd",
    "Arijit Singh melody",
    "Pritam hit song",
    "Arctic Monkeys",
    "Shreya Ghoshal",
    "Post Malone",
    "Anuv Jain"
]

@app.api_route("/api/trending", methods=["GET", "HEAD"], response_model=List[Song])
def get_trending():
    cache_key = "trending_curated"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    results: List[Song] = []
    seen_ids = set()
    keyword_counts: Dict[str, int] = {}

    def fetch_for_vibe(query: str) -> List[Dict[str, Any]]:
        try:
            # First try ArchiveTune search
            tracks = archivetune_search(query, limit=5)
            if tracks:
                return tracks
        except Exception:
            pass
        try:
            local_yt = yt_music or YTMusic()
            return local_yt.search(query, filter="songs") or []
        except Exception:
            return []

    try:
        collected: List[Song] = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
            future_to_vibe = {executor.submit(fetch_for_vibe, q): q for q in TRENDING_ARTISTS_VIBES}
            for future in concurrent.futures.as_completed(future_to_vibe):
                raw_items = future.result()
                added_for_vibe = 0
                for item in raw_items:
                    vid = item.get("videoId")
                    if not vid or vid in seen_ids:
                        continue
                    title = item.get("title", "Unknown Title")
                    kw_list = extract_primary_keywords(title)
                    if any(keyword_counts.get(kw, 0) >= 2 for kw in kw_list):
                        continue

                    artists = item.get("artists")
                    if isinstance(artists, list):
                        artist_name = ", ".join([a.get("name", "") for a in artists if a.get("name")])
                    elif isinstance(item.get("artist"), str):
                        artist_name = item.get("artist")
                    else:
                        artist_name = "Unknown Artist"

                    duration = item.get("duration") or "--:--"
                    thumbnail_url = item.get("thumbnail") or ""
                    if not thumbnail_url:
                        thumbnails = item.get("thumbnails", []) or []
                        if thumbnails:
                            sorted_thumbs = sorted(thumbnails, key=lambda x: (x.get("width", 0) * x.get("height", 0)), reverse=True)
                            thumbnail_url = sorted_thumbs[0].get("url", "")
                    if not thumbnail_url:
                        thumbnail_url = f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"

                    seen_ids.add(vid)
                    for kw in kw_list:
                        keyword_counts[kw] = keyword_counts.get(kw, 0) + 1

                    collected.append(Song(
                        videoId=vid,
                        title=title,
                        artist=artist_name,
                        album="Top Hits",
                        duration=duration,
                        thumbnail=thumbnail_url
                    ))
                    added_for_vibe += 1
                    if added_for_vibe >= 2:
                        break

        random.shuffle(collected)
        results = collected
    except Exception as e:
        logger.error(f"Failed to compile trending feed: {e}")

    if not results:
        results = search_songs(q="Top Hits 2026")

    set_in_cache(cache_key, [r.model_dump() for r in results], ttl_seconds=3600)
    return results

# ================= ALBUM MODELS & ENDPOINTS =================
class AlbumSummary(BaseModel):
    browseId: str
    title: str
    artist: str
    year: Optional[str] = ""
    thumbnail: Optional[str] = ""

class AlbumDetail(BaseModel):
    browseId: str
    title: str
    artist: str
    year: Optional[str] = ""
    trackCount: Optional[int] = 0
    duration: Optional[str] = "--:--"
    thumbnail: Optional[str] = ""
    tracks: List[Song]

@app.get("/api/albums", response_model=List[AlbumSummary])
def search_albums(q: str = Query(..., min_length=1, description="Album search term")):
    cache_key = f"albums:{q.strip().lower()}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    results: List[AlbumSummary] = []
    global yt_music

    try:
        if yt_music is None:
            yt_music = YTMusic()
        raw_albums = yt_music.search(q, filter="albums")
        for item in raw_albums:
            browse_id = item.get("browseId")
            if not browse_id:
                continue
            title = item.get("title", "Unknown Album")
            artists = item.get("artists", [])
            artist_name = ", ".join([a.get("name", "") for a in artists if a.get("name")]) if artists else "Unknown Artist"
            year = item.get("year", "")
            thumbnails = item.get("thumbnails", [])
            thumb_url = ""
            if thumbnails:
                sorted_thumbs = sorted(thumbnails, key=lambda x: (x.get("width", 0) * x.get("height", 0)), reverse=True)
                thumb_url = sorted_thumbs[0].get("url", "")
            if "=w120-h120" in thumb_url:
                thumb_url = thumb_url.replace("=w120-h120", "=w544-h544")

            results.append(AlbumSummary(
                browseId=browse_id,
                title=title,
                artist=artist_name,
                year=str(year) if year else "",
                thumbnail=thumb_url
            ))
            if len(results) >= 20:
                break
    except Exception as e:
        logger.error(f"Album search error for {q}: {e}")

    set_in_cache(cache_key, [r.model_dump() for r in results], ttl_seconds=1800)
    return results

@app.get("/api/album", response_model=AlbumDetail)
def get_album_details(browseId: str = Query(..., description="Album Browse ID")):
    cache_key = f"album:{browseId}"
    cached = get_from_cache(cache_key)
    if cached:
        return cached

    global yt_music
    try:
        if yt_music is None:
            yt_music = YTMusic()
        alb_data = yt_music.get_album(browseId)
        title = alb_data.get("title", "Unknown Album")
        artists = alb_data.get("artists", [])
        artist_name = ", ".join([a.get("name", "") for a in artists if a.get("name")]) if artists else "Unknown Artist"
        year = alb_data.get("year", "")
        track_count = alb_data.get("trackCount") or len(alb_data.get("tracks", []))
        duration = alb_data.get("duration", "--:--")
        
        thumbnails = alb_data.get("thumbnails", [])
        thumb_url = ""
        if thumbnails:
            sorted_thumbs = sorted(thumbnails, key=lambda x: (x.get("width", 0) * x.get("height", 0)), reverse=True)
            thumb_url = sorted_thumbs[0].get("url", "")
        if "=w120-h120" in thumb_url:
            thumb_url = thumb_url.replace("=w120-h120", "=w544-h544")

        tracks: List[Song] = []
        for t in alb_data.get("tracks", []):
            vid = t.get("videoId")
            if not vid:
                continue
            t_title = t.get("title", "Unknown Title")
            t_artists = t.get("artists", [])
            t_artist = ", ".join([a.get("name", "") for a in t_artists if a.get("name")]) if t_artists else artist_name
            t_dur = t.get("duration") or "--:--"
            t_thumb = thumb_url or f"https://i.ytimg.com/vi/{vid}/hqdefault.jpg"
            tracks.append(Song(
                videoId=vid,
                title=t_title,
                artist=t_artist,
                album=title,
                duration=t_dur,
                thumbnail=t_thumb
            ))

        detail = AlbumDetail(
            browseId=browseId,
            title=title,
            artist=artist_name,
            year=str(year) if year else "",
            trackCount=track_count,
            duration=duration,
            thumbnail=thumb_url,
            tracks=tracks
        )
        set_in_cache(cache_key, detail.model_dump(), ttl_seconds=3600)
        return detail
    except Exception as e:
        logger.error(f"Failed to fetch album details for {browseId}: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch album: {str(e)}")

# Pre-warm trending cache and base.js on startup
@app.on_event("startup")
def startup_prewarm():
    def _warm():
        try:
            logger.info("⚡ Pre-warming ArchiveTune signature timestamp and trending catalog...")
            MoriDeobfuscator.get_signature_timestamp()
            get_trending()
            logger.info("✓ ArchiveTune Core & Trending Catalog ready for instant playback!")
        except Exception as e:
            logger.warning(f"Cache pre-warm notice: {e}")
    threading.Thread(target=_warm, daemon=True).start()

# Mount frontend static directory
www_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "www"))
if os.path.exists(www_dir):
    app.mount("/", StaticFiles(directory=www_dir, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

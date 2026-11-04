package com.pixelbeats.music.data.network

import com.pixelbeats.music.data.model.Track
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

class ArchiveApiService {

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(20, TimeUnit.SECONDS)
        .followRedirects(true)
        .build()

    suspend fun searchTracks(query: String, rows: Int = 30): List<Track> = withContext(Dispatchers.IO) {
        try {
            val encodedQ = URLEncoder.encode("$query AND mediatype:(audio)", "UTF-8")
            val url = "https://archive.org/advancedsearch.php?q=$encodedQ&fl[]=identifier,title,creator,album,year,mediatype&sort[]=downloads+desc&rows=$rows&output=json"

            val req = Request.Builder()
                .url(url)
                .header("User-Agent", "PixelBeats-Android/2.0")
                .build()

            val response = client.newCall(req).execute()
            if (!response.isSuccessful) return@withContext emptyList<Track>()

            val body = response.body?.string() ?: return@withContext emptyList<Track>()
            val json = JSONObject(body)
            val docs = json.optJSONObject("response")?.optJSONArray("docs") ?: return@withContext emptyList<Track>()

            val results = mutableListOf<Track>()
            for (i in 0 until docs.length()) {
                val item = docs.optJSONObject(i) ?: continue
                val id = item.optString("identifier", "")
                if (id.isEmpty()) continue

                val title = item.optString("title", "Unknown Title").ifEmpty { id }
                val artist = item.optString("creator", "Unknown Artist").ifEmpty { "Internet Archive" }
                val album = item.optString("album", "")
                val year = item.optString("year", "")
                val coverUrl = "https://archive.org/services/img/$id"

                results.add(
                    Track(
                        id = id,
                        title = cleanTitle(title),
                        artist = cleanArtist(artist),
                        album = album,
                        year = year,
                        coverUrl = coverUrl
                    )
                )
            }
            results
        } catch (e: Exception) {
            e.printStackTrace()
            emptyList()
        }
    }

    suspend fun resolveTrackStream(track: Track): Track = withContext(Dispatchers.IO) {
        if (track.streamUrl.isNotEmpty()) return@withContext track
        try {
            val metaUrl = "https://archive.org/metadata/${track.id}"
            val req = Request.Builder()
                .url(metaUrl)
                .header("User-Agent", "PixelBeats-Android/2.0")
                .build()

            val response = client.newCall(req).execute()
            if (!response.isSuccessful) return@withContext track

            val body = response.body?.string() ?: return@withContext track
            val json = JSONObject(body)
            val files = json.optJSONArray("files") ?: return@withContext track

            var bestFile: String? = null
            var bestDuration: Long = 0L

            // Search for primary mp3 or audio file
            for (i in 0 until files.length()) {
                val f = files.optJSONObject(i) ?: continue
                val name = f.optString("name", "")
                val format = f.optString("format", "").uppercase()

                if (name.endsWith(".mp3", ignoreCase = true) || format.contains("VBR MP3") || format.contains("MP3")) {
                    bestFile = name
                    val lenSec = f.optDouble("length", 0.0)
                    if (lenSec > 0) bestDuration = (lenSec * 1000).toLong()
                    break
                }
            }

            // Fallback to any audio file
            if (bestFile == null) {
                for (i in 0 until files.length()) {
                    val f = files.optJSONObject(i) ?: continue
                    val name = f.optString("name", "")
                    if (name.endsWith(".ogg", true) || name.endsWith(".m4a", true) || name.endsWith(".flac", true)) {
                        bestFile = name
                        val lenSec = f.optDouble("length", 0.0)
                        if (lenSec > 0) bestDuration = (lenSec * 1000).toLong()
                        break
                    }
                }
            }

            if (bestFile != null) {
                val encodedFile = URLEncoder.encode(bestFile, "UTF-8").replace("+", "%20")
                val streamUrl = "https://archive.org/download/${track.id}/$encodedFile"
                return@withContext track.copy(
                    streamUrl = streamUrl,
                    duration = if (track.duration > 0) track.duration else bestDuration
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        track
    }

    suspend fun getCuratedTracks(category: String): List<Track> = withContext(Dispatchers.IO) {
        val query = when (category.lowercase()) {
            "lofi" -> "collection:(lofi OR chillhop)"
            "jazz" -> "collection:(georgeblood) AND jazz"
            "blues" -> "collection:(georgeblood) AND blues"
            "rock" -> "rock AND collection:(georgeblood OR 78rpm)"
            "classical" -> "collection:(georgeblood) AND classical"
            else -> "collection:(georgeblood) OR mediatype:(audio)"
        }
        searchTracks(query, rows = 25)
    }

    private fun cleanTitle(title: String): String {
        return title.replace(Regex("(?i)\\.(mp3|wav|flac|ogg)$"), "")
            .replace("_", " ")
            .trim()
    }

    private fun cleanArtist(artist: String): String {
        return artist.replace("_", " ").trim()
    }
}


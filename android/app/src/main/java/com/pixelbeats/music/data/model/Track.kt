package com.pixelbeats.music.data.model

import org.json.JSONObject

data class Track(
    val id: String,
    val title: String,
    val artist: String,
    val album: String = "",
    val duration: Long = 0L, // in milliseconds
    val streamUrl: String = "",
    val coverUrl: String = "",
    val year: String = "",
    val format: String = "MP3"
) {
    fun formattedDuration(): String {
        if (duration <= 0) return "--:--"
        val totalSecs = duration / 1000
        val mins = totalSecs / 60
        val secs = totalSecs % 60
        return String.format("%d:%02d", mins, secs)
    }

    fun toJsonObject(): JSONObject {
        return JSONObject().apply {
            put("id", id)
            put("title", title)
            put("artist", artist)
            put("album", album)
            put("duration", duration)
            put("streamUrl", streamUrl)
            put("coverUrl", coverUrl)
            put("year", year)
            put("format", format)
        }
    }

    companion object {
        fun fromJsonObject(json: JSONObject): Track {
            return Track(
                id = json.optString("id", ""),
                title = json.optString("title", "Unknown Title"),
                artist = json.optString("artist", "Unknown Artist"),
                album = json.optString("album", ""),
                duration = json.optLong("duration", 0L),
                streamUrl = json.optString("streamUrl", ""),
                coverUrl = json.optString("coverUrl", ""),
                year = json.optString("year", ""),
                format = json.optString("format", "MP3")
            )
        }
    }
}


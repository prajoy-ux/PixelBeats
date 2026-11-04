package com.pixelbeats.music.data.model

import org.json.JSONArray
import org.json.JSONObject

data class Playlist(
    val id: String,
    val name: String,
    val tracks: List<Track> = emptyList(),
    val createdAt: Long = System.currentTimeMillis()
) {
    fun toJsonObject(): JSONObject {
        val arr = JSONArray()
        tracks.forEach { arr.put(it.toJsonObject()) }
        return JSONObject().apply {
            put("id", id)
            put("name", name)
            put("createdAt", createdAt)
            put("tracks", arr)
        }
    }

    companion object {
        fun fromJsonObject(json: JSONObject): Playlist {
            val list = mutableListOf<Track>()
            val arr = json.optJSONArray("tracks")
            if (arr != null) {
                for (i in 0 until arr.length()) {
                    val item = arr.optJSONObject(i)
                    if (item != null) list.add(Track.fromJsonObject(item))
                }
            }
            return Playlist(
                id = json.optString("id", ""),
                name = json.optString("name", "Untitled Playlist"),
                tracks = list,
                createdAt = json.optLong("createdAt", System.currentTimeMillis())
            )
        }
    }
}


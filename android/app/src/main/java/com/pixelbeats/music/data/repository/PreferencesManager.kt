package com.pixelbeats.music.data.repository

import android.content.Context
import android.content.SharedPreferences
import com.pixelbeats.music.data.model.Playlist
import com.pixelbeats.music.data.model.Track
import org.json.JSONArray
import org.json.JSONObject

class PreferencesManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences("pixelbeats_prefs", Context.MODE_PRIVATE)

    // Favorites
    fun getFavorites(): List<Track> {
        val jsonStr = prefs.getString("favorites", "[]") ?: "[]"
        return parseTracks(jsonStr)
    }

    fun saveFavorites(list: List<Track>) {
        prefs.edit().putString("favorites", tracksToJson(list)).apply()
    }

    fun toggleFavorite(track: Track): Boolean {
        val current = getFavorites().toMutableList()
        val exists = current.any { it.id == track.id }
        if (exists) {
            current.removeAll { it.id == track.id }
            saveFavorites(current)
            return false
        } else {
            current.add(0, track)
            saveFavorites(current)
            return true
        }
    }

    fun isFavorite(trackId: String): Boolean {
        return getFavorites().any { it.id == trackId }
    }

    // Recent History
    fun getRecentTracks(): List<Track> {
        val jsonStr = prefs.getString("recent_tracks", "[]") ?: "[]"
        return parseTracks(jsonStr)
    }

    fun addRecentTrack(track: Track) {
        val current = getRecentTracks().toMutableList()
        current.removeAll { it.id == track.id }
        current.add(0, track)
        if (current.size > 50) current.removeAt(current.size - 1)
        prefs.edit().putString("recent_tracks", tracksToJson(current)).apply()
    }

    // Playlists
    fun getPlaylists(): List<Playlist> {
        val jsonStr = prefs.getString("playlists", "[]") ?: "[]"
        val list = mutableListOf<Playlist>()
        try {
            val arr = JSONArray(jsonStr)
            for (i in 0 until arr.length()) {
                val item = arr.optJSONObject(i) ?: continue
                list.add(Playlist.fromJsonObject(item))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return list
    }

    fun savePlaylists(list: List<Playlist>) {
        val arr = JSONArray()
        list.forEach { arr.put(it.toJsonObject()) }
        prefs.edit().putString("playlists", arr.toString()).apply()
    }

    fun createPlaylist(name: String): Playlist {
        val newPl = Playlist(
            id = "pl_${System.currentTimeMillis()}",
            name = name,
            tracks = emptyList()
        )
        val current = getPlaylists().toMutableList()
        current.add(0, newPl)
        savePlaylists(current)
        return newPl
    }

    fun addTrackToPlaylist(playlistId: String, track: Track) {
        val current = getPlaylists().toMutableList()
        val idx = current.indexOfFirst { it.id == playlistId }
        if (idx != -1) {
            val pl = current[idx]
            if (pl.tracks.none { it.id == track.id }) {
                current[idx] = pl.copy(tracks = pl.tracks + track)
                savePlaylists(current)
            }
        }
    }

    // Equalizer settings
    fun getEqualizerLevels(): List<Int> {
        val str = prefs.getString("eq_levels", "0,0,0,0,0") ?: "0,0,0,0,0"
        return str.split(",").mapNotNull { it.toIntOrNull() }.takeIf { it.size == 5 } ?: listOf(0, 0, 0, 0, 0)
    }

    fun saveEqualizerLevels(levels: List<Int>) {
        prefs.edit().putString("eq_levels", levels.joinToString(",")).apply()
    }

    fun getEqualizerPreset(): String {
        return prefs.getString("eq_preset", "Flat") ?: "Flat"
    }

    fun saveEqualizerPreset(preset: String) {
        prefs.edit().putString("eq_preset", preset).apply()
    }

    fun isBassBoostEnabled(): Boolean {
        return prefs.getBoolean("bass_boost", false)
    }

    fun setBassBoostEnabled(enabled: Boolean) {
        prefs.edit().putBoolean("bass_boost", enabled).apply()
    }

    private fun parseTracks(jsonStr: String): List<Track> {
        val list = mutableListOf<Track>()
        try {
            val arr = JSONArray(jsonStr)
            for (i in 0 until arr.length()) {
                val item = arr.optJSONObject(i) ?: continue
                list.add(Track.fromJsonObject(item))
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return list
    }

    private fun tracksToJson(list: List<Track>): String {
        val arr = JSONArray()
        list.forEach { arr.put(it.toJsonObject()) }
        return arr.toString()
    }
}


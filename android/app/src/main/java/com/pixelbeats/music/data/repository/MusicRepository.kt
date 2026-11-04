package com.pixelbeats.music.data.repository

import com.pixelbeats.music.data.model.Playlist
import com.pixelbeats.music.data.model.Track
import com.pixelbeats.music.data.network.ArchiveApiService

class MusicRepository(
    private val apiService: ArchiveApiService,
    private val prefs: PreferencesManager
) {
    suspend fun searchTracks(query: String): List<Track> {
        return apiService.searchTracks(query)
    }

    suspend fun resolveTrackStream(track: Track): Track {
        return apiService.resolveTrackStream(track)
    }

    suspend fun getCuratedTracks(category: String): List<Track> {
        return apiService.getCuratedTracks(category)
    }

    fun getFavorites(): List<Track> = prefs.getFavorites()

    fun toggleFavorite(track: Track): Boolean = prefs.toggleFavorite(track)

    fun isFavorite(trackId: String): Boolean = prefs.isFavorite(trackId)

    fun getRecentTracks(): List<Track> = prefs.getRecentTracks()

    fun addRecentTrack(track: Track) = prefs.addRecentTrack(track)

    fun getPlaylists(): List<Playlist> = prefs.getPlaylists()

    fun createPlaylist(name: String): Playlist = prefs.createPlaylist(name)

    fun addTrackToPlaylist(playlistId: String, track: Track) = prefs.addTrackToPlaylist(playlistId, track)

    fun getEqualizerLevels(): List<Int> = prefs.getEqualizerLevels()

    fun saveEqualizerLevels(levels: List<Int>) = prefs.saveEqualizerLevels(levels)

    fun getEqualizerPreset(): String = prefs.getEqualizerPreset()

    fun saveEqualizerPreset(preset: String) = prefs.saveEqualizerPreset(preset)

    fun isBassBoostEnabled(): Boolean = prefs.isBassBoostEnabled()

    fun setBassBoostEnabled(enabled: Boolean) = prefs.setBassBoostEnabled(enabled)
}


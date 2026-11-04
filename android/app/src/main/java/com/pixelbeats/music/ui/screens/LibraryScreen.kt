package com.pixelbeats.music.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.pixelbeats.music.data.model.Track
import com.pixelbeats.music.ui.components.TrackItemRow

@Composable
fun LibraryScreen(
    favorites: List<Track>,
    recentTracks: List<Track>,
    currentTrack: Track?,
    onTrackSelect: (Track) -> Unit,
    onFavoriteToggle: (Track) -> Unit,
    isFavorite: (String) -> Boolean,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Favorites (${favorites.size})", "Recent (${recentTracks.size})")

    Column(
        modifier = modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 16.dp)
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Your Library",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurface
        )

        Spacer(modifier = Modifier.height(14.dp))

        TabRow(
            selectedTabIndex = selectedTab,
            containerColor = MaterialTheme.colorScheme.surface,
            contentColor = MaterialTheme.colorScheme.primary
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = {
                        Text(
                            text = title,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        val currentList = if (selectedTab == 0) favorites else recentTracks

        if (currentList.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (selectedTab == 0) "No favorite tracks yet.\nHeart any track to save it here!" else "No recent tracks yet.\nStart playing music to build your history!",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentPadding = PaddingValues(bottom = 80.dp)
            ) {
                items(currentList, key = { it.id }) { track ->
                    val isPlaying = currentTrack?.id == track.id
                    TrackItemRow(
                        track = track,
                        isPlaying = isPlaying,
                        isFavorite = isFavorite(track.id),
                        onClick = { onTrackSelect(track) },
                        onFavoriteToggle = { onFavoriteToggle(track) }
                    )
                }
            }
        }
    }
}


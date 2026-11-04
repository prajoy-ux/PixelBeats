package com.pixelbeats.music.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = SageGreen,
    onPrimary = ForestOlive,
    primaryContainer = DeepOlive,
    onPrimaryContainer = PaleCream,
    secondary = MatchaLime,
    onSecondary = ForestOlive,
    background = DarkBackground,
    onBackground = OnDarkSurface,
    surface = DarkSurface,
    onSurface = OnDarkSurface,
    surfaceVariant = DarkSurfaceVariant,
    onSurfaceVariant = OnDarkSurfaceVariant
)

private val LightColorScheme = lightColorScheme(
    primary = MatchaGreen,
    onPrimary = PaleCream,
    primaryContainer = SageGreen,
    onPrimaryContainer = ForestOlive,
    secondary = DeepOlive,
    onSecondary = PaleCream,
    background = PaleCream,
    onBackground = ForestOlive,
    surface = PaleCream,
    onSurface = ForestOlive
)

@Composable
fun PixelBeatsTheme(
    darkTheme: Boolean = true, // Default to Pixel Dark Matcha
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit
) {
    val context = LocalContext.current
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}


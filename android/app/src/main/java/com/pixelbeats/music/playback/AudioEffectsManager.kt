package com.pixelbeats.music.playback

import android.media.audiofx.BassBoost
import android.media.audiofx.Equalizer
import com.pixelbeats.music.data.model.EqualizerBand
import com.pixelbeats.music.data.model.EqualizerPreset

class AudioEffectsManager {

    private var equalizer: Equalizer? = null
    private var bassBoost: BassBoost? = null
    private var currentSessionId: Int = 0

    val defaultPresets = listOf(
        EqualizerPreset("Flat", listOf(0, 0, 0, 0, 0)),
        EqualizerPreset("Bass Boost", listOf(600, 400, 0, 0, -200)),
        EqualizerPreset("Vocal", listOf(-200, 200, 500, 300, -100)),
        EqualizerPreset("Acoustic", listOf(300, 100, -100, 200, 400)),
        EqualizerPreset("Rock", listOf(500, 300, -100, 200, 500)),
        EqualizerPreset("Electronic", listOf(600, 300, 0, 200, 600)),
        EqualizerPreset("Custom", listOf(0, 0, 0, 0, 0))
    )

    fun initialize(audioSessionId: Int, savedLevels: List<Int>, bassEnabled: Boolean) {
        if (audioSessionId == 0) return
        if (equalizer != null && currentSessionId == audioSessionId) return

        release()
        currentSessionId = audioSessionId

        try {
            equalizer = Equalizer(0, audioSessionId).apply {
                enabled = true
            }

            // Apply saved levels
            val numBands = equalizer?.numberOfBands?.toInt() ?: 0
            for (i in 0 until minOf(numBands, savedLevels.size)) {
                val clamped = savedLevels[i].coerceIn(-1500, 1500)
                equalizer?.setBandLevel(i.toShort(), clamped.toShort())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }

        try {
            bassBoost = BassBoost(0, audioSessionId).apply {
                enabled = bassEnabled
                if (bassEnabled) setStrength(600.toShort())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun getBands(): List<EqualizerBand> {
        val eq = equalizer ?: return fallbackBands()
        val numBands = eq.numberOfBands.toInt().coerceAtMost(5)
        val result = mutableListOf<EqualizerBand>()

        val defaultFreqs = listOf(60, 230, 910, 3600, 14000)
        for (i in 0 until 5) {
            val freq = if (i < numBands) eq.getCenterFreq(i.toShort()) / 1000 else defaultFreqs[i]
            val level = if (i < numBands) eq.getBandLevel(i.toShort()).toInt() else 0
            result.add(EqualizerBand(i, freq, level))
        }
        return result
    }

    fun setBandLevel(bandIndex: Int, levelMilliBels: Int) {
        val eq = equalizer ?: return
        try {
            if (bandIndex in 0 until eq.numberOfBands.toInt()) {
                val clamped = levelMilliBels.coerceIn(-1500, 1500).toShort()
                eq.setBandLevel(bandIndex.toShort(), clamped)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun applyPreset(preset: EqualizerPreset) {
        val eq = equalizer ?: return
        try {
            val numBands = eq.numberOfBands.toInt()
            for (i in 0 until minOf(numBands, preset.levels.size)) {
                val clamped = preset.levels[i].coerceIn(-1500, 1500).toShort()
                eq.setBandLevel(i.toShort(), clamped)
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun setBassBoost(enabled: Boolean) {
        try {
            bassBoost?.enabled = enabled
            if (enabled) {
                bassBoost?.setStrength(700.toShort())
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun fallbackBands(): List<EqualizerBand> {
        return listOf(
            EqualizerBand(0, 60, 0),
            EqualizerBand(1, 230, 0),
            EqualizerBand(2, 910, 0),
            EqualizerBand(3, 3600, 0),
            EqualizerBand(4, 14000, 0)
        )
    }

    fun release() {
        try {
            equalizer?.release()
        } catch (ignored: Exception) {}
        try {
            bassBoost?.release()
        } catch (ignored: Exception) {}
        equalizer = null
        bassBoost = null
        currentSessionId = 0
    }
}


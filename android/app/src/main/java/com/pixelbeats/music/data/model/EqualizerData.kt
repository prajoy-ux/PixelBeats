package com.pixelbeats.music.data.model

data class EqualizerBand(
    val index: Int,
    val centerFreq: Int, // in Hz (e.g. 60, 230, 910, 3600, 14000)
    var level: Int = 0   // in millibels (-1500 to +1500)
) {
    val displayFreq: String
        get() = if (centerFreq >= 1000) "${centerFreq / 1000}kHz" else "${centerFreq}Hz"

    val displayDb: String
        get() = "${if (level > 0) "+" else ""}${level / 100}dB"
}

data class EqualizerPreset(
    val name: String,
    val levels: List<Int> // 5 levels in millibels
)


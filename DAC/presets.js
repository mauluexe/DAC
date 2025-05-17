// Define different amplifier/DAC presets
const presets = {
  'default': {
    // Default settings (no processing)
  },
  'bright-amp': {
    // Example: Simulate a bright amplifier with some treble boost
    eq: { treble: 3, mid: 0, bass: -1 }
  },
  'warm-dac': {
    // Example: Simulate a warm DAC with some bass boost and roll-off
    eq: { treble: -2, mid: 1, bass: 4 },
    // Add other parameters like distortion, saturation, etc. later
  }
,
  'fiio-k7': {
    // Simulate FiiO K7 (Neutral/Slightly Bright)
    eq: { treble: 1, mid: 0, bass: 0 }
  },
  'ifi-zen-dac': {
    // Simulate iFi Audio ZEN DAC (Warm/Musical)
    eq: { treble: -1, mid: 1, bass: 2 }
  },
  'fosi-q4': {
    // Simulate Fosi Audio Q4 (Basic Tone Control - assuming a balanced setting)
    eq: { treble: 0, mid: 0, bass: 0 }
  }
};

module.exports = presets;
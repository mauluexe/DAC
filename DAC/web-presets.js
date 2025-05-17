// Define different amplifier/DAC presets for client-side Web Audio API
// EQ values are in dB
const webPresets = {
  'スマホ直挿し': {
    filters: [
      // Example: Flat response
      { type: 'lowshelf', frequency: 250, gain: 0 },
      { type: 'peaking', frequency: 1500, Q: 1, gain: 0 },
      { type: 'highshelf', frequency: 4000, gain: 0 }
    ]
  },
  'Apple Dongle': {
    filters: [
      // Example: Brighter, slightly emphasized mid-highs
      { type: 'lowshelf', frequency: 250, gain: -0.5 },
      { type: 'peaking', frequency: 1500, Q: 1, gain: 1 },
      { type: 'highshelf', frequency: 4000, gain: 1 }
    ]
  },
  'iFi ZEN DAC': {
    filters: [
      // Example: Warm, mid-bass emphasis
      { type: 'lowshelf', frequency: 250, gain: 4 },
      { type: 'peaking', frequency: 1500, Q: 1, gain: 1 },
      { type: 'highshelf', frequency: 4000, gain: -2 }
    ]
  }
};
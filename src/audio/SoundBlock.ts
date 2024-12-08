export interface SoundBlock {
  name: string;
  scale: number[]; // Frequencies or MIDI notes
  pattern: "random" | "sampleAndHold"; // Note selection pattern
  duration: number; // Length of each note (seconds)
  reverb: boolean; // Add reverb effect
  noise?: boolean; // Indicates if this block generates noise
  volume: number; // Volume of the block
  trigger?: {
    onEveryNth: number; // Trigger this block every Nth event in another block
    targetBlock: string; // The block that activates this trigger
  };
  arpeggio?: {
    noteCount: number; // Number of notes in the sequence
    speed: number; // Speed of the arpeggio (ms between notes)
  };

  // Parameters for LFO modulation (Amplitude Modulation)
  lfo1Speed?: number; // LFO speed (frequency) in Hz
  lfo1Target?: "volume" | "pitch"; // What the LFO modulates (volume or pitch)
  lfoWave?: OscillatorType; // "sine" | "square" | "triangle"; // LFO waveform (sine, square, or triangle)
  lfoDepth?: number; // Depth of modulation (percentage, 0-100%)

  // Parameters for Noise EQ when noise is enabled
  noiseFilter?: boolean; // Whether to apply EQ to the noise
  noiseScale?: number[]; // Frequencies for filtering the noise (based on scale)
  
  // WavSoundSource
  filePath?: string; // Path to an audio file for file-based sources
  loop?: boolean; // Loop the audio file
  playbackRate?: number; // Playback speed for audio file sources

}



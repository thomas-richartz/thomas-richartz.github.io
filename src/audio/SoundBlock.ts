export interface SoundBlock {
  name: string;
  scale: number[]; // Frequencies or MIDI notes
  pattern: "random" | "sampleAndHold"; // Algorithm for note generation
  duration: number; // Length of each note (seconds)
  reverb: boolean; // Add reverb effect
  noise?: boolean; // Indicates if this block generates noise
  volume: number; // Volume of the block
}
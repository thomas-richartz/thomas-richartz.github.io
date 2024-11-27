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
}

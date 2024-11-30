import {WavSoundSource} from "./sources/WavSoundSource";

export class VoicePool {
  private audioContext: AudioContext;
  private pool: Map<string, WavSoundSource[]> = new Map();
  private maxVoicesPerFile: number;

  constructor(audioContext: AudioContext, maxVoicesPerFile: number = 4) {
    this.audioContext = audioContext;
    this.maxVoicesPerFile = maxVoicesPerFile;
  }

  async getVoice(filePath: string): Promise<WavSoundSource> {
    if (!this.pool.has(filePath)) {
      this.pool.set(filePath, []);
    }

    const availableVoices = this.pool.get(filePath)!;

    // Reuse an existing voice if available
    if (availableVoices.length > 0) {
      return availableVoices.pop()!;
    }

    // Create a new voice if under limit
    if (availableVoices.length < this.maxVoicesPerFile) {
      const newVoice = new WavSoundSource(filePath, this.audioContext);
      await newVoice.load(); // Ensure it's loaded
      return newVoice;
    }

    throw new Error(`No available voices for ${filePath}. Increase maxVoicesPerFile if needed.`);
  }

  releaseVoice(filePath: string, voice: WavSoundSource) {
    if (!this.pool.has(filePath)) {
      this.pool.set(filePath, []);
    }

    // Recycle the voice back into the pool
    this.pool.get(filePath)!.push(voice);
  }
}

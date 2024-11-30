import {createReverb} from "../effects.ts";

export class WavSoundSource {
  private audioContext: AudioContext;
  private buffer: AudioBuffer | null = null;

  constructor(private readonly filePath: string, audioContext: AudioContext) {
    this.audioContext = audioContext;
    this.filePath = filePath;
  }

  async load() {
    const response = await fetch(this.filePath);
    const arrayBuffer = await response.arrayBuffer();
    this.buffer = await this.audioContext.decodeAudioData(arrayBuffer);
  }

  play(options: { loop?: boolean; volume?: number; playbackRate?: number; reverb?: boolean } = {}) {
    if (!this.buffer) {
      console.error("Audio buffer is not loaded.");
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = this.buffer;
    source.loop = options.loop || false;
    source.playbackRate.value = options.playbackRate || 1;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume || 1;

    source.connect(gainNode);

    if (options.reverb) {
      const reverbNode = createReverb(this.audioContext);
      gainNode.connect(reverbNode).connect(this.audioContext.destination);
    } else {
      gainNode.connect(this.audioContext.destination);
    }

    source.start();
    return source;
  }
}

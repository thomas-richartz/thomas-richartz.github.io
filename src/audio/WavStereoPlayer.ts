import { FileSoundBlock } from "./FileSoundBlock";

export class WavStereoPlayer {
  public audioContext: AudioContext;
  private maxVoices: number;
  private voices: AudioBufferSourceNode[] = [];
  private reverbEffect: GainNode | null = null;
  private verbose: boolean;

  constructor(maxVoices: number, verbose: boolean = false) {
    this.maxVoices = maxVoices;
    this.verbose = verbose;
    this.audioContext = new window.AudioContext();

    // Ensure the AudioContext is resumed if it is suspended
    if (this.audioContext.state === "suspended") {
      this.audioContext.resume().then(() => {
        this.log("AudioContext resumed.");
      });
    }
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(message);
    }
  }

  // Load audio for a given file path
  public async loadAudio(filePath: string): Promise<AudioBuffer> {
    this.log(`Loading audio file: ${filePath}`);
    const response = await fetch(filePath);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    this.log(`Loaded audio file: ${filePath}`);
    return audioBuffer;
  }

  // Create reverb effect using a convolver node and gain nodes
  private createReverb(wetDryMix: number, revTime: number): GainNode {
    const convolver = this.audioContext.createConvolver();

    const length = this.audioContext.sampleRate * revTime;
    const impulse = this.audioContext.createBuffer(
      2,
      length,
      this.audioContext.sampleRate,
    );
    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        // Exponentially decaying noise for impulse response
        channelData[i] = (Math.random() * 2 - 1) * Math.exp((-3 * i) / length);
      }
    }

    convolver.buffer = impulse;

    // Create wet/dry mix using gain nodes
    const gainNodeWet = this.audioContext.createGain();
    const gainNodeDry = this.audioContext.createGain();

    gainNodeWet.gain.value = wetDryMix;
    gainNodeDry.gain.value = 1 - wetDryMix;

    // Connecting the wet signal to the reverb
    convolver.connect(gainNodeWet);
    gainNodeWet.connect(this.audioContext.destination);

    return gainNodeDry;
  }

  // Set reverb effect on or off
  public setReverbEffect(reverb: boolean) {
    this.log(`Setting reverb effect: ${reverb}`);
    if (reverb) {
      const reverbNode = this.createReverb(0.8, 2); // Wet/Dry mix and reverb time in seconds
      this.reverbEffect = reverbNode;
      this.log("Reverb effect applied.");
    } else {
      this.reverbEffect = null;
      this.log("Reverb effect disabled.");
    }
  }

  // Play block once the audio buffer is loaded
  public async playBlock(block: FileSoundBlock) {
    // Check if audioBuffer exists
    if (!block.audioBuffer) {
      this.log(`No audioBuffer found for block: ${block.name}`);
      return;
    }

    this.log(`Playing block: ${block.name}`);

    // Create an audio source for playback
    const source = this.audioContext.createBufferSource();
    source.buffer = block.audioBuffer;
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = block.volume;
    source.playbackRate.value = block.playbackRate;

    // Connect the audio signal with optional reverb
    if (this.reverbEffect) {
      source.connect(this.reverbEffect); // Wet reverb signal
    } else {
      source.connect(gainNode); // Dry signal
    }

    // Final connection to the output
    if (this.reverbEffect) {
      this.reverbEffect.connect(this.audioContext.destination);
    } else {
      gainNode.connect(this.audioContext.destination);
    }

    // Set loop and start playback
    if (block.loop) {
      source.loop = true;
    }

    try {
      source.start();
      this.voices.push(source);
    } catch (error: unknown) {
      let message;
      if (error instanceof Error) {
        message = error.message;
      }
      this.log(`Error playing block ${block.name}: ${message}`);
    }
  }

  // Stop all voices
  public stop() {
    this.log("Stopping all voices");
    this.voices.forEach((voice) => voice.stop());
    this.voices = [];
  }
}

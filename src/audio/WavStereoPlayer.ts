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

  private createReverb(wetDryMix: number, revTime: number): GainNode {
    const convolver = this.audioContext.createConvolver();

    // Create impulse response
    const length = this.audioContext.sampleRate * revTime;
    const impulse = this.audioContext.createBuffer(
      2,
      length,
      this.audioContext.sampleRate,
    );

    for (let channel = 0; channel < impulse.numberOfChannels; channel++) {
      const channelData = impulse.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        channelData[i] = (Math.random() * 2 - 1) * Math.exp((-3 * i) / length);
      }
    }
    convolver.buffer = impulse;

    // Create gain nodes for wet and dry mix
    const wetGain = this.audioContext.createGain();
    const dryGain = this.audioContext.createGain();

    wetGain.gain.value = wetDryMix;
    dryGain.gain.value = 1 - wetDryMix;

    // Connect the nodes
    convolver.connect(wetGain);
    wetGain.connect(this.audioContext.destination);

    return dryGain; // Return dry gain to allow dry signals to connect to it
  }

  public setReverbEffect(reverb: boolean) {
    this.log(`Setting reverb effect: ${reverb}`);
    if (reverb) {
      const wetDryMix = 0.8;
      const revTime = 2; // in seconds
      this.reverbEffect = this.createReverb(wetDryMix, revTime);
    } else {
      this.reverbEffect = null;
    }
  }

  public async playBlock(block: FileSoundBlock) {
    if (this.voices.length >= this.maxVoices) {
      this.log(
        `Max voices (${this.maxVoices}) reached. Cannot play block: ${block.name}`,
      );
      return;
    }

    if (!block.audioBuffer) {
      this.log(`No audioBuffer found for block: ${block.name}`);
      return;
    }

    this.log(`Playing block: ${block.name}`);

    const source = this.audioContext.createBufferSource();
    source.buffer = block.audioBuffer;
    const gainNode = this.audioContext.createGain();
    const pannerNode = this.audioContext.createStereoPanner(); // New panner node

    // Set volume and playback rate
    gainNode.gain.value = block.volume;
    source.playbackRate.value = block.playbackRate;

    // Set panning value (-1 = full left, 1 = full right, 0 = center)
    pannerNode.pan.value = block.pan || 0; // Default to center if `pan` isn't set

    // Connect audio nodes
    if (this.reverbEffect) {
      // Wet signal: connect to reverb
      source.connect(pannerNode);
      pannerNode.connect(this.reverbEffect);
      this.reverbEffect.connect(this.audioContext.destination);
    } else {
      // Dry signal: connect directly
      source.connect(pannerNode);
      pannerNode.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
    }

    if (block.loop) {
      source.loop = true;
    }

    try {
      source.start();
      this.voices.push(source);

      // Remove the voice from the array when it ends
      source.onended = () => {
        this.voices = this.voices.filter((v) => v !== source);
      };
    } catch (error: unknown) {
      if (error instanceof Error) {
        this.log(`Error playing block ${block.name}: ${error.message}`);
      }
    }
  }

  // Stop all voices
  public stop() {
    this.log("Stopping all voices");
    this.voices.forEach((voice) => voice.stop());
    this.voices = [];
  }
}

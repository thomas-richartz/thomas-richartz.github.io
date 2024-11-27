import {createReverb} from "./effects";
import {SoundBlock} from "./SoundBlock";

export class GenerativeMusicSystem {
  private audioContext: AudioContext;
  private blocks: SoundBlock[];
  private blockCounters: { [blockName: string]: number } = {}; // Track play counts

  constructor(blocks: SoundBlock[]) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.blocks = blocks;

    // Initialize counters
    blocks.forEach((block) => {
      this.blockCounters[block.name] = 0;
    });
  }

  start() {
    this.audioContext.resume();
    this.blocks.forEach((block) => this.scheduleBlock(block));
  }

  stop() {
    this.audioContext.suspend();
  }

  private scheduleBlock(block: SoundBlock) {
    const {name, duration} = block;

    const interval = setInterval(() => {
      // Track play count for each block
      this.blockCounters[name] += 1;

      if (block.noise) {
        this.playNoise(block);
      } else {
        this.playNotes(block);
      }

      // Check for trigger to play arpeggio
      if (block.trigger) {
        const targetCount = this.blockCounters[block.trigger.targetBlock];
        if (targetCount % block.trigger.onEveryNth === 0) {
          this.playArpeggio(block);
        }
      }
    }, duration * 1000); // Schedule at intervals based on note duration

    // Optionally stop the interval after a certain amount of time
    // For example, stop after a set number of intervals (e.g., 10 plays)
    // setTimeout(() => clearInterval(interval), 10 * duration * 1000);
  }

  private playNotes(block: SoundBlock) {
    const {scale, pattern, duration, volume, reverb} = block;

    // Select frequency based on the pattern
    const frequency =
      pattern === "random"
        ? scale[Math.floor(Math.random() * scale.length)]
        : scale[0]; // Sample and hold always selects the first note

    this.playOscillator(frequency, duration, volume, reverb);
  }

  private playNoise(block: SoundBlock) {
    const {duration, volume, reverb} = block;

    const bufferSize = 2 * this.audioContext.sampleRate;
    const noiseBuffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    // Fill buffer with random values for white noise
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const noiseSource = this.audioContext.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    noiseSource.connect(gainNode);

    if (reverb) {
      const reverbNode = createReverb(this.audioContext);
      gainNode.connect(reverbNode).connect(this.audioContext.destination);
    } else {
      gainNode.connect(this.audioContext.destination);
    }

    noiseSource.start();
    noiseSource.stop(this.audioContext.currentTime + duration);
  }

  private playArpeggio(block: SoundBlock) {
    const {scale, arpeggio, volume, reverb} = block;
    if (!arpeggio) return;

    const {noteCount, speed} = arpeggio;

    // Play arpeggio notes
    for (let i = 0; i < noteCount; i++) {
      const frequency = scale[i % scale.length];
      this.playOscillator(frequency, block.duration, volume, reverb, speed * i);
    }
  }

  private playOscillator(
    frequency: number,
    duration: number,
    volume: number,
    reverb: boolean,
    delay: number = 0
  ) {
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = volume;

    const oscillator = this.audioContext.createOscillator();
    oscillator.frequency.value = frequency;
    oscillator.type = "triangle";

    oscillator.connect(gainNode);

    if (reverb) {
      const reverbNode = createReverb(this.audioContext);
      gainNode.connect(reverbNode).connect(this.audioContext.destination);
    } else {
      gainNode.connect(this.audioContext.destination);
    }

    oscillator.start(this.audioContext.currentTime + delay);
    oscillator.stop(this.audioContext.currentTime + delay + duration);
  }
}

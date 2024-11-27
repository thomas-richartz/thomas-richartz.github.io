import { createReverb } from "./effects";
import { SoundBlock } from "./SoundBlock";

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
    const { name, duration } = block;

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
    // setTimeout(() => clearInterval(interval), 10 * duration * 1000);
  }

  private playNotes(block: SoundBlock) {
    const { scale, pattern, duration, volume, reverb, lfo1Speed, lfo1Target, lfoWave, lfoDepth } = block;

    // Select frequency based on the pattern
    const frequency =
      pattern === "random"
        ? scale[Math.floor(Math.random() * scale.length)]
        : scale[0]; // Sample and hold always selects the first note

    // Handle amplitude modulation if LFO is provided
    if (lfo1Speed && lfo1Target === "volume") {
      this.playWithLFO(frequency, duration, volume, reverb, lfo1Speed, lfoWave, lfoDepth);
    } else {
      this.playOscillator(frequency, duration, volume, reverb);
    }
  }

  private playNoise(block: SoundBlock) {
    const { duration, volume, reverb, scale, pattern } = block;

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

    // Apply EQ (Filter bank) based on the scale provided
    this.applyNoiseEQ(noiseSource, scale);

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

  private applyNoiseEQ(noiseSource: AudioBufferSourceNode, scale: number[]) {
    // We can create a series of bandpass filters to match the scale frequencies
    const filters: BiquadFilterNode[] = [];

    scale.forEach(frequency => {
      const filter = this.audioContext.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = frequency;
      filter.Q.value = 1; // Control bandwidth of the filter
      filters.push(filter);
    });

    // Chain filters together
    let currentNode = noiseSource;
    filters.forEach((filter, index) => {
      currentNode.connect(filter);
      currentNode = filter;
    });

    // Final output to destination
    currentNode.connect(this.audioContext.destination);
  }

  private playArpeggio(block: SoundBlock) {
    const { scale, arpeggio, volume, reverb, lfo1Speed, lfo1Target, lfoWave, lfoDepth } = block;
    if (!arpeggio) return;

    const { noteCount, speed } = arpeggio;

    // Play arpeggio notes
    for (let i = 0; i < noteCount; i++) {
      const frequency = scale[i % scale.length];
      if (lfo1Speed && lfo1Target === "volume") {
        this.playWithLFO(frequency, block.duration, volume, reverb, lfo1Speed, lfoWave, lfoDepth, speed * i);
      } else {
        this.playOscillator(frequency, block.duration, volume, reverb, speed * i);
      }
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
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); // Start with silence
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1); // Attack phase

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

    // Apply a decay to the note
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + delay + duration); // Release phase
  }

  private playWithLFO(
    frequency: number,
    duration: number,
    volume: number,
    reverb: boolean,
    lfoSpeed: number,
    lfoWave: string,
    lfoDepth: number,
    delay: number = 0
  ) {
    const gainNode = this.audioContext.createGain();
    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime); // Start with silence
    gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.1); // Attack phase

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

    // Create the LFO oscillator to modulate the gain
    const lfo = this.audioContext.createOscillator();
    lfo.frequency.value = lfoSpeed; // LFO speed
    lfo.type = lfoWave === "sin" ? "sine" : "square"; // Use sine or square wave for LFO
    const lfoGain = this.audioContext.createGain();
    lfoGain.gain.value = lfoDepth / 100; // Depth of modulation (0-1)

    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain); // Modulate the gain node with LFO

    lfo.start(this.audioContext.currentTime + delay);
    lfo.stop(this.audioContext.currentTime + delay + duration);

    oscillator.start(this.audioContext.currentTime + delay);
    oscillator.stop(this.audioContext.currentTime + delay + duration);

    // Apply a decay to the note
    gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + delay + duration); // Release phase
  }
}

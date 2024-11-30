import { createReverb } from "./effects";
import { SoundBlock } from "./SoundBlock";
import {VoicePool} from "./VoicePool";

export class GenerativeMusicSystem {
  private audioContext: AudioContext;
  private blocks: SoundBlock[];
  private blockCounters: { [blockName: string]: number } = {}; // Track play counts
  private voicePool: VoicePool;


  constructor(blocks: SoundBlock[], maxPolyphony: number = 8) {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.blocks = blocks;
    this.voicePool = new VoicePool(this.audioContext, maxPolyphony);
    
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

  private validateOscillatorType(type?: string): OscillatorType {
    const oscillatorTypes: OscillatorType[] = ["sine", "square", "sawtooth", "triangle"];
    return oscillatorTypes.includes(type as OscillatorType) ? (type as OscillatorType) : "sine";
  }

  private async playFileBlock(block: SoundBlock) {
    if (!block.filePath) return;
    
    try {
      // Acquire a voice from the pool
      const wavSource = await this.voicePool.getVoice(block.filePath);

      // Play the sound
      wavSource.play({
        loop: block.loop || false,
        volume: block.volume,
        playbackRate: block.playbackRate || 1,
        reverb: block.reverb,
      });

      // Release the voice back to the pool when playback finishes
      setTimeout(() => this.voicePool.releaseVoice(String(block.filePath), wavSource), block.duration * 1000);
    } catch (error) {
      // ${error.message}
      console.error(`Failed to play file block`);
    }
  }


  private scheduleBlock(block: SoundBlock) {
    const { name, duration } = block;

    const playBlock = () => {
      // Increment play count
      this.blockCounters[name] += 1;
      // console.log(block);

      if (block.filePath) {
        this.playFileBlock(block);
        return;
      }

      if (block.noise) {
        this.playNoise(block);
      } else {
        this.playNotes(block);
      }

      // Trigger arpeggio if conditions are met
      if (block.trigger) {
        const targetCount = this.blockCounters[block.trigger.targetBlock];
        if (targetCount % block.trigger.onEveryNth === 0) {
          this.playArpeggio(block);
        }
      }
    };

    const interval = setInterval(playBlock, duration * 1000);

    // Stop the interval after a certain time
    setTimeout(() => {
      clearInterval(interval);

      // Wait for 5 seconds (5000ms) to release audio, then restart the interval
      setTimeout(() => {
        console.log(`Restarting block: ${name} after delay`);
        this.scheduleBlock(block);
      }, 5000); // 5-second delay
    }, 10 * duration * 1000); // Run for 10 iterations before stopping
  }

  private playNotes(block: SoundBlock) {
    const { scale, pattern, duration, volume, reverb, lfo1Speed, lfo1Target, lfoWave, lfoDepth } = block;

    // Select frequency based on the pattern
    const frequency =
      pattern === "random"
        ? scale[Math.floor(Math.random() * scale.length)]
        : scale[0]; // Sample and hold always selects the first note

    const validLfoWave = this.validateOscillatorType(lfoWave);

    // Handle amplitude modulation if LFO is provided
    if (lfo1Speed && lfo1Target === "volume") {
      this.playWithLFO(frequency, duration, volume, reverb, Number(lfo1Speed), validLfoWave, Number(lfoDepth));
    } else {
      this.playOscillator(frequency, duration, volume, reverb);
    }
  }

  private playNoise(block: SoundBlock) {
    const { duration, volume, reverb, scale,  } = block; // pattern

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
    if (scale.length === 0) {
      noiseSource.connect(this.audioContext.destination);
      return; // No scale provided, directly output noise
    }

    // Create a bandpass filter
    const filter = this.audioContext.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 1; // Bandwidth control

    // Connect noise source to filter
    noiseSource.connect(filter);
    filter.connect(this.audioContext.destination);

    // Create an LFO for frequency modulation
    const lfo = this.audioContext.createOscillator();
    const lfoGain = this.audioContext.createGain();

    // Configure the LFO
    lfo.type = "sawtooth"; // Cycle through the scale frequencies
    lfo.frequency.value = 0.1; // LFO speed (cycles per second)

    // Map the LFO output to the filter frequency
    lfo.connect(lfoGain);
    lfoGain.gain.value = scale.length - 1; // Scale the LFO output
    lfoGain.connect(filter.frequency); // Map the scaled LFO output directly to frequency

    // Start the LFO
    lfo.start();
  }

  private playArpeggio(block: SoundBlock) {
    const { scale, arpeggio, volume, reverb, lfo1Speed, lfo1Target, lfoWave, lfoDepth } = block;
    if (!arpeggio) return;

    const { noteCount, speed } = arpeggio;

    const validLfoWave = this.validateOscillatorType(lfoWave);

    // Play arpeggio notes
    for (let i = 0; i < noteCount; i++) {
      const frequency = scale[i % scale.length];
      if (lfo1Speed && lfo1Target === "volume") {
        this.playWithLFO(frequency, block.duration, volume, reverb, Number(lfo1Speed), validLfoWave, Number(lfoDepth), speed * i);
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
    lfoWave: OscillatorType,
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
    lfo.type = lfoWave; //  === "sin" ? "sine" : "square"; // Use sine or square wave for LFO
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

import { createReverb } from "./effects";
import { SoundBlock } from "./SoundBlock";




export class GenerativeMusicSystem {
    private audioContext: AudioContext;
    private blocks: SoundBlock[];

    constructor(blocks: SoundBlock[]) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.blocks = blocks;
    }

    start() {
        this.audioContext.resume();
        this.blocks.forEach((block) => this.playBlock(block));
    }

    stop() {
        this.audioContext.suspend();
    }

    private playBlock(block: SoundBlock) {
        if (block.noise) {
            this.playNoise(block);
        } else {
            this.playNotes(block);
        }
    }

    private playNotes(block: SoundBlock) {
        const { scale, pattern, duration, volume, reverb } = block;

        const playNote = () => {
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = volume;

            const oscillator = this.audioContext.createOscillator();
            oscillator.type = "triangle"; 
            
            // Select frequency based on the pattern
            const frequency =
              pattern === "random"
                ? scale[Math.floor(Math.random() * scale.length)]
                : scale[0]; // Sample and hold always selects the first note

            oscillator.frequency.value = frequency;
            oscillator.connect(gainNode);

            if (reverb) {
                const reverbNode = createReverb(this.audioContext);
                gainNode.connect(reverbNode).connect(this.audioContext.destination);
            } else {
                gainNode.connect(this.audioContext.destination);
            }

            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + duration);

            // Recursively schedule next note
            setTimeout(playNote, duration * 1000);
        };

        playNote();
    }

    private playNoise(block: SoundBlock) {
        const { duration, volume, reverb } = block;

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
}

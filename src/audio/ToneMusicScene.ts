import * as Tone from "tone";

export interface FileSoundBlock {
  name: string;
  filePath: string;
  volume: number;
  pan?: number;
  loop?: boolean;
  loopStart?: number; // in seconds
  loopEnd?: number; // in seconds
  playbackRate?: number;
  scale?: number[];
  originalFrequency?: number; // sample tune
  quantize?: string; // e.g. "3n" for triplet, "8n" for eighth, etc.
  reverb?: boolean;
  delay?: boolean;
  delayTime?: string; // e.g. "4n"
  delayFeedback?: number; // 0...1
  panValue?: number;
  reverse?: boolean;
}

export class ToneMusicScene {
  private players: Map<string, Tone.Player> = new Map();
  private blocks: FileSoundBlock[];
  private reverb: Tone.Reverb | null = null;
  private delay: Tone.FeedbackDelay | null = null;
  private panners: Map<string, Tone.Panner> = new Map();
  private scheduledIds: number[] = [];
  private isLoaded = false;

  constructor(blocks: FileSoundBlock[], withReverb = true, withDelay = true) {
    this.blocks = blocks;
    if (withReverb) {
      this.reverb = new Tone.Reverb({ decay: 2, wet: 0.5 }).toDestination();
      // this.reverb = reverb ? new Tone.Reverb({ decay: 2.5, wet: 0.3 }) : null;
      this.reverb.generate();
    }
    if (withDelay) {
      this.delay = new Tone.FeedbackDelay("4n", 0.4).toDestination();
    }
  }

  /**
   * Loads all required audio files, only once.
   * Logs errors and throws if any block fails to load or decode.
   */
  public async load() {
    if (this.isLoaded) return;
    const loadPromises = this.blocks.map(async (block) => {
      if (!block.filePath) {
        console.warn(`[ToneMusicScene] Skipping block with missing filePath:`, block);
        return;
      }
      const player = await new Promise<Tone.Player>((resolve, reject) => {
        const p = new Tone.Player({
          url: block.filePath,
          reverse: !!block.reverse,
          loop: !!block.loop,
          loopStart: block.loopStart,
          loopEnd: block.loopEnd,
          onload: () => resolve(p),
          onerror: (err: any) => reject(err),
        });
      });

      player.volume.value = Tone.gainToDb(block.volume ?? 1);
      player.loop = !!block.loop;
      if (typeof block.loopStart === "number") player.loopStart = block.loopStart;
      if (typeof block.loopEnd === "number") player.loopEnd = block.loopEnd;

      // Pan
      let output: Tone.ToneAudioNode = player;
      if (typeof block.pan === "number") {
        const panner = new Tone.Panner(block.pan);
        player.connect(panner);
        this.panners.set(block.name, panner);
        output = panner;
      }

      // --- FX Routing ---
      // Set FX params (for per-block params)
      if (this.delay) {
        this.delay.delayTime.value = block.delayTime ?? "4n";
        this.delay.feedback.value = block.delayFeedback ?? 0.4;
        this.delay.wet.value = 1;
      }
      if (this.reverb) {
        this.reverb.wet.value = 1;
      }

      // Chain: output -> [delay?] -> [reverb?] -> destination
      let finalNode: Tone.ToneAudioNode = output;
      if (block.delay && this.delay) {
        finalNode.connect(this.delay);
        finalNode = this.delay;
      }
      if (block.reverb && this.reverb) {
        finalNode.connect(this.reverb);
        finalNode = this.reverb;
      }
      finalNode.connect(Tone.Destination);

      this.players.set(block.name, player);
    });

    await Promise.all(loadPromises);
    this.isLoaded = true;
  }
  // public async load() {
  //   if (this.isLoaded) return;
  //   const loadPromises = this.blocks.map(async (block) => {
  //     if (!block.filePath) {
  //       console.warn(`[ToneMusicScene] Skipping block with missing filePath:`, block);
  //       return;
  //     }
  //     const player = new Tone.Player({
  //       url: block.filePath,
  //       onerror: (e) => {
  //         console.error(`[ToneMusicScene] Tone.Player failed:`, block.name, block.filePath, e);
  //       },
  //       loop: !!block.loop,
  //       loopStart: block.loopStart,
  //       loopEnd: block.loopEnd,
  //     });

  //     // await player.load();

  //     player.volume.value = Tone.gainToDb(block.volume ?? 1);
  //     player.loop = !!block.loop;
  //     if (typeof block.loopStart === "number") player.loopStart = block.loopStart;
  //     if (typeof block.loopEnd === "number") player.loopEnd = block.loopEnd;
  //     player.playbackRate = block.playbackRate ?? 0.7;

  //     // Pan
  //     let output: Tone.ToneAudioNode = player;
  //     if (typeof block.pan === "number") {
  //       const panner = new Tone.Panner(block.pan);
  //       player.connect(panner);
  //       this.panners.set(block.name, panner);
  //       output = panner;
  //     }

  //     // FX
  //     if (block.reverb && this.reverb && block.delay && this.delay) {
  //       // delay and reverb chain: delay->reverb
  //       this.delay.delayTime.value = block.delayTime ?? "4n";
  //       this.delay.feedback.value = block.delayFeedback ?? 0.4;
  //       output.connect(this.delay);
  //       this.delay.connect(this.reverb);
  //       this.reverb.connect(Tone.Destination);
  //     } else if (block.reverb && this.reverb) {
  //       output.connect(this.reverb);
  //       this.reverb.connect(Tone.Destination);
  //     } else if (block.delay && this.delay) {
  //       this.delay.delayTime.value = block.delayTime ?? "4n";
  //       this.delay.feedback.value = block.delayFeedback ?? 0.4;
  //       output.connect(this.delay);
  //       this.delay.connect(Tone.Destination);
  //     } else {
  //       output.connect(Tone.Destination);
  //     }

  //     this.players.set(block.name, player);
  //   });

  //   await Promise.all(loadPromises);
  //   this.isLoaded = true;
  // }

  /**
   * Wait for all players to load, then schedule all blocks to play quantized.
   * Throws if loading fails.
   */
  public async scheduleQuantizedPlayback() {
    await this.load();
    this.stop();
    this.scheduledIds = [];

    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      if (block.volume === 0) continue;

      // If block has a defined loop region, schedule by that region length
      if (block.loop && typeof block.loopStart === "number" && typeof block.loopEnd === "number" && block.loopEnd > block.loopStart) {
        const loopLength = block.loopEnd - block.loopStart;
        // Schedule first play at 0
        const id0 = Tone.Transport.schedule((time) => {
          // Play from loopStart for the first time as well (or from 0 if you want)
          this.playBlock(i, undefined, time, block.loopStart);
        }, 0);
        this.scheduledIds.push(id0);
        // Schedule repeat every loopLength seconds, always from loopStart
        const id = Tone.Transport.scheduleRepeat(
          (time) => {
            this.playBlock(i, undefined, time, block.loopStart);
          },
          loopLength,
          loopLength,
        ); // offset = loopLength so next play is right after first play ends
        this.scheduledIds.push(id);
      } else {
        // Classic grid retrigger
        const quant = block.quantize ?? "4n";
        const id = Tone.Transport.scheduleRepeat((time) => {
          this.playBlock(i, undefined, time);
        }, quant);
        this.scheduledIds.push(id);
      }
    }
    Tone.Transport.start();
  }

  /**
   * Play a block at index, optionally at a given musical time
   */
  public playBlock(index: number, scaleIndex?: number, time?: Tone.Unit.Time, offset: number = 0) {
    const block = this.blocks[index];
    const player = this.players.get(block.name);
    if (player && player.loaded) {
      let playbackRate = block.playbackRate ?? 1;
      if (block.scale && typeof scaleIndex === "number") {
        const rootFreq = block.originalFrequency ?? block.scale[0];
        const targetFreq = block.scale[scaleIndex % block.scale.length];
        playbackRate = targetFreq / rootFreq;
      }
      player.playbackRate = playbackRate;
      try {
        player.start(time, offset);
      } catch (e) {
        console.warn(`[ToneMusicScene] Failed to play block:`, block.name, e);
      }
    }
  }

  /**
   * Stop playback and clear all scheduled events
   */
  public stop() {
    Tone.Transport.stop();
    for (const id of this.scheduledIds) {
      Tone.Transport.clear(id);
    }
    this.scheduledIds = [];
    this.players.forEach((player) => {
      try {
        player.stop();
      } catch (e) {
        // Ignore stop errors if not started
      }
    });
  }

  /**
   * Play a single block instantly (oneshot)
   */
  public async playOneShot(name: string) {
    await this.load();
    const player = this.players.get(name);
    if (player && player.loaded) {
      player.start();
    }
  }

  // Fade out all blocks
  public async fadeOut(duration: number = 2): Promise<void> {
    const promises: Promise<void>[] = [];
    this.players.forEach((player, name) => {
      const block = this.blocks.find((b) => b.name === name);
      if (!block) return;
      const fromDb = player.volume.value;
      const toDb = Tone.gainToDb(0.0);
      player.volume.cancelAndHoldAtTime(player.context.currentTime); // or Tone.now()
      player.volume.setValueAtTime(fromDb, Tone.now());
      player.volume.linearRampToValueAtTime(toDb, Tone.now() + duration);
      promises.push(new Promise((res) => setTimeout(res, duration * 1000)));
    });
    await Promise.all(promises);
  }

  // Fade in all blocks
  public async fadeIn(duration: number = 2): Promise<void> {
    const promises: Promise<void>[] = [];
    this.players.forEach((player, name) => {
      const block = this.blocks.find((b) => b.name === name);
      if (!block) return;
      const toDb = Tone.gainToDb(block.volume ?? 1.0);
      player.volume.cancelAndHoldAtTime(player.context.currentTime); // or Tone.now()
      player.volume.setValueAtTime(Tone.gainToDb(0.0), Tone.now());
      player.volume.linearRampToValueAtTime(toDb, Tone.now() + duration);
      promises.push(new Promise((res) => setTimeout(res, duration * 1000)));
    });
    await Promise.all(promises);
  }

  /**
   * Static helper to handle scene transitions.
   * @param currentScene The current ToneMusicScene instance (or null/undefined)
   * @param nextBlocks The new FileSoundBlock[] for the next scene
   * @param withReverb Whether to use reverb for new scene
   * @param withDelay Whether to use delay for new scene
   * @param fadeDuration Fade time in seconds
   * @returns The new ToneMusicScene instance
   */
  public static async transitionToScene(
    currentScene: ToneMusicScene | null,
    nextBlocks: FileSoundBlock[],
    withReverb: boolean = false,
    withDelay: boolean = false,
    fadeDuration: number = 2,
  ): Promise<ToneMusicScene> {
    if (currentScene) {
      await currentScene.fadeOut(fadeDuration);
      currentScene.stop();
    }
    const newScene = new ToneMusicScene(nextBlocks, withReverb, withDelay);
    await newScene.load();
    await newScene.fadeIn(fadeDuration);
    return newScene;
  }
}

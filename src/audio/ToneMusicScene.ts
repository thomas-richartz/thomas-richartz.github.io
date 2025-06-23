import * as Tone from "tone";

export interface FileSoundBlock {
  name: string;
  filePath: string;
  volume: number;
  pan?: number;
  loop?: boolean;
  playbackRate?: number;
  scale?: number[];
  originalFrequency?: number; // sample tune
}

export class ToneMusicScene {
  private players: Map<string, Tone.Player> = new Map();
  private blocks: FileSoundBlock[];
  private reverb: Tone.Reverb | null = null;

  constructor(blocks: FileSoundBlock[], withReverb: boolean) {
    this.blocks = blocks;
    if (withReverb) {
      this.reverb = new Tone.Reverb({ decay: 2, wet: 0.8 }).toDestination();
      this.reverb.generate();
    }
    this.loadBlocks();
  }

  private async loadBlocks() {
    for (const block of this.blocks) {
      const player = new Tone.Player(block.filePath).toDestination();
      player.volume.value = Tone.gainToDb(block.volume ?? 1);
      if (this.reverb) player.connect(this.reverb);
      this.players.set(block.name, player);
    }
  }

  public playBlock(index: number, scaleIndex?: number) {
    const block = this.blocks[index];
    const player = this.players.get(block.name);
    if (player) {
      let playbackRate = block.playbackRate ?? 1;
      if (block.scale && typeof scaleIndex === "number") {
        const rootFreq = block.originalFrequency ?? block.scale[0];
        const targetFreq = block.scale[scaleIndex % block.scale.length];
        playbackRate = targetFreq / rootFreq;
      }
      player.playbackRate = playbackRate;
      player.start();
    }
  }

  public stop() {
    this.players.forEach((player) => player.stop());
  }

  public playOneShot(name: string) {
    const player = this.players.get(name);
    if (player) player.start();
  }
}

import { WavStereoPlayer } from "./WavStereoPlayer";
import { FileSoundBlock } from "./FileSoundBlock";

export class MusicScene {
  private player: WavStereoPlayer;
  private blocks: FileSoundBlock[];
  private reverb: boolean;
  private verbose: boolean;

  constructor(
    player: WavStereoPlayer,
    blocks: FileSoundBlock[],
    reverb: boolean,
    verbose: boolean,
  ) {
    this.player = player;
    this.blocks = blocks;
    this.reverb = reverb;
    this.verbose = verbose;

    // Set the reverb for the scene
    this.player.setReverbEffect(this.reverb);

    this.log(
      `MusicScene initialized with ${blocks.length} blocks and reverb: ${this.reverb}`,
    );
  }

  private log(message: string) {
    if (this.verbose) {
      console.log(message);
    }
  }

  public async playBlock(index: number) {
    if (index < 0 || index >= this.blocks.length) {
      this.log(`Block index ${index} is out of bounds.`);
      return;
    }

    const block = this.blocks[index];
    if (!block.audioBuffer) {
      this.log(`Audio buffer is missing for block: ${block.name}`);
      await this.loadAudioForBlock(block);
    }

    this.player.playBlock(block);
  }

  private async loadAudioForBlock(block: FileSoundBlock) {
    if (!block.audioBuffer) {
      block.audioBuffer = await this.player.loadAudio(block.filePath);
    }
  }

  public stop() {
    this.player.stop();
  }
}

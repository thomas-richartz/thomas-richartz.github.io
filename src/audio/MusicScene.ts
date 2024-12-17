import { FileSoundBlock } from "./FileSoundBlock";
import { WavStereoPlayer } from "./WavStereoPlayer";

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

    this.player.setReverbEffect(this.reverb);

    if (this.verbose) {
      console.log(
        `Initialized MusicScene with ${blocks.length} blocks, reverb: ${reverb}`,
      );
    }
  }

  public async playBlock(index: number) {
    if (index < 0 || index >= this.blocks.length) {
      console.error(`Invalid block index: ${index}`);
      return;
    }

    const block = this.blocks[index];
    if (!block.audioBuffer) {
      console.log(`Loading audio buffer for block: ${block.name}`);
      await this.loadAudioForBlock(block);
    }

    this.player.playBlock(block);
  }

  private async loadAudioForBlock(block: FileSoundBlock) {
    block.audioBuffer = await this.player.loadAudio(block.filePath);
  }

  public stop() {
    this.player.stop();
  }
}

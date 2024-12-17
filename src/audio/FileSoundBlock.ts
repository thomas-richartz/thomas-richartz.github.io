export class FileSoundBlock {
  name: string;
  filePath: string;
  audioBuffer: AudioBuffer | null = null;
  volume: number = 1;
  playbackRate: number = 1;
  loop: boolean = false;

  constructor(name: string, filePath: string) {
    this.name = name;
    this.filePath = filePath;
  }
}

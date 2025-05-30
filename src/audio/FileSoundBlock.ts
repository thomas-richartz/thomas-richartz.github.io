export class FileSoundBlock {
  name: string;
  filePath: string;
  audioBuffer: AudioBuffer | null = null;
  volume: number = 1;
  playbackRate: number = 1;
  loop: boolean = false;
  pan: number = 0;
  positional?: boolean;
  position?: [number, number, number];

  constructor(name: string, filePath: string) {
    this.name = name;
    this.filePath = filePath;
  }
}

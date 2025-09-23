export type GalleryImage = {
  filename: string;
  title: string;
  interpretation?: string;
  cat: string;
  range: number[];
  keyPiece?: boolean = false;
};

export interface Interpretation {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  // Add more fields as needed
}

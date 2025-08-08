export type DJ = {
  id: number;
  djName: string;
  characterPath: string;
  score: number;
  ranking: number;
  trackId: number;
};

export type DJPlayingNow = {
  djId: number;
  addedBy: string;
  characterPath: string;
};
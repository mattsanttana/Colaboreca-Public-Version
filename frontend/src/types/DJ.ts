export type DJ = {
  id: string;
  djName: string;
  characterPath: string;
  score: number;
  ranking: number;
  trackId: string;
};

export type DJPlayingNow = {
  djId: number;
  addedBy: string;
  characterPath: string;
};
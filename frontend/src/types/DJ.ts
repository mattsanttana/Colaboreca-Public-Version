export type DJ = {
  id: string;
  djName: string;
  characterPath: string;
  score: number;
  ranking: number;
  trackId: string;
};

export type DJPlayingNow = {
  addedBy: string;
  characterPath: string;
};
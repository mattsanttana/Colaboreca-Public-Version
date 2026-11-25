export type DJ = {
  id: number;
  djName: string;
  characterPath: string;
  score: number;
  ranking: number;
  trackId: number;
  isModerator?: boolean;
  chatTimeoutUntil?: string | null;
  queueTimeoutUntil?: string | null;
};

export type DJPlayingNow = {
  djId: number;
  addedBy: string;
  characterPath: string;
  addedByApp: boolean;
};
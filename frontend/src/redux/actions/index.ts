export const SAVE_TRACK = 'SAVE_TRACK';
export const SAVE_DJ = 'SAVE_DJ';

export const saveTrack = (token: string) => ({
  type: SAVE_TRACK,
  token
});

export const saveDJ = (token: string) => ({
  type: SAVE_DJ,
  token
});
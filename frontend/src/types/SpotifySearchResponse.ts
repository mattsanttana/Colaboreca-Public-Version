export type Music = {
  id: string;
  name: string;
  artists: Array<{
    name: string;
  }>;
  album: {
    name: string;
    images: Array<{
      url: string;
    }>;
  };
  preview_url: string | null;
  uri: string;
}

export type DJMusic = {
  id: number;
  cover: string;
  name: string;
  artists: string;
  wasPlayed: boolean;
  voteCounts: {
    very_good: number;
    good: number;
    normal: number;
    bad: number;
    very_bad: number;
  };
}

export type SpotifyApiResponse = {
  items: Array<{
    track: Music;
  }>;
}
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
  cover: string;
  name: string;
  artists: string[];
  wasPlayed: boolean;
}

export type SpotifyApiResponse = {
  items: Array<{
    track: Music;
  }>;
}
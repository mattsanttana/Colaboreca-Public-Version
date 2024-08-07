export type Track = {
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

export type SpotifyApiResponse = {
  items: Array<{
    track: Track;
  }>;
}
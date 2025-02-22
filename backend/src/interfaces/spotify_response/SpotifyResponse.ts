export interface Music {
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

export interface GetTopTracksInBrazilResponse {
  items: Array<{
    track: Music;
  }>;
}

export interface GetTrackBySearchResponse {
  tracks: {
    items: Array<Music>;
  };
}

export interface SpotifyQueue {
  queue: Array<Music>;
  currently_playing: Music | null;
}
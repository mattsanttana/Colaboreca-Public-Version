export interface Track {
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
    track: Track;
  }>;
}

export interface GetTrackBySearchResponse {
  tracks: {
    items: Array<Track>;
  };
}
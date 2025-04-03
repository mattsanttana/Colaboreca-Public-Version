// Retorno da API do Spotify ao buscar uma música
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

// Retorno da API do Spotify ao buscar as músicas mais tocadas no Brasil
export interface GetTopTracksInBrazilResponse {
  items: Array<{
    track: Music;
  }>;
}

// Retorno da API do Spotify ao buscar uma música pelo nome
export interface GetTrackBySearchResponse {
  tracks: {
    items: Array<Music>;
  };
}

// Retorno da API do Spotify ao buscar a fila de músicas
export interface SpotifyQueue {
  queue: Array<Music>;
  currently_playing: Music | null;
}
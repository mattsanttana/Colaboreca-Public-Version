import axios from 'axios';
import { GetTopTracksInBrazilResponse, GetTrackBySearchResponse } from '../interfaces/spotify_response/SpotifyResponse';

// Classe util para manipular ações do Spotify
export default class SpotifyActions {
  // Método para pegar o token de acesso
  static async getAccessToken(code: string) {
    try {
      const clientId = process.env.COLABORECA_API_CLIENT_ID; // ID do cliente
      const clientSecret = process.env.COLABORECA_API_CLIENT_SECRET; // Chave secreta

      // Configurações do corpo da requisição
      const bodySettings = {
        grant_type: 'authorization_code', // Tipo de concessão
        code, // Código de autorização
        redirect_uri: 'https://colaboreca.vercel.app/login', // URL de redirecionamento
      };

      const body = new URLSearchParams(Object.entries(bodySettings)).toString(); // Transformar o corpo em uma string

      // Requisição para pegar o token de acesso
      const response = await axios.post('https://accounts.spotify.com/api/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Tipo de conteúdo
          Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`, // Credenciais de autenticação
        },
      });

      // Se a resposta não for 200, exibir o erro
      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.status);
        return;
      }

      return response.data.refresh_token; // Retornar o token de acesso
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para atualizar o token de acesso
  static async refreshAccessToken(refreshToken: string) {
    try {
      const clientId = process.env.COLABORECA_API_CLIENT_ID; // ID do cliente
      const clientSecret = process.env.COLABORECA_API_CLIENT_SECRET; // Chave secreta

      // Configurações do corpo da requisição
      const bodySettings = {
        grant_type: 'refresh_token', // Tipo de concessão
        refresh_token: refreshToken, // Token de atualização
      };

      const body = new URLSearchParams(Object.entries(bodySettings)).toString(); // Transformar o corpo em uma string

      // Requisição para atualizar o token de acesso
      const response = await axios.post('https://accounts.spotify.com/api/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Tipo de conteúdo
          Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`, // Credenciais de autenticação
        },
      });

      // Se a resposta não for 200, exibir o erro
      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data.access_token; // Retornar o token de acesso
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para pegar o usuário atual
  static async getCurrentUser(token: string) {
    try {
      // Requisição para pegar o usuário atual
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`, // Token de acesso
        },
      });

      // Se a resposta não for 200, exibir o erro
      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data; // Retornar os dados do usuário
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para pegar o estado de reprodução
  static async getPlaybackState(token: string) {
    try {
      // Requisição para pegar o estado de reprodução
      const response = await axios.get('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${token}`, // Token de acesso
        },
      });

      // Se a resposta não for 200 ou 204, exibir o erro
      if (response.status !== 200 && response.status !== 204) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response; // Retornar o estado de reprodução
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      if (axios.isAxiosError(error)) {
        // Verifica se o erro é um timeout do Spotify
        if (error.response && error.response.status === 429) {
          const retryAfter = error.response.headers['retry-after']; // Pegar o cabeçalho Retry-After
          console.log(`Too many requests. Retry after ${retryAfter} seconds.`); // Exibir a mensagem de erro
        } else {
          console.log('Axios error:', error.message);
        }
      } else {
        console.log('Unexpected error:', error);
      }
    }
  }

  // Método para pegar as músicas mais tocadas no Brasil
  static async getTopTracksInBrazil(token: string) {
    const primaryPlaylistUrl = 'https://api.spotify.com/v1/playlists/6MPUh2rB69qaT1guwSMOq7/tracks'; // URL da playlist principal
    const alternativePlaylistUrl = 'https://api.spotify.com/v1/playlists/2GC6fiCd3at4dq00nOAiF1/tracks'; // URL da playlist alternativa

    const fetchTracks = async (url: string) => {
      try {
        // Função para buscar as músicas mais tocadas
        const response = await axios.get<GetTopTracksInBrazilResponse>(url, {
          headers: {
            Authorization: `Bearer ${token}`, // Token de acesso
          },
        });

        // Se a resposta não for 200, exibir o erro
        if (response.status !== 200) {
          console.log('Error response from Spotify:', response.data);
          return null;
        }

        return response.data.items.map((item) => item.track); // Retornar as músicas
      } catch (error) {
        // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
        if (axios.isAxiosError(error)) {
          console.log('Error fetching top tracks:', error.response?.data || error.message);

          // Verifica se o erro é um timeout do Spotify
          if (error.response?.headers) {
            const retryAfter = error.response.headers['retry-after']; // Pegar o cabeçalho Retry-After
            // Se o cabeçalho Retry-After existir, exibir a mensagem de erro
            if (retryAfter) {
              const retryAfterSeconds = parseInt(retryAfter, 10); // Converter o valor para inteiro
              const hours = Math.floor(retryAfterSeconds / 3600); // Calcular as horas
              const minutes = Math.floor((retryAfterSeconds % 3600) / 60); // Calcular os minutos
              const seconds = retryAfterSeconds % 60; // Calcular os segundos
              console.log(`Retry-After header value: ${retryAfter} seconds`); // Exibir a mensagem de erro
              // Exibir o tempo de espera
              console.log(
                `You need to wait ${hours} hours, ${minutes} minutes, 
                and ${seconds} seconds before making new requests.`
              );
            }
          }
        } else {
          console.log('Unexpected error:', error);
        }
        return null;
      }
    };

    // Tentar buscar a playlist principal
    let tracks = await fetchTracks(primaryPlaylistUrl);

    // Se a playlist principal estiver indisponível, tentar a playlist alternativa
    if (!tracks) {
      console.log('Primary playlist unavailable, trying alternative playlist...');
      tracks = await fetchTracks(alternativePlaylistUrl);
    }

    return tracks; // Retornar as músicas
  }


  // Método para buscar uma música por nome
  static async getTrackBySearch(token: string, query: string) {
    try {
      // Requisição para buscar uma música por nome
      const response = await axios.get<GetTrackBySearchResponse>(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=50&market=BR`, {
        headers: {
          Authorization: `Bearer ${token}`, // Token de acesso
        },
      });

      // Se a resposta não for 200, exibir o erro
      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data.tracks.items; // Retornar as músicas
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para pegar a fila de reprodução
  static async getQueue(token: string) {
    try {
      // Requisição para pegar a fila de reprodução
      const response = await axios.get('https://api.spotify.com/v1/me/player/queue', {
        headers: {
          Authorization: `Bearer ${token}`, // Token de acesso
        },
      });

      // Se a resposta não for 200, exibir o erro
      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data; // Retornar a fila de reprodução
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }

  // Método para adicionar uma música à fila
  static async addTrackToQueue(token: string, trackURI: string) {
    try {
      // Requisição para adicionar uma música à fila
      const response = await axios.post(`https://api.spotify.com/v1/me/player/queue`, null, {
        params: {
          uri: trackURI // URI da música
        },
        headers: {
          Authorization: `Bearer ${token}` // Token de acesso
        }
      });

      return response.data; // Retornar a resposta
    } catch (error) {
      // Se ocorrer um erro, exiba no console e retorne uma mensagem de erro
      console.error(error);
      if (error instanceof Error) {
        return { status: 'ERROR', data: { message: error.message } };
      } else {
        return { status: 'ERROR', data: { message: 'An unknown error occurred' } };
      }
    }
  }
}
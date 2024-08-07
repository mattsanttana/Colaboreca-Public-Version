import axios from 'axios';
import { SpotifyApiResponse, Track } from '../interfaces/spotify_response/getTopTracksInBrazil';

export default class SpotifyActions {
  static async getAccessToken(code: string) {
    try {
      const clientId = process.env.COLABORECA_API_CLIENT_ID;
      const clientSecret = process.env.COLABORECA_API_CLIENT_SECRET;

      const bodySettings = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:5173/login',
      };

      const body = new URLSearchParams(Object.entries(bodySettings)).toString();

      const response = await axios.post('https://accounts.spotify.com/api/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`,
        },
      });

      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data.refresh_token;
    } catch (error) {
      console.log(error);
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      const clientId = process.env.COLABORECA_API_CLIENT_ID;
      const clientSecret = process.env.COLABORECA_API_CLIENT_SECRET;

      const bodySettings = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      };

      const body = new URLSearchParams(Object.entries(bodySettings)).toString();

      const response = await axios.post('https://accounts.spotify.com/api/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${btoa(clientId + ':' + clientSecret)}`,
        },
      });

      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data.access_token;
    } catch (error) {
      console.log(error);
    }
  }

  static async getCurrentUser(token: string) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data;
    } catch (error) {
      const err = error as any;
      console.log('Error fetching user data:', err.response?.data || err.message);
    }
  }

  static async getPlaybackState(token: string) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200 && response.status !== 204) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response;
    } catch (error) {
      console.log(error);
    }
  }

  static async getTopTracksInBrazil(token: string) {
    try {
      const response = await axios.get<SpotifyApiResponse>('https://api.spotify.com/v1/playlists/37i9dQZF1DX0FOF1IUWK1W/tracks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status !== 200) {
        console.log('Error response from Spotify:', response.data);
        return;
      }

      return response.data.items.map((item) => item.track);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log('Error fetching top tracks:', error.response?.data || error.message);

        if (error.response?.headers) {
          const retryAfter = error.response.headers['retry-after'];
          if (retryAfter) {
            const retryAfterSeconds = parseInt(retryAfter, 10);
            const hours = Math.floor(retryAfterSeconds / 3600);
            const minutes = Math.floor((retryAfterSeconds % 3600) / 60);
            const seconds = retryAfterSeconds % 60;
            console.log(`Retry-After header value: ${retryAfter} seconds`);
            console.log(`You need to wait ${hours} hours, ${minutes} minutes, and ${seconds} seconds before making new requests.`);
          }
        }
      } else {
        console.log('Unexpected error:', error);
      }
    }
  }
}

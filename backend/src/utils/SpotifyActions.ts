import axios from 'axios';

export default class SpotifyActions {
  static async getAccessToken(code: string) {
    try {
      const clientId = process.env.COLABORECA_API_CLIENT_ID
      const clientSecret = process.env.COLABORECA_API_CLIENT_SECRET

      const bodySettings = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: 'http://localhost:5173/login',
      }

      const body = new URLSearchParams(Object.entries(bodySettings)).toString();

      const response = await axios.post('https://accounts.spotify.com/api/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${ btoa(clientId + ":" + clientSecret) }`,
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
      const clientId = process.env.COLABORECA_API_CLIENT_ID
      const clientSecret = process.env.COLABORECA_API_CLIENT_SECRET

      const bodySettings = {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }

      const body = new URLSearchParams(Object.entries(bodySettings)).toString();

      const response = await axios.post('https://accounts.spotify.com/api/token', body, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${ btoa(clientId + ":" + clientSecret) }`,
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
      const err = error as any; // ou `as Error` se você tiver certeza que é um erro
      console.log('Error fetching user data:', err.response?.data || err.message);
    }
  }

  static async getPlaybackState(token: string) {
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/player', {
        headers: {
          Authorization: `Bearer ${ token }`,
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
}
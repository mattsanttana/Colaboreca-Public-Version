const usePlayback = () => {
  const getState = async (trackId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/${ trackId }`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getTopMusicsInBrazil = async (trackId: string | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/top-tracks-in-brazil/${ trackId }`);

      const data = await response.json();

      return {
        status: response.status,
        data
      };
    } catch (error) {
      console.error(error);
    }
  }

  const getTrackBySearch = async (trackId: string | undefined, search: string) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/search/${ trackId }?search=${ search }`);

      const data = await response.json();

      return {
        status: response.status,
        data
      };
    } catch (error) {
      console.error(error);
    }
  }

  const addTrackToQueue = async (trackId: string | undefined, trackURI: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/add-to-queue/${ trackId }`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`
        },
        body: JSON.stringify({ trackURI })
      });

      return response;
    } catch (error) {
      console.error(error);
    }
  }

  const getQueue = async (trackId: string | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/queue/${ trackId }`);

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getSpotifyQueue = async (trackId: string | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/spotify-queue/${ trackId }`);

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getAddedMusicsByDJ = async (djId: string | undefined, trackId: string | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/added-musics-by-dj/${ djId }/${ trackId }`);

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getDJAddedCurrentMusic = async (trackId: string | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/dj-added-current-song/${ trackId }`);

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    getState,
    getTopMusicsInBrazil,
    getTrackBySearch,
    addTrackToQueue,
    getQueue,
    getSpotifyQueue,
    getAddedMusicsByDJ,
    getDJAddedCurrentMusic 
  };
}

export default usePlayback;
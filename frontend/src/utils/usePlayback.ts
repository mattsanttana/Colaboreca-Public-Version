const usePlayback = () => {
  const getState = async (trackId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/${ trackId }`);
      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getTopMusicsInBrazil = async (trackId: number | undefined) => {
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

  const getTrackBySearch = async (trackId: number | undefined, search: string) => {
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

  const getQueue = async (trackId: number | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/queue/${ trackId }`);

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getAddedMusicsByDJ = async (djId: number | undefined, trackId: number | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/added-musics-by-dj/${ djId }/${ trackId }`);

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getDJAddedCurrentMusic = async (trackId: number | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/dj-added-current-music/${ trackId }`);

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const addTrackToQueue = async (
    trackId: number | undefined,
    cover: string,
    name: string,
    artists: string,
    musicURI: string,
    token: string
  ) => {
    try {
      const response = await fetch(`http://localhost:3001/playback/add-to-queue/${ trackId }`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`
        },
        body: JSON.stringify({ cover, name, artists, musicURI })
      });

      return response;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    getState,
    getTopMusicsInBrazil,
    getTrackBySearch,
    getQueue,
    getAddedMusicsByDJ,
    getDJAddedCurrentMusic,
    addTrackToQueue
  };
}

export default usePlayback;
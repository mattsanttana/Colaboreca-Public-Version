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

  const getTopTracksInBrazil = async (trackId: string | undefined) => {
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

  return { getState, getTopTracksInBrazil, getTrackBySearch, addTrackToQueue };
}

export default usePlayback;
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

  return { getState, getTopTracksInBrazil };
}

export default usePlayback;
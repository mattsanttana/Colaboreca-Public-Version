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

  return { getState };
}

export default usePlayback;
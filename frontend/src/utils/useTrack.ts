interface CreateTrack {
  trackName: string;
  code: string;
}

const useTrack = () => {
  const createTrack = async (trackData: CreateTrack) => {
    try {
      const { trackName, code } = trackData;
      const response = await fetch('http://localhost:3001/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackName, code }),
      });

      const data = await response.json();

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(error);
    }
  }
  
  const getTrackById = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/tracks/${ id }`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(error);
    }
  }

  const enterTrack = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/tracks/enter-track/${ id }`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(error);
    }
  }

  const verifyIfTrackAlreadyBeenCreated = async (token: string) => {
    try {     
      const response = await fetch(`http://localhost:3001/tracks/verify-if-track-already-been-created`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`
        },
      });
      
      const data = await response.json();

      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.log(error);
    }
  }

  const verifyTrackAcess = async (token: string, trckId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/tracks/verify-track-access/${ trckId }`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`
        },
      });

      return {
        status: response.status,
      };
    } catch (error) {
      console.error(error);
    }
  }

  const updateTrack = async (trackName: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/tracks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`
        },
        body: JSON.stringify({ trackName }),
      });

      return {
        status: response.status,
      };
    } catch (error) {
      console.error(error);
    }
  }

  const deleteDJ = async (djID: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/tracks/${ djID }`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`
        },
      });

      return {
        status: response.status,
      };
    } catch (error) {
      console.error(error);
    }
  }

  const deleteTrack = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/tracks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`
        },
      });

      return {
        status: response.status,
      };
    } catch (error) {
      console.error(error);
    }
  }

  return { 
    createTrack,
    getTrackById,
    enterTrack,
    verifyIfTrackAlreadyBeenCreated,
    verifyTrackAcess,
    updateTrack,
    deleteDJ,
    deleteTrack
  };
}

export default useTrack;
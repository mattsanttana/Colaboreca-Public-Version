const useTrack = () => {
  const createTrack = async (trackName: string, code: string) => {
    try {
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
  
  const getTrackById = async (id: number) => {
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

  const enterTrack = async (id: number) => {
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

  const verifyTrackAcess = async (token: string, trckId: number) => {
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
        method: 'PATCH',
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

  const expelDJ = async (djId: number, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/tracks/${ djId }`, {
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
    expelDJ,
    deleteTrack
  };
}

export default useTrack;
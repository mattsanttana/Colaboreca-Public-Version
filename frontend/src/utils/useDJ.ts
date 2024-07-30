interface CreateDJ {
  djName: string;
  characterPath: string;
  trackId: string;
}

const useDJ = () => {
  const createDJ = async (djData: CreateDJ) => {
    try {
      const response = await fetch('http://localhost:3001/djs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(djData),
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
  
  const getAllDJs = async (trackId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/djs/${ trackId }`);
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const getDJById = async (djId: string, trackId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/djs/${ djId }/${ trackId }`, {
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

  const getDJByToken = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/djs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const verifyIfDjHasAlreadyBeenCreatedForThisTrack = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/djs/verify-if-dj-has-already-been-created-for-this-track`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
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

  const verifyIfTheDJIsTheProfileOwner = async (id: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/djs/verify-if-the-dj-is-the-profile-owner/${ id }`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
      });

      if (response.status === 200) {
        return true;
      }

      return false;
    } catch (error) {
      console.error(error);
    }
  }

  const updateDJ = async (djName: string, characterPath: string, token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/djs`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify({ characterPath, djName }),
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

  const deleteDJ = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/djs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
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

  return {
    createDJ,
    getDJById,
    getAllDJs,
    getDJByToken,
    verifyIfDjHasAlreadyBeenCreatedForThisTrack,
    verifyIfTheDJIsTheProfileOwner,
    updateDJ,
    deleteDJ 
  };
}

export default useDJ;
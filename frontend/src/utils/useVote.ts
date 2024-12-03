const useVote = () => {
  const vote = async (token: string, musicURI: string | undefined, vote: string) => {
    try {
      const response = await fetch(`http://localhost:3001/votes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify({
          musicURI,
          vote,
        }),
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  const verifyIfDJHasAlreadVoted = async (token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/votes`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
      });

      const data = await response.json();   

      if (data.message !== 'The DJ has not yet voted on the current song') {
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
    }
  }

  const getAllVotesForThisMusic = async (trackId: string, musicURI: string | undefined) => {
    try {
      const response = await fetch(`http://localhost:3001/votes/get-all-votes-for-this-music/${ trackId }/${ musicURI }`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      return data;
    } catch (error) {
      console.error(error);
    }
  }

  return {
    verifyIfDJHasAlreadVoted, vote, getAllVotesForThisMusic,
  };
}

export default useVote;
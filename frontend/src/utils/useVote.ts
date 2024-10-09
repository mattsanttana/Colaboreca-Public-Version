const useVote = () => {
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

  return {
    verifyIfDJHasAlreadVoted,
  };
}

export default useVote;
const useMessage = () => {
  const sendMessage = async (djId: string | null, message: string, token: string) => {
    try {
      const response = await fetch('http://localhost:3001/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ token }`,
        },
        body: JSON.stringify({
          djId,
          message,
        }),
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
    sendMessage
  };
}

export default useMessage;
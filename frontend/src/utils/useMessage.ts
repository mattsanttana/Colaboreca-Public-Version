const useMessage = () => {
  const sendMessage = async (djId: string | number | null, message: string, token: string) => {
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

  const getAllMessagesForThisDJ = async (token: string) => {
    try {
      const response = await fetch('http://localhost:3001/chats', {
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

  const markMessagesAsRead = async (messageIds: (string | number)[], token: string) => {
    try {
      const response = await fetch(`http://localhost:3001/chats/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messageIds }), // Envia os IDs das mensagens no corpo da requisição
      });

      console.log('chegou aqui');
      
      const data = await response.json();

      console.log(data);
  
      return {
        status: response.status,
        data,
      };
    } catch (error) {
      console.error(error);
      return {
        status: 'ERROR',
        data: { message: 'An error occurred' },
      };
    }
  };

  return {
    sendMessage,
    getAllMessagesForThisDJ,
    markMessagesAsRead
  };
}

export default useMessage;
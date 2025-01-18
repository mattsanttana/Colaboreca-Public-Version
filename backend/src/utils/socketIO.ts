import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer;

export const initSocket = (server: HTTPServer) => {
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Permitir todas as origens; ajuste se necessário
      methods: ["GET", "POST"],
    },
    transports: ["websocket", "polling"],
  });

  io.on('connection', (socket) => {
    console.log(`Usuário conectado: ${socket.id}`);

    // Quando um cliente se conecta, ele pode entrar em uma sala específica
    socket.on('joinRoom', (room) => {
      console.log(`Usuário ${socket.id} entrando na sala: ${room}`);
      socket.join(room); // Adiciona o cliente à sala
    });

    // Emissão de mensagens para a sala especificada
    socket.on('chat message', (message) => {
      const room = message.room || 'general'; // Se não for especificado, a sala é 'general'
      io.to(room).emit('chat message', message);
      console.log(`Mensagem enviada para a sala ${room}:`, message);
    });

    socket.on('disconnect', () => {
      console.log(`Usuário desconectado: ${socket.id}`);
    });
  });

  return io;
};

export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.io não foi inicializado');
  }
  return io;
};

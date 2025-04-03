import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer; // Instância do Socket.io

// Inicializar o Socket.io
export const initSocket = (server: HTTPServer) => {
  // Configurações do Socket.io
  io = new SocketIOServer(server, {
    cors: {
      origin: "*", // Permitir todas as origens
      methods: ["GET", "POST"], // Permitir apenas métodos GET e POST
    },
    transports: ["websocket", "polling"], // Permitir apenas WebSocket e Polling
  });

  // Criação de eventos
  io.on('connection', (socket) => {
    // Quando um cliente se conecta, ele pode entrar em uma sala específica
    socket.on('joinRoom', (room) => {
      socket.join(room); // Adiciona o cliente à sala
    });

    // Emissão de mensagens para a sala especificada
    socket.on('chat message', (message) => {
      const room = message.room || 'general'; // Se não for especificado, a sala é 'general'
      io.to(room).emit('chat message', message); // Emissão da mensagem para a sala
    });

    // Emissão de eventos de digitação
    socket.on('typing', (data) => {
      socket.to(`track_${data.trackId}`).emit('dj typing', data);
    });

    // Disconexão do cliente
    socket.on('disconnect', () => {
    });
  });

  return io; // Retornar a instância do Socket.io
};

// Obter a instância do Socket.io
export const getSocket = () => {
  if (!io) {
    throw new Error('Socket.io não foi inicializado'); // Se o Socket.io não foi inicializado, lançar um erro
  }

  return io; // Retornar a instância do Socket.io
};

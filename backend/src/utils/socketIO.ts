import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import SequelizeDJ from '../database/models/SequelizeDJ';
import JWT from './JWT';

let io: SocketIOServer; // Instância do Socket.io

// Inicializar o Socket.io
export const initSocket = (server: HTTPServer, refreshTrack?: (trackId: number) => Promise<void>) => {
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
      if (typeof room !== 'string' || room.startsWith('track_')) return;
      socket.join(room); // Adiciona o cliente à sala
    });

    socket.on('joinTrack', (data: { trackId?: number; token?: string }) => {
      if (!data || !Number.isInteger(data.trackId) || typeof data.token !== 'string') return;

      const decoded = JWT.verify(data.token);
      if (
        typeof decoded === 'string' ||
        Number(decoded.trackId) !== data.trackId ||
        !Number.isInteger(Number(decoded.id))
      ) {
        return;
      }

      socket.join(`track_${data.trackId}`);
      socket.join(`track_${data.trackId}_dj_${Number(decoded.id)}`);

      if (refreshTrack) {
        void refreshTrack(data.trackId).catch((error) => {
          console.error(`Failed to refresh playback for track ${data.trackId}:`, error);
        });
      }
    });

    socket.on('leaveTrack', (data: { trackId?: number; token?: string }) => {
      if (!data || !Number.isInteger(data.trackId) || typeof data.token !== 'string') return;

      const decoded = JWT.verify(data.token);
      if (
        typeof decoded === 'string' ||
        Number(decoded.trackId) !== data.trackId ||
        !Number.isInteger(Number(decoded.id))
      ) {
        return;
      }

      void socket.leave(`track_${data.trackId}`);
      void socket.leave(`track_${data.trackId}_dj_${Number(decoded.id)}`);
    });

    // Emissão de mensagens para a sala especificada
    socket.on('chat message', (message) => {
      const room = message.room || 'general'; // Se não for especificado, a sala é 'general'
      io.to(room).emit('chat message', message); // Emissão da mensagem para a sala
    });

    // Emissão de eventos de digitação
    socket.on('typing', async (data) => {
      const dj = await SequelizeDJ.findByPk(data.djId);

      if (!dj) return;

      socket.to(`track_${data.trackId}`).emit('dj typing', {
        ...data,
        dj: dj.get(),
      });
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

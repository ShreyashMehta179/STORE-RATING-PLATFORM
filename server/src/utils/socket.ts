import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { config } from '../config';

let io: SocketIOServer | null = null;

export const initSocket = (httpServer: HttpServer): SocketIOServer => {
  const allowedOrigins = [
    config.clientUrl?.replace(/\/+$/, ''),
    'https://store-rating-platform-black.vercel.app',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
  ].filter(Boolean) as string[];

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        const cleanOrigin = origin.replace(/\/+$/, '');
        if (allowedOrigins.includes(cleanOrigin) || (config.nodeEnv !== 'production' && origin.includes('localhost'))) {
          return callback(null, true);
        }
        callback(null, true);
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    // Room management
    socket.on('join_room', (room: string) => {
      if (room) {
        socket.join(room);
      }
    });

    socket.on('leave_room', (room: string) => {
      if (room) {
        socket.leave(room);
      }
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO not initialized! Call initSocket(httpServer) first.');
  }
  return io;
};

// Event Broadcasters
export const broadcastStoreEvent = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
    io.to('admin-room').emit('admin.storeChange', { event, data });
  }
};

export const broadcastRatingEvent = (event: string, data: any) => {
  if (io) {
    io.emit(event, data);
    if (data.storeId) {
      io.to(`store-${data.storeId}`).emit(event, data);
    }
    if (data.ownerId) {
      io.to(`owner-${data.ownerId}`).emit('owner.ratingNew', data);
    }
    io.to('admin-room').emit('admin.ratingChange', { event, data });
  }
};

export const broadcastFavoriteEvent = (event: string, data: any) => {
  if (io) {
    if (data.userId) {
      io.to(`user-${data.userId}`).emit(event, data);
    }
  }
};

export const broadcastActivityEvent = (data: any) => {
  if (io) {
    io.to('admin-room').emit('activity.created', data);
  }
};

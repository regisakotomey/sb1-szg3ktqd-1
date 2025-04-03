import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';

const users = new Map<string, string>(); // userId -> socketId

export function initSocketServer(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      users.set(userId, socket.id);
      socket.join(userId);
    }

    socket.on('send_message', (data) => {
      const recipientSocket = users.get(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('receive_message', {
          ...data,
          createdAt: new Date().toISOString()
        });
      }
    });

    socket.on('typing', (data) => {
      const recipientSocket = users.get(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('user_typing', {
          userId: data.userId,
          conversationId: data.conversationId
        });
      }
    });

    socket.on('read_messages', (data) => {
      const recipientSocket = users.get(data.recipientId);
      if (recipientSocket) {
        io.to(recipientSocket).emit('messages_read', {
          conversationId: data.conversationId,
          userId: data.userId
        });
      }
    });

    socket.on('disconnect', () => {
      if (userId) {
        users.delete(userId);
      }
    });
  });

  return io;
}
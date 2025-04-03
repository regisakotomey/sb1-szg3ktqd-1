'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { getUserData } from '@/lib/storage';

export function useSocket() {
  const socket = useRef<Socket | null>(null);

  useEffect(() => {
    const userData = getUserData();
    if (!userData?.id) return;

    // Initialize socket connection
    socket.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      query: {
        userId: userData.id
      }
    });

    // Connection event handlers
    socket.current.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.current.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    socket.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, []);

  return socket.current;
}
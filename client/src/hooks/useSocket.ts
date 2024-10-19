import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
}

interface ExecutionResult {
  success: boolean;
  result: string;
}

export const useSocket = (roomId: string | null, terminalWrite?: (text: string) => void): UseSocketReturn => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = () => {
    if (socketRef.current?.connected) return;

    try {
      socketRef.current = io('http://localhost:3000', {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        timeout: 20000,
        withCredentials: false,
        autoConnect: true
      });

      // Connection handlers
      socketRef.current.on('connect', () => {
        console.log('Connected to server with ID:', socketRef.current?.id);
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        terminalWrite?.('\r\nConnected to server\r\n$ ');
      });

      socketRef.current.on('connect_error', (err: Error) => {
        console.error('Connection error:', err);
        setIsConnected(false);
        setError(err);
        
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts.current++;
          terminalWrite?.(`\r\nConnection attempt ${reconnectAttempts.current}/${MAX_RECONNECT_ATTEMPTS} failed: ${err.message}\r\n$ `);
        } else {
          terminalWrite?.('\r\nMax reconnection attempts reached. Please check your connection.\r\n$ ');
        }
      });

      socketRef.current.on('disconnect', (reason: string) => {
        console.log('Disconnected:', reason);
        setIsConnected(false);
        terminalWrite?.(`\r\nDisconnected from server: ${reason}\r\n$ `);

        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try reconnecting
          socketRef.current?.connect();
        }
      });

      socketRef.current.on('executionResult', (data: ExecutionResult) => {
        if (terminalWrite) {
          terminalWrite('\r\n=== Execution Result ===\r\n');
          terminalWrite(data.success ? data.result : `Error: ${data.result}`);
          terminalWrite('\r\n=====================\r\n$ ');
        }
      });

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize socket');
      setError(error);
      console.error('Socket initialization error:', error);
      terminalWrite?.(`\r\nSocket initialization error: ${error.message}\r\n$ `);
    }
  };

  const disconnect = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    error,
    connect,
    disconnect
  };
};
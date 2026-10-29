import { useContext, useEffect } from 'react';
import { SocketContext } from '../context/SocketContext';

export function useSocket(eventName, handler) {
  const { socket, isConnected } = useContext(SocketContext);

  useEffect(() => {
    if (!socket || !eventName || !handler) return;
    socket.on(eventName, handler);
    return () => socket.off(eventName, handler);
  }, [socket, eventName, handler]);

  return { socket, isConnected };
}


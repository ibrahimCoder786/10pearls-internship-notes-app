import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Connect to Socket.IO and pass user ID in queries
    // Extract only the origin (e.g., http://localhost:5000) to avoid "Invalid namespace" subpath errors
    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    let SOCKET_URL = apiURL;
    try {
      SOCKET_URL = new URL(apiURL).origin;
    } catch (e) {
      // Fallback
    }

    const socketInstance = io(SOCKET_URL, {
      query: { userId: user.id },
      transports: ['websocket', 'polling']
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user, isAuthenticated]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketContext;

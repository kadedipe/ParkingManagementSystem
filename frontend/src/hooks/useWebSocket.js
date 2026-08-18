// ============================================================================
// useWebSocket Hook
// ============================================================================

/**
 * Custom hook for managing WebSocket connections.
 * 
 * This hook provides:
 * - WebSocket connection management
 * - Automatic reconnection
 * - Message sending and receiving
 * - Connection status tracking
 * - Event-based message handling
 * - Heartbeat/ping mechanism
 * - Error handling and recovery
 * - Queue for messages when disconnected
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { config } from '../config';

// ============================================================================
// Constants
// ============================================================================

const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;
const HEARTBEAT_INTERVAL = 30000;
const CONNECTION_TIMEOUT = 5000;

// ============================================================================
// WebSocket Status
// ============================================================================

export const WebSocketStatus = {
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

// ============================================================================
// Main Hook
// ============================================================================

export const useWebSocket = ({
  url = config.websocket.url,
  autoConnect = true,
  reconnectAttempts = MAX_RECONNECT_ATTEMPTS,
  reconnectDelay = RECONNECT_DELAY,
  heartbeatInterval = HEARTBEAT_INTERVAL,
  onMessage,
  onOpen,
  onClose,
  onError,
  onReconnect,
  onReconnectAttempt,
  protocols = [],
  debug = false,
} = {}) => {
  // ==========================================================================
  // State
  // ==========================================================================

  const [status, setStatus] = useState(WebSocketStatus.DISCONNECTED);
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [messageQueue, setMessageQueue] = useState([]);

  // ==========================================================================
  // Refs
  // ==========================================================================

  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const heartbeatTimerRef = useRef(null);
  const connectionTimeoutRef = useRef(null);
  const messageHandlersRef = useRef(new Map());
  const isMountedRef = useRef(true);
  const reconnectAttemptsRef = useRef(reconnectAttempts);
  const reconnectDelayRef = useRef(reconnectDelay);

  // ==========================================================================
  // Logging Helper
  // ==========================================================================

  const log = useCallback((...args) => {
    if (debug) {
      console.log('[WebSocket]', ...args);
    }
  }, [debug]);

  // ==========================================================================
  // Connection Management
  // ==========================================================================

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      log('Already connected');
      return;
    }

    if (wsRef.current?.readyState === WebSocket.CONNECTING) {
      log('Connection already in progress');
      return;
    }

    try {
      setStatus(WebSocketStatus.CONNECTING);
      setError(null);
      log('Connecting to WebSocket:', url);

      const ws = new WebSocket(url, protocols);
      wsRef.current = ws;

      // Set connection timeout
      connectionTimeoutRef.current = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          log('Connection timeout');
          ws.close();
          setStatus(WebSocketStatus.ERROR);
          setError(new Error('Connection timeout'));
          if (onError) onError(new Error('Connection timeout'));
          handleReconnect();
        }
      }, CONNECTION_TIMEOUT);

      // WebSocket event handlers
      ws.onopen = () => {
        clearTimeout(connectionTimeoutRef.current);
        setStatus(WebSocketStatus.CONNECTED);
        setIsConnected(true);
        setConnectionAttempts(0);
        reconnectAttemptsRef.current = reconnectAttempts;
        log('WebSocket connected');

        // Start heartbeat
        startHeartbeat();

        // Send queued messages
        flushMessageQueue();

        if (onOpen) onOpen(ws);
      };

      ws.onclose = (event) => {
        clearTimeout(connectionTimeoutRef.current);
        stopHeartbeat();
        setStatus(WebSocketStatus.DISCONNECTED);
        setIsConnected(false);
        log('WebSocket disconnected', event.code, event.reason);

        if (onClose) onClose(event);

        // Attempt reconnect if not intentionally closed
        if (event.code !== 1000 && event.code !== 1001) {
          handleReconnect();
        }
      };

      ws.onerror = (event) => {
        clearTimeout(connectionTimeoutRef.current);
        setStatus(WebSocketStatus.ERROR);
        setError(event);
        log('WebSocket error', event);

        if (onError) onError(event);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          log('Message received:', data);

          // Handle heartbeat response
          if (data.type === 'pong') {
            log('Heartbeat received');
            return;
          }

          // Handle specific message types
          if (data.type && messageHandlersRef.current.has(data.type)) {
            const handlers = messageHandlersRef.current.get(data.type);
            handlers.forEach(handler => handler(data));
          }

          // Call general message handler
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          log('Failed to parse message:', error);
        }
      };
    } catch (error) {
      setStatus(WebSocketStatus.ERROR);
      setError(error);
      log('Connection error:', error);
      if (onError) onError(error);
    }
  }, [url, protocols, reconnectAttempts, reconnectDelay, onOpen, onClose, onError, onMessage, log]);

  // ==========================================================================
  // Reconnection Logic
  // ==========================================================================

  const handleReconnect = useCallback(() => {
    if (!isMountedRef.current) return;

    if (reconnectAttemptsRef.current <= 0) {
      log('Max reconnection attempts reached');
      setStatus(WebSocketStatus.ERROR);
      setError(new Error('Max reconnection attempts reached'));
      return;
    }

    setStatus(WebSocketStatus.RECONNECTING);
    setConnectionAttempts(prev => prev + 1);
    reconnectAttemptsRef.current--;

    log(`Reconnecting... (${reconnectAttemptsRef.current} attempts remaining)`);

    if (onReconnectAttempt) {
      onReconnectAttempt(reconnectAttemptsRef.current);
    }

    clearTimeout(reconnectTimerRef.current);
    reconnectTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        if (onReconnect) onReconnect();
        connect();
      }
    }, reconnectDelayRef.current);
  }, [connect, onReconnect, onReconnectAttempt, log]);

  // ==========================================================================
  // Heartbeat
  // ==========================================================================

  const startHeartbeat = useCallback(() => {
    stopHeartbeat();
    heartbeatTimerRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        sendMessage({ type: 'ping', timestamp: Date.now() });
        log('Heartbeat sent');
      }
    }, heartbeatInterval);
  }, [heartbeatInterval, log]);

  const stopHeartbeat = useCallback(() => {
    clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = null;
  }, []);

  // ==========================================================================
  // Message Queue
  // ==========================================================================

  const flushMessageQueue = useCallback(() => {
    if (messageQueue.length === 0) return;

    log(`Flushing ${messageQueue.length} queued messages`);
    const queue = [...messageQueue];
    setMessageQueue([]);

    queue.forEach(({ message, resolve, reject }) => {
      try {
        sendMessage(message);
        if (resolve) resolve();
      } catch (error) {
        if (reject) reject(error);
      }
    });
  }, [messageQueue, log]);

  const queueMessage = useCallback((message) => {
    return new Promise((resolve, reject) => {
      setMessageQueue(prev => [...prev, { message, resolve, reject }]);
    });
  }, []);

  // ==========================================================================
  // Public Methods
  // ==========================================================================

  const sendMessage = useCallback((data) => {
    const ws = wsRef.current;

    if (!ws || ws.readyState !== WebSocket.OPEN) {
      log('WebSocket not connected, queuing message');
      return queueMessage(data);
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      ws.send(message);
      log('Message sent:', data);
      return Promise.resolve();
    } catch (error) {
      log('Failed to send message:', error);
      return Promise.reject(error);
    }
  }, [queueMessage, log]);

  const send = useCallback((type, payload = {}) => {
    return sendMessage({
      type,
      ...payload,
      timestamp: Date.now(),
    });
  }, [sendMessage]);

  const subscribe = useCallback((type, handler) => {
    if (!messageHandlersRef.current.has(type)) {
      messageHandlersRef.current.set(type, []);
    }
    messageHandlersRef.current.get(type).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = messageHandlersRef.current.get(type);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
          messageHandlersRef.current.delete(type);
        }
      }
    };
  }, []);

  const disconnect = useCallback(() => {
    clearTimeout(reconnectTimerRef.current);
    clearTimeout(connectionTimeoutRef.current);
    stopHeartbeat();
    reconnectAttemptsRef.current = 0;

    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }

    setStatus(WebSocketStatus.DISCONNECTED);
    setIsConnected(false);
    log('WebSocket disconnected manually');
  }, [stopHeartbeat, log]);

  const reconnect = useCallback(() => {
    disconnect();
    setTimeout(() => {
      if (isMountedRef.current) {
        connect();
      }
    }, 500);
  }, [disconnect, connect]);

  // ==========================================================================
  // Cleanup
  // ==========================================================================

  useEffect(() => {
    isMountedRef.current = true;

    // Auto-connect if enabled
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      isMountedRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      clearTimeout(connectionTimeoutRef.current);
      stopHeartbeat();
      messageHandlersRef.current.clear();

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }

      log('WebSocket cleanup complete');
    };
  }, []); // Empty dependency array - only run on mount/unmount

  // ==========================================================================
  // Return Value
  // ==========================================================================

  return {
    // State
    status,
    isConnected,
    lastMessage,
    error,
    connectionAttempts,
    messageQueue,

    // Connection methods
    connect,
    disconnect,
    reconnect,

    // Message methods
    send,
    sendMessage,
    subscribe,

    // Utility
    isConnecting: status === WebSocketStatus.CONNECTING,
    isReconnecting: status === WebSocketStatus.RECONNECTING,
    isDisconnected: status === WebSocketStatus.DISCONNECTED,
    hasError: status === WebSocketStatus.ERROR,
  };
};

// ============================================================================
// WebSocket Context
// ============================================================================

import React from 'react';

const WebSocketContext = React.createContext(null);

export const WebSocketProvider = ({ children, ...options }) => {
  const ws = useWebSocket(options);

  return (
    <WebSocketContext.Provider value={ws}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = React.useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

// ============================================================================
// Helper Hooks
// ============================================================================

/**
 * Hook to subscribe to specific message types
 */
export const useWebSocketSubscription = (type, handler, dependencies = []) => {
  const ws = useWebSocketContext();

  useEffect(() => {
    if (!ws.isConnected) return;

    const unsubscribe = ws.subscribe(type, handler);
    return unsubscribe;
  }, [type, handler, ws.isConnected, ...dependencies]);
};

/**
 * Hook to send messages
 */
export const useWebSocketSender = () => {
  const ws = useWebSocketContext();
  return ws.send;
};

/**
 * Hook to get connection status
 */
export const useWebSocketStatus = () => {
  const ws = useWebSocketContext();
  return {
    status: ws.status,
    isConnected: ws.isConnected,
    error: ws.error,
    connectionAttempts: ws.connectionAttempts,
  };
};

// ============================================================================
// Usage Examples
// ============================================================================

/*
// Basic usage
const MyComponent = () => {
  const ws = useWebSocket({
    url: 'ws://localhost:8000/ws',
    onMessage: (data) => {
      console.log('Received:', data);
    },
    onOpen: () => {
      console.log('Connected!');
    },
  });

  const sendMessage = () => {
    ws.send('ping', { data: 'Hello' });
  };

  return (
    <div>
      Status: {ws.status}
      <button onClick={sendMessage}>Send</button>
      <button onClick={ws.disconnect}>Disconnect</button>
      <button onClick={ws.reconnect}>Reconnect</button>
    </div>
  );
};

// With subscription
const ParkingUpdate = () => {
  useWebSocketSubscription('parking_update', (data) => {
    console.log('Parking update:', data);
    // Update UI
  });

  return <div>Watching for parking updates</div>;
};

// With context
const App = () => {
  return (
    <WebSocketProvider url="ws://localhost:8000/ws">
      <MyComponent />
      <ParkingUpdate />
    </WebSocketProvider>
  );
};
*/

// ============================================================================
// Export
// ============================================================================

export default useWebSocket;
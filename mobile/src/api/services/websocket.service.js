// ============================================================================
// WebSocket Service - Real-time Communication Service
// ============================================================================

import { EventEmitter } from 'events';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import apiClient from '../client';

/**
 * WebSocket Service - Handles real-time WebSocket connections and events
 */
class WebSocketService extends EventEmitter {
  constructor() {
    super();
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000;
    this.maxReconnectDelay = 30000;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.lastHeartbeat = null;
    this.messageQueue = [];
    this.isReconnecting = false;
    this.connectionId = null;
    this.userId = null;
    this.token = null;
    this.subscriptions = new Map();
    this.pendingRequests = new Map();
    this.requestCounter = 0;
    
    // Bind methods
    this.handleNetworkChange = this.handleNetworkChange.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    
    // Setup network listeners
    this.setupNetworkListeners();
  }

  /**
   * Initialize WebSocket service with user credentials
   * @param {string} token - Authentication token
   * @param {string} userId - User ID
   */
  initialize(token, userId) {
    this.token = token;
    this.userId = userId;
    this.connect();
  }

  /**
   * Connect to WebSocket server
   */
  connect() {
    if (this.isConnected) {
      return;
    }

    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.disconnect();

    try {
      const wsUrl = this.getWebSocketUrl();
      this.ws = new WebSocket(wsUrl);
      
      // Set timeout for connection
      const connectionTimeout = setTimeout(() => {
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          this.ws.close();
          this.handleConnectionTimeout();
        }
      }, 10000);

      this.ws.onopen = (event) => {
        clearTimeout(connectionTimeout);
        this.handleOpen(event);
      };
      
      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Get WebSocket URL with authentication
   * @returns {string} WebSocket URL
   */
  getWebSocketUrl() {
    const baseUrl = process.env.WS_URL || 'ws://localhost:3000/ws';
    const params = new URLSearchParams({
      token: this.token,
      userId: this.userId,
      platform: Platform.OS,
      version: process.env.APP_VERSION || '1.0.0'
    });
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Handle WebSocket open event
   * @param {Event} event - WebSocket event
   */
  handleOpen(event) {
    this.isConnected = true;
    this.isReconnecting = false;
    this.reconnectAttempts = 0;
    this.lastHeartbeat = Date.now();
    
    // Start heartbeat
    this.startHeartbeat();
    
    // Send authentication
    this.authenticate();
    
    // Process queued messages
    this.processMessageQueue();
    
    // Emit connected event
    this.emit('connected', {
      connectionId: this.connectionId,
      timestamp: Date.now()
    });
    
    console.log('WebSocket connected');
  }

  /**
   * Authenticate with the WebSocket server
   */
  authenticate() {
    this.send({
      type: 'auth',
      payload: {
        token: this.token,
        userId: this.userId
      }
    });
  }

  /**
   * Handle WebSocket message event
   * @param {MessageEvent} event - WebSocket message event
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      
      // Handle heartbeat response
      if (message.type === 'heartbeat') {
        this.lastHeartbeat = Date.now();
        this.emit('heartbeat', message);
        return;
      }
      
      // Handle authentication response
      if (message.type === 'auth') {
        this.handleAuthResponse(message);
        return;
      }
      
      // Handle subscription acknowledgement
      if (message.type === 'subscribe' || message.type === 'unsubscribe') {
        this.handleSubscriptionResponse(message);
        return;
      }
      
      // Handle request response
      if (message.id && this.pendingRequests.has(message.id)) {
        const { resolve, reject } = this.pendingRequests.get(message.id);
        this.pendingRequests.delete(message.id);
        
        if (message.error) {
          reject(message.error);
        } else {
          resolve(message.payload);
        }
        return;
      }
      
      // Emit event for other messages
      this.emit('message', message);
      this.emit(message.type, message.payload);
      
      // Handle specific event types
      switch (message.type) {
        case 'booking_update':
          this.emit('booking:update', message.payload);
          break;
        case 'payment_update':
          this.emit('payment:update', message.payload);
          break;
        case 'notification':
          this.emit('notification:receive', message.payload);
          break;
        case 'parking_spot_update':
          this.emit('parking:update', message.payload);
          break;
        case 'charging_update':
          this.emit('charging:update', message.payload);
          break;
        case 'user_update':
          this.emit('user:update', message.payload);
          break;
        case 'system_alert':
          this.emit('system:alert', message.payload);
          break;
        default:
          this.emit('custom:' + message.type, message.payload);
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
      this.emit('error', { error: 'Invalid message format' });
    }
  }

  /**
   * Handle authentication response
   * @param {Object} message - Authentication response
   */
  handleAuthResponse(message) {
    if (message.payload?.success) {
      this.connectionId = message.payload.connectionId;
      this.emit('authenticated', message.payload);
      
      // Resubscribe to previous subscriptions
      this.resubscribeAll();
    } else {
      this.emit('auth_error', message.payload?.error || 'Authentication failed');
      this.disconnect();
    }
  }

  /**
   * Handle subscription response
   * @param {Object} message - Subscription response
   */
  handleSubscriptionResponse(message) {
    const { channel, success, error } = message.payload || {};
    
    if (channel) {
      if (success) {
        this.emit(`subscribed:${channel}`, message.payload);
      } else {
        this.emit(`subscribe_error:${channel}`, error);
      }
    }
  }

  /**
   * Handle WebSocket close event
   * @param {CloseEvent} event - WebSocket close event
   */
  handleClose(event) {
    this.isConnected = false;
    this.stopHeartbeat();
    
    console.log(`WebSocket disconnected: ${event.code} - ${event.reason}`);
    
    this.emit('disconnected', {
      code: event.code,
      reason: event.reason,
      wasClean: event.wasClean
    });
    
    // Attempt reconnect if not intentionally closed
    if (!event.wasClean || event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  /**
   * Handle WebSocket error event
   * @param {Event} event - WebSocket error event
   */
  handleError(event) {
    console.error('WebSocket error:', event);
    this.emit('error', event);
    
    // Close connection on error
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Handle connection timeout
   */
  handleConnectionTimeout() {
    console.error('WebSocket connection timeout');
    this.emit('timeout');
    this.scheduleReconnect();
  }

  /**
   * Schedule reconnection attempt
   */
  scheduleReconnect() {
    if (this.isReconnecting) {
      return;
    }
    
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit('reconnect_failed', {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts
      });
      return;
    }
    
    this.isReconnecting = true;
    const delay = Math.min(
      this.reconnectDelay * Math.pow(1.5, this.reconnectAttempts),
      this.maxReconnectDelay
    );
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.reconnectAttempts++;
      this.isReconnecting = false;
      this.connect();
    }, delay);
  }

  /**
   * Setup network listeners for connectivity changes
   */
  setupNetworkListeners() {
    NetInfo.addEventListener((state) => {
      this.handleNetworkChange(state);
    });
  }

  /**
   * Handle network connectivity changes
   * @param {Object} state - Network state
   */
  handleNetworkChange(state) {
    if (state.isConnected) {
      if (!this.isConnected && this.token) {
        this.connect();
      }
    } else {
      if (this.isConnected) {
        this.disconnect();
        this.emit('network_lost');
      }
    }
  }

  /**
   * Start heartbeat interval
   */
  startHeartbeat() {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.send({
          type: 'heartbeat',
          timestamp: Date.now()
        });
        
        // Check for heartbeat timeout
        const now = Date.now();
        if (this.lastHeartbeat && (now - this.lastHeartbeat) > 30000) {
          console.warn('Heartbeat timeout, reconnecting...');
          this.reconnect();
        }
      }
    }, 15000);
  }

  /**
   * Stop heartbeat interval
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Send message to WebSocket server
   * @param {Object} message - Message to send
   * @param {boolean} requireAck - Whether acknowledgment is required
   * @returns {Promise} Promise that resolves when message is sent
   */
  send(message, requireAck = false) {
    return new Promise((resolve, reject) => {
      const messageWithId = {
        ...message,
        timestamp: Date.now()
      };
      
      if (requireAck) {
        const id = this.generateRequestId();
        messageWithId.id = id;
        this.pendingRequests.set(id, { resolve, reject });
        
        // Set timeout for request
        setTimeout(() => {
          if (this.pendingRequests.has(id)) {
            this.pendingRequests.delete(id);
            reject(new Error('Request timeout'));
          }
        }, 30000);
      }
      
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(messageWithId));
          if (!requireAck) {
            resolve(messageWithId);
          }
        } catch (error) {
          if (requireAck && this.pendingRequests.has(messageWithId.id)) {
            this.pendingRequests.delete(messageWithId.id);
          }
          reject(error);
        }
      } else {
        // Queue message for later
        this.messageQueue.push(messageWithId);
        resolve(messageWithId);
        
        // Try to reconnect if not connected
        if (!this.isConnected && this.token) {
          this.connect();
        }
      }
    });
  }

  /**
   * Generate unique request ID
   * @returns {string} Request ID
   */
  generateRequestId() {
    this.requestCounter++;
    return `req_${Date.now()}_${this.requestCounter}`;
  }

  /**
   * Process queued messages
   */
  processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        try {
          this.ws.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error sending queued message:', error);
          // Re-queue on error
          this.messageQueue.unshift(message);
          break;
        }
      } else {
        // Re-queue if not connected
        this.messageQueue.unshift(message);
        break;
      }
    }
  }

  /**
   * Subscribe to a channel
   * @param {string} channel - Channel name
   * @param {Object} filters - Optional filters
   * @returns {Promise} Promise that resolves when subscribed
   */
  async subscribe(channel, filters = {}) {
    try {
      const response = await this.send({
        type: 'subscribe',
        payload: { channel, filters }
      }, true);
      
      // Store subscription
      this.subscriptions.set(channel, { filters, subscribed: true });
      this.emit(`subscribed:${channel}`, response);
      
      return response;
    } catch (error) {
      this.emit(`subscribe_error:${channel}`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a channel
   * @param {string} channel - Channel name
   * @returns {Promise} Promise that resolves when unsubscribed
   */
  async unsubscribe(channel) {
    try {
      const response = await this.send({
        type: 'unsubscribe',
        payload: { channel }
      }, true);
      
      // Remove subscription
      this.subscriptions.delete(channel);
      this.emit(`unsubscribed:${channel}`, response);
      
      return response;
    } catch (error) {
      this.emit(`unsubscribe_error:${channel}`, error);
      throw error;
    }
  }

  /**
   * Resubscribe to all previously subscribed channels
   */
  resubscribeAll() {
    for (const [channel, data] of this.subscriptions) {
      if (data.subscribed) {
        this.subscribe(channel, data.filters).catch(error => {
          console.error(`Failed to resubscribe to ${channel}:`, error);
        });
      }
    }
  }

  /**
   * Get connection status
   * @returns {boolean} Connection status
   */
  getConnectionStatus() {
    return this.isConnected;
  }

  /**
   * Get connection details
   * @returns {Object} Connection details
   */
  getConnectionDetails() {
    return {
      isConnected: this.isConnected,
      connectionId: this.connectionId,
      userId: this.userId,
      reconnectAttempts: this.reconnectAttempts,
      subscriptions: Array.from(this.subscriptions.keys()),
      pendingRequests: this.pendingRequests.size,
      queuedMessages: this.messageQueue.length
    };
  }

  /**
   * Reconnect WebSocket
   */
  reconnect() {
    this.disconnect();
    this.reconnectAttempts = 0;
    this.connect();
  }

  /**
   * Disconnect WebSocket
   */
  disconnect() {
    this.isReconnecting = false;
    this.stopHeartbeat();
    this.messageQueue = [];
    
    if (this.ws) {
      try {
        this.ws.close(1000, 'Client disconnected');
      } catch (error) {
        // Ignore close errors
      }
      this.ws = null;
    }
    
    this.isConnected = false;
    this.connectionId = null;
    this.emit('disconnected', { reason: 'Client disconnected' });
  }

  /**
   * Cleanup and destroy service
   */
  destroy() {
    this.disconnect();
    this.removeAllListeners();
    this.subscriptions.clear();
    this.pendingRequests.clear();
    this.messageQueue = [];
    this.token = null;
    this.userId = null;
    
    // Remove network listeners
    NetInfo.removeEventListener(this.handleNetworkChange);
  }
}

// Export a singleton instance
export default new WebSocketService();
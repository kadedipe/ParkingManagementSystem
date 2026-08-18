// ============================================================================
// Charging Service - API Service for EV Charging Management
// ============================================================================

import apiClient from '../client';

/**
 * Charging Service - Handles all EV charging-related API operations
 */
class ChargingService {
  /**
   * Get all charging stations
   * @param {Object} params - Query parameters (page, limit, status, location, etc.)
   * @returns {Promise} - API response with charging stations list
   */
  async getChargingStations(params = {}) {
    try {
      const response = await apiClient.get('/charging/stations', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific charging station by ID
   * @param {string} stationId - Charging station ID
   * @returns {Promise} - API response with charging station details
   */
  async getChargingStationById(stationId) {
    try {
      const response = await apiClient.get(`/charging/stations/${stationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get nearby charging stations
   * @param {Object} params - Location parameters (latitude, longitude, radius)
   * @returns {Promise} - API response with nearby charging stations
   */
  async getNearbyChargingStations(params) {
    try {
      const response = await apiClient.get('/charging/stations/nearby', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging station availability
   * @param {string} stationId - Charging station ID
   * @returns {Promise} - API response with availability status
   */
  async getStationAvailability(stationId) {
    try {
      const response = await apiClient.get(`/charging/stations/${stationId}/availability`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new charging session
   * @param {Object} sessionData - Session data (stationId, vehicleId, etc.)
   * @returns {Promise} - API response with created session
   */
  async startChargingSession(sessionData) {
    try {
      const response = await apiClient.post('/charging/sessions', sessionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging session by ID
   * @param {string} sessionId - Charging session ID
   * @returns {Promise} - API response with session details
   */
  async getChargingSession(sessionId) {
    try {
      const response = await apiClient.get(`/charging/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update charging session (e.g., stop charging)
   * @param {string} sessionId - Charging session ID
   * @param {Object} sessionData - Updated session data
   * @returns {Promise} - API response with updated session
   */
  async updateChargingSession(sessionId, sessionData) {
    try {
      const response = await apiClient.patch(`/charging/sessions/${sessionId}`, sessionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Stop charging session
   * @param {string} sessionId - Charging session ID
   * @param {Object} data - Stop data (reason, etc.)
   * @returns {Promise} - API response
   */
  async stopChargingSession(sessionId, data = {}) {
    try {
      const response = await apiClient.post(`/charging/sessions/${sessionId}/stop`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's active charging sessions
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with active sessions
   */
  async getActiveSessions(params = {}) {
    try {
      const response = await apiClient.get('/charging/sessions/active', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's charging history
   * @param {Object} params - Query parameters (page, limit, dateRange, etc.)
   * @returns {Promise} - API response with charging history
   */
  async getChargingHistory(params = {}) {
    try {
      const response = await apiClient.get('/charging/sessions/history', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging session status
   * @param {string} sessionId - Charging session ID
   * @returns {Promise} - API response with session status
   */
  async getSessionStatus(sessionId) {
    try {
      const response = await apiClient.get(`/charging/sessions/${sessionId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging rates/pricing
   * @param {Object} params - Query parameters (stationId, timeSlot, etc.)
   * @returns {Promise} - API response with charging rates
   */
  async getChargingRates(params = {}) {
    try {
      const response = await apiClient.get('/charging/rates', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Reserve a charging station
   * @param {string} stationId - Charging station ID
   * @param {Object} reservationData - Reservation data (startTime, endTime, vehicleId)
   * @returns {Promise} - API response with reservation details
   */
  async reserveChargingStation(stationId, reservationData) {
    try {
      const response = await apiClient.post(
        `/charging/stations/${stationId}/reserve`,
        reservationData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel charging station reservation
   * @param {string} reservationId - Reservation ID
   * @returns {Promise} - API response
   */
  async cancelReservation(reservationId) {
    try {
      const response = await apiClient.delete(`/charging/reservations/${reservationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user's charging reservations
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with reservations list
   */
  async getReservations(params = {}) {
    try {
      const response = await apiClient.get('/charging/reservations', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging station reviews
   * @param {string} stationId - Charging station ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with reviews
   */
  async getStationReviews(stationId, params = {}) {
    try {
      const response = await apiClient.get(`/charging/stations/${stationId}/reviews`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add review for charging station
   * @param {string} stationId - Charging station ID
   * @param {Object} reviewData - Review data (rating, comment, etc.)
   * @returns {Promise} - API response
   */
  async addStationReview(stationId, reviewData) {
    try {
      const response = await apiClient.post(
        `/charging/stations/${stationId}/reviews`,
        reviewData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging station statistics
   * @param {string} stationId - Charging station ID
   * @param {Object} params - Query parameters (dateRange, etc.)
   * @returns {Promise} - API response with statistics
   */
  async getStationStats(stationId, params = {}) {
    try {
      const response = await apiClient.get(`/charging/stations/${stationId}/stats`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging station connectors/ports
   * @param {string} stationId - Charging station ID
   * @returns {Promise} - API response with connectors list
   */
  async getStationConnectors(stationId) {
    try {
      const response = await apiClient.get(`/charging/stations/${stationId}/connectors`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get connector status
   * @param {string} stationId - Charging station ID
   * @param {string} connectorId - Connector ID
   * @returns {Promise} - API response with connector status
   */
  async getConnectorStatus(stationId, connectorId) {
    try {
      const response = await apiClient.get(
        `/charging/stations/${stationId}/connectors/${connectorId}/status`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging session invoice
   * @param {string} sessionId - Charging session ID
   * @returns {Promise} - API response with invoice details
   */
  async getSessionInvoice(sessionId) {
    try {
      const response = await apiClient.get(`/charging/sessions/${sessionId}/invoice`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get favorite charging stations
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with favorite stations
   */
  async getFavoriteStations(params = {}) {
    try {
      const response = await apiClient.get('/charging/stations/favorites', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add charging station to favorites
   * @param {string} stationId - Charging station ID
   * @returns {Promise} - API response
   */
  async addFavoriteStation(stationId) {
    try {
      const response = await apiClient.post(`/charging/stations/${stationId}/favorite`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove charging station from favorites
   * @param {string} stationId - Charging station ID
   * @returns {Promise} - API response
   */
  async removeFavoriteStation(stationId) {
    try {
      const response = await apiClient.delete(`/charging/stations/${stationId}/favorite`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Report charging station issue
   * @param {string} stationId - Charging station ID
   * @param {Object} reportData - Issue report data
   * @returns {Promise} - API response
   */
  async reportStationIssue(stationId, reportData) {
    try {
      const response = await apiClient.post(
        `/charging/stations/${stationId}/report`,
        reportData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get real-time charging data
   * @param {string} sessionId - Charging session ID
   * @returns {Promise} - API response with real-time data
   */
  async getRealTimeChargingData(sessionId) {
    try {
      const response = await apiClient.get(`/charging/sessions/${sessionId}/realtime`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging station energy consumption
   * @param {string} stationId - Charging station ID
   * @param {Object} params - Query parameters (dateRange, etc.)
   * @returns {Promise} - API response with energy consumption data
   */
  async getStationEnergyConsumption(stationId, params = {}) {
    try {
      const response = await apiClient.get(
        `/charging/stations/${stationId}/energy-consumption`,
        { params }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging payment methods
   * @returns {Promise} - API response with payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await apiClient.get('/charging/payment-methods');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process charging payment
   * @param {string} sessionId - Charging session ID
   * @param {Object} paymentData - Payment data (method, amount, etc.)
   * @returns {Promise} - API response with payment confirmation
   */
  async processPayment(sessionId, paymentData) {
    try {
      const response = await apiClient.post(
        `/charging/sessions/${sessionId}/payment`,
        paymentData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Object} error - Error object from axios
   * @returns {Object} - Standardized error object
   */
  handleError(error) {
    if (!error.response) {
      // Network error
      return {
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null,
      };
    }

    const { status, data } = error.response;
    
    // Handle specific HTTP status codes
    switch (status) {
      case 400:
        return {
          code: 'BAD_REQUEST',
          message: data?.message || 'Invalid request. Please check your input.',
          status,
          data: data?.errors || null,
        };
      case 401:
        return {
          code: 'UNAUTHORIZED',
          message: 'Authentication required. Please log in again.',
          status,
          data: null,
        };
      case 403:
        return {
          code: 'FORBIDDEN',
          message: 'You do not have permission to perform this action.',
          status,
          data: null,
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: data?.message || 'Resource not found.',
          status,
          data: null,
        };
      case 409:
        return {
          code: 'CONFLICT',
          message: data?.message || 'Conflicting data. Please check your request.',
          status,
          data: data?.details || null,
        };
      case 422:
        return {
          code: 'VALIDATION_ERROR',
          message: data?.message || 'Validation error.',
          status,
          data: data?.errors || null,
        };
      case 429:
        return {
          code: 'RATE_LIMIT',
          message: 'Too many requests. Please try again later.',
          status,
          data: null,
        };
      case 503:
        return {
          code: 'SERVICE_UNAVAILABLE',
          message: 'Charging service temporarily unavailable. Please try again later.',
          status,
          data: null,
        };
      default:
        return {
          code: 'UNKNOWN_ERROR',
          message: data?.message || 'An unexpected error occurred.',
          status,
          data: null,
        };
    }
  }
}

// Export a singleton instance
export default new ChargingService();
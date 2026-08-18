// ============================================================================
// Parking Service
// ============================================================================

/**
 * Parking service for the mobile app.
 * 
 * This service handles all parking-related API calls including:
 * - Parking spot management
 * - Parking sessions
 * - Reservations
 * - Rates
 */

import apiClient from '../client';
import { API_ENDPOINTS } from '../endpoints';

// ============================================================================
// Parking Service
// ============================================================================

const parkingService = {
  // ==========================================================================
  // Parking Spots
  // ==========================================================================

  /**
   * Get parking spots
   */
  async getSpots(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.parking.spots, { params });
    return response.data;
  },

  /**
   * Get parking spot by ID
   */
  async getSpot(id) {
    const response = await apiClient.get(API_ENDPOINTS.parking.spot(id));
    return response.data;
  },

  /**
   * Get available spots
   */
  async getAvailableSpots(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.parking.available, { params });
    return response.data;
  },

  /**
   * Create parking spot (admin)
   */
  async createSpot(data) {
    const response = await apiClient.post(API_ENDPOINTS.parking.spots, data);
    return response.data;
  },

  /**
   * Update parking spot (admin)
   */
  async updateSpot(id, data) {
    const response = await apiClient.put(API_ENDPOINTS.parking.spot(id), data);
    return response.data;
  },

  /**
   * Delete parking spot (admin)
   */
  async deleteSpot(id) {
    const response = await apiClient.delete(API_ENDPOINTS.parking.spot(id));
    return response.data;
  },

  // ==========================================================================
  // Parking Sessions
  // ==========================================================================

  /**
   * Start parking session
   */
  async startSession(data) {
    const response = await apiClient.post(API_ENDPOINTS.parking.sessionStart, data);
    return response.data;
  },

  /**
   * End parking session
   */
  async endSession(id) {
    const response = await apiClient.post(API_ENDPOINTS.parking.sessionEnd(id));
    return response.data;
  },

  /**
   * Get parking session
   */
  async getSession(id) {
    const response = await apiClient.get(API_ENDPOINTS.parking.session(id));
    return response.data;
  },

  /**
   * Get active sessions
   */
  async getActiveSessions() {
    const response = await apiClient.get(API_ENDPOINTS.parking.activeSessions);
    return response.data;
  },

  /**
   * Get session history
   */
  async getSessionHistory(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.parking.sessionHistory, { params });
    return response.data;
  },

  /**
   * Extend parking session
   */
  async extendSession(id, additionalMinutes) {
    const response = await apiClient.post(
      `${API_ENDPOINTS.parking.session(id)}/extend`,
      { additional_minutes: additionalMinutes }
    );
    return response.data;
  },

  // ==========================================================================
  // Reservations
  // ==========================================================================

  /**
   * Create reservation
   */
  async createReservation(data) {
    const response = await apiClient.post(API_ENDPOINTS.parking.reservations, data);
    return response.data;
  },

  /**
   * Get reservations
   */
  async getReservations(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.parking.reservations, { params });
    return response.data;
  },

  /**
   * Get reservation by ID
   */
  async getReservation(id) {
    const response = await apiClient.get(API_ENDPOINTS.parking.reservation(id));
    return response.data;
  },

  /**
   * Cancel reservation
   */
  async cancelReservation(id) {
    const response = await apiClient.post(API_ENDPOINTS.parking.reservationCancel(id));
    return response.data;
  },

  /**
   * Get upcoming reservations
   */
  async getUpcomingReservations() {
    const response = await apiClient.get(API_ENDPOINTS.parking.upcomingReservations);
    return response.data;
  },

  // ==========================================================================
  // Rates
  // ==========================================================================

  /**
   * Get parking rates
   */
  async getRates(params = {}) {
    const response = await apiClient.get(API_ENDPOINTS.parking.rates, { params });
    return response.data;
  },

  /**
   * Get rate by ID
   */
  async getRate(id) {
    const response = await apiClient.get(API_ENDPOINTS.parking.rate(id));
    return response.data;
  },

  /**
   * Create rate (admin)
   */
  async createRate(data) {
    const response = await apiClient.post(API_ENDPOINTS.parking.rates, data);
    return response.data;
  },

  /**
   * Update rate (admin)
   */
  async updateRate(id, data) {
    const response = await apiClient.put(API_ENDPOINTS.parking.rate(id), data);
    return response.data;
  },

  /**
   * Delete rate (admin)
   */
  async deleteRate(id) {
    const response = await apiClient.delete(API_ENDPOINTS.parking.rate(id));
    return response.data;
  },

  // ==========================================================================
  // Utilities
  // ==========================================================================

  /**
   * Calculate parking fee
   */
  async calculateFee(sessionId) {
    const response = await apiClient.get(
      `${API_ENDPOINTS.parking.session(sessionId)}/calculate-fee`
    );
    return response.data;
  },

  /**
   * Check spot availability
   */
  async checkAvailability(spotId, startTime, endTime) {
    const response = await apiClient.get(
      `${API_ENDPOINTS.parking.spot(spotId)}/availability`,
      {
        params: { start_time: startTime, end_time: endTime },
      }
    );
    return response.data;
  },
};

// ============================================================================
// Export
// ============================================================================

export default parkingService;
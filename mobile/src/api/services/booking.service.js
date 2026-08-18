// ============================================================================
// Booking Service - API Service for Parking Booking Management
// ============================================================================

import apiClient from '../client';

/**
 * Booking Service - Handles all parking booking-related API operations
 */
class BookingService {
  /**
   * Get all bookings for the current user
   * @param {Object} params - Query parameters (page, limit, status, dateRange, etc.)
   * @returns {Promise} - API response with bookings list
   */
  async getBookings(params = {}) {
    try {
      const response = await apiClient.get('/bookings', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific booking by ID
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response with booking details
   */
  async getBookingById(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new parking booking
   * @param {Object} bookingData - Booking data (parkingSpotId, startTime, endTime, vehicleId, etc.)
   * @returns {Promise} - API response with created booking
   */
  async createBooking(bookingData) {
    try {
      const response = await apiClient.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing booking
   * @param {string} bookingId - Booking ID
   * @param {Object} bookingData - Updated booking data
   * @returns {Promise} - API response with updated booking
   */
  async updateBooking(bookingId, bookingData) {
    try {
      const response = await apiClient.put(`/bookings/${bookingId}`, bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Partially update a booking
   * @param {string} bookingId - Booking ID
   * @param {Object} bookingData - Partial booking data
   * @returns {Promise} - API response with updated booking
   */
  async patchBooking(bookingId, bookingData) {
    try {
      const response = await apiClient.patch(`/bookings/${bookingId}`, bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a booking
   * @param {string} bookingId - Booking ID
   * @param {Object} data - Cancel data (reason, etc.)
   * @returns {Promise} - API response
   */
  async cancelBooking(bookingId, data = {}) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/cancel`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Confirm a booking (for pending bookings)
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response with confirmed booking
   */
  async confirmBooking(bookingId) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/confirm`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check-in to a booking
   * @param {string} bookingId - Booking ID
   * @param {Object} data - Check-in data (vehiclePlate, notes, etc.)
   * @returns {Promise} - API response
   */
  async checkInBooking(bookingId, data = {}) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/check-in`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Check-out from a booking
   * @param {string} bookingId - Booking ID
   * @param {Object} data - Check-out data (notes, rating, etc.)
   * @returns {Promise} - API response
   */
  async checkOutBooking(bookingId, data = {}) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/check-out`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Extend booking duration
   * @param {string} bookingId - Booking ID
   * @param {Object} data - Extension data (newEndTime, additionalDuration, etc.)
   * @returns {Promise} - API response with updated booking
   */
  async extendBooking(bookingId, data) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/extend`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get available parking spots for booking
   * @param {Object} params - Search parameters (location, startTime, endTime, spotType, etc.)
   * @returns {Promise} - API response with available spots
   */
  async getAvailableSpots(params) {
    try {
      const response = await apiClient.get('/bookings/available-spots', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking history
   * @param {Object} params - Query parameters (page, limit, dateRange, status, etc.)
   * @returns {Promise} - API response with booking history
   */
  async getBookingHistory(params = {}) {
    try {
      const response = await apiClient.get('/bookings/history', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get upcoming bookings
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise} - API response with upcoming bookings
   */
  async getUpcomingBookings(params = {}) {
    try {
      const response = await apiClient.get('/bookings/upcoming', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get active bookings (currently in progress)
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with active bookings
   */
  async getActiveBookings(params = {}) {
    try {
      const response = await apiClient.get('/bookings/active', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking statistics
   * @param {Object} params - Query parameters (dateRange, etc.)
   * @returns {Promise} - API response with booking statistics
   */
  async getBookingStats(params = {}) {
    try {
      const response = await apiClient.get('/bookings/stats', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking invoice/receipt
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response with invoice details
   */
  async getBookingInvoice(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/invoice`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking QR code
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response with QR code data
   */
  async getBookingQRCode(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/qrcode`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send booking notification/reminder
   * @param {string} bookingId - Booking ID
   * @param {Object} data - Notification data (type, message, etc.)
   * @returns {Promise} - API response
   */
  async sendBookingNotification(bookingId, data = {}) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/notify`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate booking availability
   * @param {Object} data - Validation data (parkingSpotId, startTime, endTime)
   * @returns {Promise} - API response with availability status
   */
  async validateBooking(data) {
    try {
      const response = await apiClient.post('/bookings/validate', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking by QR code
   * @param {string} qrCode - QR code string
   * @returns {Promise} - API response with booking details
   */
  async getBookingByQRCode(qrCode) {
    try {
      const response = await apiClient.get(`/bookings/qr/${qrCode}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking cancellation policy
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response with cancellation policy
   */
  async getCancellationPolicy(bookingId) {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/cancellation-policy`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Rate a completed booking
   * @param {string} bookingId - Booking ID
   * @param {Object} ratingData - Rating data (rating, comment, etc.)
   * @returns {Promise} - API response
   */
  async rateBooking(bookingId, ratingData) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/rate`, ratingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Report a booking issue
   * @param {string} bookingId - Booking ID
   * @param {Object} reportData - Issue report data
   * @returns {Promise} - API response
   */
  async reportBookingIssue(bookingId, reportData) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/report`, reportData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking payment methods
   * @returns {Promise} - API response with available payment methods
   */
  async getPaymentMethods() {
    try {
      const response = await apiClient.get('/bookings/payment-methods');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process booking payment
   * @param {string} bookingId - Booking ID
   * @param {Object} paymentData - Payment data
   * @returns {Promise} - API response with payment confirmation
   */
  async processPayment(bookingId, paymentData) {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/payment`, paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking status by reference
   * @param {string} reference - Booking reference number
   * @returns {Promise} - API response with booking status
   */
  async getBookingStatusByReference(reference) {
    try {
      const response = await apiClient.get(`/bookings/reference/${reference}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking time slots for a parking spot
   * @param {string} parkingSpotId - Parking spot ID
   * @param {Object} params - Query parameters (date, duration, etc.)
   * @returns {Promise} - API response with available time slots
   */
  async getTimeSlots(parkingSpotId, params = {}) {
    try {
      const response = await apiClient.get(`/bookings/time-slots/${parkingSpotId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Save booking draft (for incomplete bookings)
   * @param {Object} draftData - Draft booking data
   * @returns {Promise} - API response with saved draft
   */
  async saveBookingDraft(draftData) {
    try {
      const response = await apiClient.post('/bookings/draft', draftData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get saved booking drafts
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with drafts list
   */
  async getBookingDrafts(params = {}) {
    try {
      const response = await apiClient.get('/bookings/drafts', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete booking draft
   * @param {string} draftId - Draft ID
   * @returns {Promise} - API response
   */
  async deleteBookingDraft(draftId) {
    try {
      const response = await apiClient.delete(`/bookings/drafts/${draftId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking recommendations
   * @param {Object} params - Recommendation parameters (location, preferences, etc.)
   * @returns {Promise} - API response with booking recommendations
   */
  async getBookingRecommendations(params = {}) {
    try {
      const response = await apiClient.get('/bookings/recommendations', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Compare booking prices
   * @param {Object} data - Comparison data (spots, dates, etc.)
   * @returns {Promise} - API response with price comparison
   */
  async comparePrices(data) {
    try {
      const response = await apiClient.post('/bookings/compare-prices', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get monthly booking summary
   * @param {Object} params - Query parameters (year, month, etc.)
   * @returns {Promise} - API response with monthly summary
   */
  async getMonthlySummary(params = {}) {
    try {
      const response = await apiClient.get('/bookings/monthly-summary', { params });
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
          message: data?.message || 'Booking not found.',
          status,
          data: null,
        };
      case 409:
        return {
          code: 'CONFLICT',
          message: data?.message || 'Booking conflict. The spot may already be booked.',
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
          message: 'Booking service temporarily unavailable. Please try again later.',
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
export default new BookingService();
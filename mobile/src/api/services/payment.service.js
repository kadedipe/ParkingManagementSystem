// ============================================================================
// Payment Service - API Service for Payment Management
// ============================================================================

import apiClient from '../client';

/**
 * Payment Service - Handles all payment-related API operations
 */
class PaymentService {
  /**
   * Get all payments for the current user
   * @param {Object} params - Query parameters (page, limit, status, dateRange, etc.)
   * @returns {Promise} - API response with payments list
   */
  async getPayments(params = {}) {
    try {
      const response = await apiClient.get('/payments', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific payment by ID
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - API response with payment details
   */
  async getPaymentById(paymentId) {
    try {
      const response = await apiClient.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new payment
   * @param {Object} paymentData - Payment data (amount, method, bookingId, etc.)
   * @returns {Promise} - API response with created payment
   */
  async createPayment(paymentData) {
    try {
      const response = await apiClient.post('/payments', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process a payment
   * @param {string} paymentId - Payment ID
   * @param {Object} paymentData - Payment processing data
   * @returns {Promise} - API response with processed payment
   */
  async processPayment(paymentId, paymentData = {}) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/process`, paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Cancel a pending payment
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Cancel data (reason, etc.)
   * @returns {Promise} - API response
   */
  async cancelPayment(paymentId, data = {}) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/cancel`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Refund a payment
   * @param {string} paymentId - Payment ID
   * @param {Object} refundData - Refund data (amount, reason, etc.)
   * @returns {Promise} - API response with refund details
   */
  async refundPayment(paymentId, refundData) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/refund`, refundData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment methods
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with available payment methods
   */
  async getPaymentMethods(params = {}) {
    try {
      const response = await apiClient.get('/payments/methods', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add a payment method
   * @param {Object} methodData - Payment method data
   * @returns {Promise} - API response with added payment method
   */
  async addPaymentMethod(methodData) {
    try {
      const response = await apiClient.post('/payments/methods', methodData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove a payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise} - API response
   */
  async removePaymentMethod(methodId) {
    try {
      const response = await apiClient.delete(`/payments/methods/${methodId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Set default payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise} - API response
   */
  async setDefaultPaymentMethod(methodId) {
    try {
      const response = await apiClient.post(`/payments/methods/${methodId}/default`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment history
   * @param {Object} params - Query parameters (page, limit, dateRange, etc.)
   * @returns {Promise} - API response with payment history
   */
  async getPaymentHistory(params = {}) {
    try {
      const response = await apiClient.get('/payments/history', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment statistics
   * @param {Object} params - Query parameters (dateRange, etc.)
   * @returns {Promise} - API response with payment statistics
   */
  async getPaymentStats(params = {}) {
    try {
      const response = await apiClient.get('/payments/stats', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment receipt
   * @param {string} paymentId - Payment ID
   * @param {Object} params - Query parameters (format, etc.)
   * @returns {Promise} - API response with receipt data
   */
  async getPaymentReceipt(paymentId, params = {}) {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/receipt`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download payment receipt
   * @param {string} paymentId - Payment ID
   * @param {Object} params - Query parameters (format, etc.)
   * @returns {Promise} - API response with receipt file
   */
  async downloadPaymentReceipt(paymentId, params = {}) {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/receipt/download`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Send payment receipt via email
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Email data (email, etc.)
   * @returns {Promise} - API response
   */
  async sendPaymentReceipt(paymentId, data = {}) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/receipt/send`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment methods for specific booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response with available payment methods
   */
  async getBookingPaymentMethods(bookingId) {
    try {
      const response = await apiClient.get(`/payments/booking/${bookingId}/methods`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment summary for booking
   * @param {string} bookingId - Booking ID
   * @returns {Promise} - API response with payment summary
   */
  async getBookingPaymentSummary(bookingId) {
    try {
      const response = await apiClient.get(`/payments/booking/${bookingId}/summary`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Process quick payment (for fast checkout)
   * @param {Object} paymentData - Quick payment data
   * @returns {Promise} - API response with payment confirmation
   */
  async processQuickPayment(paymentData) {
    try {
      const response = await apiClient.post('/payments/quick', paymentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment transaction by reference
   * @param {string} reference - Transaction reference number
   * @returns {Promise} - API response with transaction details
   */
  async getTransactionByReference(reference) {
    try {
      const response = await apiClient.get(`/payments/transaction/${reference}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Verify payment status
   * @param {string} paymentId - Payment ID
   * @returns {Promise} - API response with payment status
   */
  async verifyPaymentStatus(paymentId) {
    try {
      const response = await apiClient.get(`/payments/${paymentId}/verify`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment fee calculation
   * @param {Object} data - Fee calculation data (amount, method, etc.)
   * @returns {Promise} - API response with fee breakdown
   */
  async calculatePaymentFees(data) {
    try {
      const response = await apiClient.post('/payments/calculate-fees', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment currency rates
   * @param {Object} params - Query parameters (baseCurrency, targetCurrencies, etc.)
   * @returns {Promise} - API response with currency rates
   */
  async getCurrencyRates(params = {}) {
    try {
      const response = await apiClient.get('/payments/currency-rates', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Convert payment currency
   * @param {Object} data - Conversion data (amount, fromCurrency, toCurrency, etc.)
   * @returns {Promise} - API response with converted amount
   */
  async convertCurrency(data) {
    try {
      const response = await apiClient.post('/payments/convert-currency', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user wallet balance
   * @returns {Promise} - API response with wallet balance
   */
  async getWalletBalance() {
    try {
      const response = await apiClient.get('/payments/wallet/balance');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add funds to wallet
   * @param {Object} data - Fund data (amount, method, etc.)
   * @returns {Promise} - API response with transaction details
   */
  async addFundsToWallet(data) {
    try {
      const response = await apiClient.post('/payments/wallet/add-funds', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Withdraw funds from wallet
   * @param {Object} data - Withdrawal data (amount, method, etc.)
   * @returns {Promise} - API response with withdrawal details
   */
  async withdrawFromWallet(data) {
    try {
      const response = await apiClient.post('/payments/wallet/withdraw', data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get wallet transactions
   * @param {Object} params - Query parameters (page, limit, type, dateRange, etc.)
   * @returns {Promise} - API response with wallet transactions
   */
  async getWalletTransactions(params = {}) {
    try {
      const response = await apiClient.get('/payments/wallet/transactions', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment summary for dashboard
   * @param {Object} params - Query parameters (dateRange, etc.)
   * @returns {Promise} - API response with payment summary
   */
  async getDashboardSummary(params = {}) {
    try {
      const response = await apiClient.get('/payments/dashboard-summary', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get pending payments
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with pending payments
   */
  async getPendingPayments(params = {}) {
    try {
      const response = await apiClient.get('/payments/pending', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get failed payments
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with failed payments
   */
  async getFailedPayments(params = {}) {
    try {
      const response = await apiClient.get('/payments/failed', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Retry failed payment
   * @param {string} paymentId - Payment ID
   * @param {Object} data - Retry data
   * @returns {Promise} - API response with retry result
   */
  async retryPayment(paymentId, data = {}) {
    try {
      const response = await apiClient.post(`/payments/${paymentId}/retry`, data);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Validate payment method
   * @param {string} methodId - Payment method ID
   * @returns {Promise} - API response with validation result
   */
  async validatePaymentMethod(methodId) {
    try {
      const response = await apiClient.post(`/payments/methods/${methodId}/validate`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment analytics
   * @param {Object} params - Query parameters (metric, dateRange, etc.)
   * @returns {Promise} - API response with payment analytics
   */
  async getPaymentAnalytics(params = {}) {
    try {
      const response = await apiClient.get('/payments/analytics', { params });
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
      case 402:
        return {
          code: 'PAYMENT_REQUIRED',
          message: 'Payment required to complete this action.',
          status,
          data: data?.details || null,
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
          message: data?.message || 'Payment not found.',
          status,
          data: null,
        };
      case 409:
        return {
          code: 'CONFLICT',
          message: data?.message || 'Payment conflict. Please try again.',
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
          message: 'Payment service temporarily unavailable. Please try again later.',
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
export default new PaymentService();
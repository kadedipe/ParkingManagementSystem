// ============================================================================
// Report Service - API Service for Report Management
// ============================================================================

import apiClient from '../client';

/**
 * Report Service - Handles all report-related API operations
 */
class ReportService {
  /**
   * Get all reports (admin only)
   * @param {Object} params - Query parameters (page, limit, type, status, dateRange, etc.)
   * @returns {Promise} - API response with reports list
   */
  async getReports(params = {}) {
    try {
      const response = await apiClient.get('/reports', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific report by ID
   * @param {string} reportId - Report ID
   * @returns {Promise} - API response with report details
   */
  async getReportById(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Generate a new report
   * @param {Object} reportData - Report generation data (type, dateRange, format, etc.)
   * @returns {Promise} - API response with generated report
   */
  async generateReport(reportData) {
    try {
      const response = await apiClient.post('/reports/generate', reportData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report generation status
   * @param {string} reportId - Report ID
   * @returns {Promise} - API response with generation status
   */
  async getReportStatus(reportId) {
    try {
      const response = await apiClient.get(`/reports/${reportId}/status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Download a report
   * @param {string} reportId - Report ID
   * @param {Object} params - Query parameters (format, etc.)
   * @returns {Promise} - API response with report file
   */
  async downloadReport(reportId, params = {}) {
    try {
      const response = await apiClient.get(`/reports/${reportId}/download`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a report
   * @param {string} reportId - Report ID
   * @returns {Promise} - API response
   */
  async deleteReport(reportId) {
    try {
      const response = await apiClient.delete(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Schedule a report for generation
   * @param {Object} scheduleData - Schedule data (reportType, cronExpression, recipients, etc.)
   * @returns {Promise} - API response with scheduled report
   */
  async scheduleReport(scheduleData) {
    try {
      const response = await apiClient.post('/reports/schedule', scheduleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get scheduled reports
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with scheduled reports
   */
  async getScheduledReports(params = {}) {
    try {
      const response = await apiClient.get('/reports/schedule', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update scheduled report
   * @param {string} scheduleId - Schedule ID
   * @param {Object} scheduleData - Updated schedule data
   * @returns {Promise} - API response with updated schedule
   */
  async updateScheduledReport(scheduleId, scheduleData) {
    try {
      const response = await apiClient.put(`/reports/schedule/${scheduleId}`, scheduleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete scheduled report
   * @param {string} scheduleId - Schedule ID
   * @returns {Promise} - API response
   */
  async deleteScheduledReport(scheduleId) {
    try {
      const response = await apiClient.delete(`/reports/schedule/${scheduleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get revenue report
   * @param {Object} params - Query parameters (dateRange, parkingLotId, etc.)
   * @returns {Promise} - API response with revenue data
   */
  async getRevenueReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/revenue', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get occupancy report
   * @param {Object} params - Query parameters (dateRange, parkingLotId, etc.)
   * @returns {Promise} - API response with occupancy data
   */
  async getOccupancyReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/occupancy', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get booking report
   * @param {Object} params - Query parameters (dateRange, parkingLotId, status, etc.)
   * @returns {Promise} - API response with booking data
   */
  async getBookingReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/bookings', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user report
   * @param {Object} params - Query parameters (dateRange, role, status, etc.)
   * @returns {Promise} - API response with user data
   */
  async getUserReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/users', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle report
   * @param {Object} params - Query parameters (dateRange, vehicleType, etc.)
   * @returns {Promise} - API response with vehicle data
   */
  async getVehicleReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/vehicles', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get charging report
   * @param {Object} params - Query parameters (dateRange, stationId, etc.)
   * @returns {Promise} - API response with charging data
   */
  async getChargingReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/charging', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get payment report
   * @param {Object} params - Query parameters (dateRange, method, status, etc.)
   * @returns {Promise} - API response with payment data
   */
  async getPaymentReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/payments', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get parking lot performance report
   * @param {Object} params - Query parameters (dateRange, parkingLotId, etc.)
   * @returns {Promise} - API response with performance data
   */
  async getParkingLotPerformance(params = {}) {
    try {
      const response = await apiClient.get('/reports/parking-lot-performance', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get custom report with user-defined metrics
   * @param {Object} customData - Custom report configuration
   * @returns {Promise} - API response with custom report data
   */
  async getCustomReport(customData) {
    try {
      const response = await apiClient.post('/reports/custom', customData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report preview (sample data)
   * @param {Object} previewData - Preview configuration
   * @returns {Promise} - API response with preview data
   */
  async getReportPreview(previewData) {
    try {
      const response = await apiClient.post('/reports/preview', previewData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export report data to Excel
   * @param {Object} exportData - Export configuration
   * @returns {Promise} - API response with Excel file
   */
  async exportToExcel(exportData) {
    try {
      const response = await apiClient.post('/reports/export/excel', exportData, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export report data to PDF
   * @param {Object} exportData - Export configuration
   * @returns {Promise} - API response with PDF file
   */
  async exportToPDF(exportData) {
    try {
      const response = await apiClient.post('/reports/export/pdf', exportData, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Export report data to CSV
   * @param {Object} exportData - Export configuration
   * @returns {Promise} - API response with CSV file
   */
  async exportToCSV(exportData) {
    try {
      const response = await apiClient.post('/reports/export/csv', exportData, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report templates
   * @param {Object} params - Query parameters (category, type, etc.)
   * @returns {Promise} - API response with report templates
   */
  async getReportTemplates(params = {}) {
    try {
      const response = await apiClient.get('/reports/templates', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create report template
   * @param {Object} templateData - Template data (name, type, configuration, etc.)
   * @returns {Promise} - API response with created template
   */
  async createReportTemplate(templateData) {
    try {
      const response = await apiClient.post('/reports/templates', templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update report template
   * @param {string} templateId - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise} - API response with updated template
   */
  async updateReportTemplate(templateId, templateData) {
    try {
      const response = await apiClient.put(`/reports/templates/${templateId}`, templateData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete report template
   * @param {string} templateId - Template ID
   * @returns {Promise} - API response
   */
  async deleteReportTemplate(templateId) {
    try {
      const response = await apiClient.delete(`/reports/templates/${templateId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report categories
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with report categories
   */
  async getReportCategories(params = {}) {
    try {
      const response = await apiClient.get('/reports/categories', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report metrics
   * @param {Object} params - Query parameters (category, type, etc.)
   * @returns {Promise} - API response with available metrics
   */
  async getReportMetrics(params = {}) {
    try {
      const response = await apiClient.get('/reports/metrics', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report filters
   * @param {string} reportType - Report type
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with available filters
   */
  async getReportFilters(reportType, params = {}) {
    try {
      const response = await apiClient.get(`/reports/${reportType}/filters`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report data for dashboard widgets
   * @param {Object} params - Query parameters (widgetType, dateRange, etc.)
   * @returns {Promise} - API response with widget data
   */
  async getDashboardWidgetData(params = {}) {
    try {
      const response = await apiClient.get('/reports/dashboard/widgets', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report comparison data
   * @param {Object} comparisonData - Comparison configuration (period1, period2, metrics, etc.)
   * @returns {Promise} - API response with comparison data
   */
  async getReportComparison(comparisonData) {
    try {
      const response = await apiClient.post('/reports/compare', comparisonData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report trend analysis
   * @param {Object} params - Query parameters (metric, dateRange, interval, etc.)
   * @returns {Promise} - API response with trend data
   */
  async getTrendAnalysis(params = {}) {
    try {
      const response = await apiClient.get('/reports/trends', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get user-specific reports
   * @param {string} userId - User ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with user reports
   */
  async getUserReports(userId, params = {}) {
    try {
      const response = await apiClient.get(`/reports/users/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report summary
   * @param {Object} params - Query parameters (dateRange, type, etc.)
   * @returns {Promise} - API response with report summary
   */
  async getReportSummary(params = {}) {
    try {
      const response = await apiClient.get('/reports/summary', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Archive a report
   * @param {string} reportId - Report ID
   * @returns {Promise} - API response
   */
  async archiveReport(reportId) {
    try {
      const response = await apiClient.post(`/reports/${reportId}/archive`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Unarchive a report
   * @param {string} reportId - Report ID
   * @returns {Promise} - API response
   */
  async unarchiveReport(reportId) {
    try {
      const response = await apiClient.post(`/reports/${reportId}/unarchive`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get archived reports
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with archived reports
   */
  async getArchivedReports(params = {}) {
    try {
      const response = await apiClient.get('/reports/archived', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get report audit log
   * @param {Object} params - Query parameters (dateRange, action, user, etc.)
   * @returns {Promise} - API response with audit log
   */
  async getReportAuditLog(params = {}) {
    try {
      const response = await apiClient.get('/reports/audit-log', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get forecast report
   * @param {Object} params - Query parameters (metric, dateRange, predictionModel, etc.)
   * @returns {Promise} - API response with forecast data
   */
  async getForecastReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/forecast', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get anomaly detection report
   * @param {Object} params - Query parameters (metric, dateRange, threshold, etc.)
   * @returns {Promise} - API response with anomaly data
   */
  async getAnomalyReport(params = {}) {
    try {
      const response = await apiClient.get('/reports/anomalies', { params });
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
          message: 'You do not have permission to access reports.',
          status,
          data: null,
        };
      case 404:
        return {
          code: 'NOT_FOUND',
          message: data?.message || 'Report not found.',
          status,
          data: null,
        };
      case 409:
        return {
          code: 'CONFLICT',
          message: data?.message || 'Report conflict. Please try again.',
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
          message: 'Report service temporarily unavailable. Please try again later.',
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
export default new ReportService();
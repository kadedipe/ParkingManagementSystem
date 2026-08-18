// ============================================================================
// Vehicle Service - API Service for Vehicle Management
// ============================================================================

import apiClient from '../client';

/**
 * Vehicle Service - Handles all vehicle-related API operations
 */
class VehicleService {
  /**
   * Get all vehicles for the current user
   * @param {Object} params - Query parameters (page, limit, search, etc.)
   * @returns {Promise} - API response with vehicles list
   */
  async getVehicles(params = {}) {
    try {
      const response = await apiClient.get('/vehicles', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get a specific vehicle by ID
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response with vehicle details
   */
  async getVehicleById(vehicleId) {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Create a new vehicle
   * @param {Object} vehicleData - Vehicle data to create
   * @returns {Promise} - API response with created vehicle
   */
  async createVehicle(vehicleData) {
    try {
      const response = await apiClient.post('/vehicles', vehicleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Update an existing vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} vehicleData - Updated vehicle data
   * @returns {Promise} - API response with updated vehicle
   */
  async updateVehicle(vehicleId, vehicleData) {
    try {
      const response = await apiClient.put(`/vehicles/${vehicleId}`, vehicleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Partially update a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} vehicleData - Partial vehicle data
   * @returns {Promise} - API response with updated vehicle
   */
  async patchVehicle(vehicleId, vehicleData) {
    try {
      const response = await apiClient.patch(`/vehicles/${vehicleId}`, vehicleData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response
   */
  async deleteVehicle(vehicleId) {
    try {
      const response = await apiClient.delete(`/vehicles/${vehicleId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle by license plate
   * @param {string} licensePlate - License plate number
   * @returns {Promise} - API response with vehicle details
   */
  async getVehicleByLicensePlate(licensePlate) {
    try {
      const response = await apiClient.get(`/vehicles/license/${licensePlate}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle types
   * @returns {Promise} - API response with vehicle types
   */
  async getVehicleTypes() {
    try {
      const response = await apiClient.get('/vehicles/types');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Search vehicles by various criteria
   * @param {Object} searchParams - Search parameters
   * @returns {Promise} - API response with matching vehicles
   */
  async searchVehicles(searchParams) {
    try {
      const response = await apiClient.get('/vehicles/search', { 
        params: searchParams 
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle statistics
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response with vehicle statistics
   */
  async getVehicleStats(vehicleId) {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/stats`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Assign vehicle to a parking spot
   * @param {string} vehicleId - Vehicle ID
   * @param {string} parkingSpotId - Parking spot ID
   * @returns {Promise} - API response
   */
  async assignVehicleToParking(vehicleId, parkingSpotId) {
    try {
      const response = await apiClient.post(`/vehicles/${vehicleId}/assign`, {
        parkingSpotId
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Remove vehicle from parking spot
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response
   */
  async removeVehicleFromParking(vehicleId) {
    try {
      const response = await apiClient.post(`/vehicles/${vehicleId}/remove`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get parking history for a vehicle
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with parking history
   */
  async getVehicleParkingHistory(vehicleId, params = {}) {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/parking-history`, {
        params
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload vehicle image
   * @param {string} vehicleId - Vehicle ID
   * @param {FormData} formData - Form data with image
   * @returns {Promise} - API response
   */
  async uploadVehicleImage(vehicleId, formData) {
    try {
      const response = await apiClient.post(
        `/vehicles/${vehicleId}/image`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Delete vehicle image
   * @param {string} vehicleId - Vehicle ID
   * @param {string} imageId - Image ID
   * @returns {Promise} - API response
   */
  async deleteVehicleImage(vehicleId, imageId) {
    try {
      const response = await apiClient.delete(`/vehicles/${vehicleId}/image/${imageId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle maintenance records
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with maintenance records
   */
  async getVehicleMaintenance(vehicleId, params = {}) {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/maintenance`, {
        params
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Add maintenance record
   * @param {string} vehicleId - Vehicle ID
   * @param {Object} maintenanceData - Maintenance record data
   * @returns {Promise} - API response
   */
  async addMaintenanceRecord(vehicleId, maintenanceData) {
    try {
      const response = await apiClient.post(
        `/vehicles/${vehicleId}/maintenance`,
        maintenanceData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Get vehicle documents
   * @param {string} vehicleId - Vehicle ID
   * @returns {Promise} - API response with vehicle documents
   */
  async getVehicleDocuments(vehicleId) {
    try {
      const response = await apiClient.get(`/vehicles/${vehicleId}/documents`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  /**
   * Upload vehicle document
   * @param {string} vehicleId - Vehicle ID
   * @param {FormData} formData - Form data with document
   * @returns {Promise} - API response
   */
  async uploadVehicleDocument(vehicleId, formData) {
    try {
      const response = await apiClient.post(
        `/vehicles/${vehicleId}/documents`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
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
          message: data?.message || 'Vehicle not found.',
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
      case 500:
      case 502:
      case 503:
        return {
          code: 'SERVER_ERROR',
          message: 'Server error. Please try again later.',
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
export default new VehicleService();
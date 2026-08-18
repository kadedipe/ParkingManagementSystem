// ============================================================================
// Parking Service Tests - Parking Service Unit Tests
// ============================================================================

import parkingService from '../../services/parking.service';
import apiClient from '../../client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('../../client');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-native-community/netinfo');

describe('Parking Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getParkingLots', () => {
    const mockParams = {
      page: 1,
      limit: 10,
      status: 'active',
      search: 'downtown'
    };

    const mockResponse = {
      data: {
        lots: [
          {
            id: 'lot1',
            name: 'Downtown Parking',
            address: '123 Main St',
            totalSpots: 100,
            availableSpots: 45,
            pricePerHour: 5.00,
            latitude: 40.7128,
            longitude: -74.0060,
            status: 'active',
            amenities: ['security', 'lighting', 'ev_charging']
          },
          {
            id: 'lot2',
            name: 'City Center Garage',
            address: '456 Broadway',
            totalSpots: 200,
            availableSpots: 120,
            pricePerHour: 7.50,
            latitude: 40.7142,
            longitude: -74.0080,
            status: 'active',
            amenities: ['security', 'covered']
          }
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3
        }
      }
    };

    test('should successfully get parking lots', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingLots(mockParams);

      expect(apiClient.get).toHaveBeenCalledWith('/parking/lots', {
        params: mockParams
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle network error when getting parking lots', async () => {
      const networkError = {};
      apiClient.get.mockRejectedValueOnce(networkError);

      await expect(parkingService.getParkingLots(mockParams)).rejects.toEqual({
        code: 'NETWORK_ERROR',
        message: 'Network error. Please check your connection.',
        status: 0,
        data: null
      });
    });

    test('should handle server error when getting parking lots', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            message: 'Server error fetching parking lots'
          }
        }
      };

      apiClient.get.mockRejectedValueOnce(errorResponse);

      await expect(parkingService.getParkingLots(mockParams)).rejects.toEqual({
        code: 'SERVER_ERROR',
        message: 'Server error fetching parking lots',
        status: 500,
        data: null
      });
    });
  });

  describe('getParkingLotById', () => {
    const lotId = 'lot1';
    const mockResponse = {
      data: {
        id: 'lot1',
        name: 'Downtown Parking',
        address: '123 Main St',
        totalSpots: 100,
        availableSpots: 45,
        pricePerHour: 5.00,
        pricePerDay: 40.00,
        latitude: 40.7128,
        longitude: -74.0060,
        status: 'active',
        amenities: ['security', 'lighting', 'ev_charging'],
        operatingHours: {
          monday: { open: '06:00', close: '22:00' },
          tuesday: { open: '06:00', close: '22:00' },
          wednesday: { open: '06:00', close: '22:00' },
          thursday: { open: '06:00', close: '22:00' },
          friday: { open: '06:00', close: '22:00' },
          saturday: { open: '08:00', close: '20:00' },
          sunday: { open: '10:00', close: '18:00' }
        },
        reviews: [
          {
            id: 'rev1',
            rating: 4.5,
            comment: 'Great location',
            userId: 'user123',
            createdAt: '2024-01-01T00:00:00Z'
          }
        ],
        rating: 4.5
      }
    };

    test('should successfully get parking lot by ID', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingLotById(lotId);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle not found error when getting parking lot', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Parking lot not found'
          }
        }
      };

      apiClient.get.mockRejectedValueOnce(errorResponse);

      await expect(parkingService.getParkingLotById(lotId)).rejects.toEqual({
        code: 'NOT_FOUND',
        message: 'Parking lot not found',
        status: 404,
        data: null
      });
    });
  });

  describe('getNearbyParkingLots', () => {
    const locationParams = {
      latitude: 40.7128,
      longitude: -74.0060,
      radius: 5000,
      limit: 10
    };

    const mockResponse = {
      data: {
        lots: [
          {
            id: 'lot1',
            name: 'Downtown Parking',
            address: '123 Main St',
            distance: 250,
            totalSpots: 100,
            availableSpots: 45,
            pricePerHour: 5.00
          },
          {
            id: 'lot2',
            name: 'City Center Garage',
            address: '456 Broadway',
            distance: 800,
            totalSpots: 200,
            availableSpots: 120,
            pricePerHour: 7.50
          }
        ],
        total: 2
      }
    };

    test('should successfully get nearby parking lots', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getNearbyParkingLots(locationParams);

      expect(apiClient.get).toHaveBeenCalledWith('/parking/lots/nearby', {
        params: locationParams
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle invalid coordinates', async () => {
      const errorResponse = {
        response: {
          status: 400,
          data: {
            message: 'Invalid coordinates'
          }
        }
      };

      apiClient.get.mockRejectedValueOnce(errorResponse);

      await expect(
        parkingService.getNearbyParkingLots({ latitude: 200, longitude: -200 })
      ).rejects.toEqual({
        code: 'BAD_REQUEST',
        message: 'Invalid coordinates',
        status: 400,
        data: null
      });
    });
  });

  describe('getParkingSpots', () => {
    const lotId = 'lot1';
    const mockParams = {
      status: 'available',
      type: 'standard'
    };

    const mockResponse = {
      data: {
        spots: [
          {
            id: 'spot1',
            number: 'A1',
            type: 'standard',
            status: 'available',
            level: 1,
            isCovered: true
          },
          {
            id: 'spot2',
            number: 'A2',
            type: 'ev_charging',
            status: 'occupied',
            level: 1,
            isCovered: true
          }
        ],
        total: 2
      }
    };

    test('should successfully get parking spots', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingSpots(lotId, mockParams);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}/spots`, {
        params: mockParams
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getParkingSpotById', () => {
    const spotId = 'spot1';
    const mockResponse = {
      data: {
        id: 'spot1',
        number: 'A1',
        type: 'standard',
        status: 'available',
        level: 1,
        isCovered: true,
        dimensions: {
          width: 2.5,
          height: 5.0
        },
        pricePerHour: 5.00,
        parkingLot: {
          id: 'lot1',
          name: 'Downtown Parking'
        }
      }
    };

    test('should successfully get parking spot by ID', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingSpotById(spotId);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/spots/${spotId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('createParkingLot (admin)', () => {
    const lotData = {
      name: 'New Parking Lot',
      address: '789 Park Ave',
      totalSpots: 150,
      pricePerHour: 6.00,
      latitude: 40.7150,
      longitude: -74.0100,
      amenities: ['security', 'lighting']
    };

    const mockResponse = {
      data: {
        id: 'lot3',
        ...lotData,
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z'
      }
    };

    test('should successfully create parking lot (admin)', async () => {
      apiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.createParkingLot(lotData);

      expect(apiClient.post).toHaveBeenCalledWith('/parking/lots', lotData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle unauthorized creation attempt', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'Admin access required'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(parkingService.createParkingLot(lotData)).rejects.toEqual({
        code: 'FORBIDDEN',
        message: 'Admin access required',
        status: 403,
        data: null
      });
    });
  });

  describe('updateParkingLot (admin)', () => {
    const lotId = 'lot1';
    const lotData = {
      name: 'Updated Parking Lot',
      pricePerHour: 6.50
    };

    const mockResponse = {
      data: {
        id: 'lot1',
        name: 'Updated Parking Lot',
        address: '123 Main St',
        totalSpots: 100,
        availableSpots: 45,
        pricePerHour: 6.50,
        status: 'active'
      }
    };

    test('should successfully update parking lot', async () => {
      apiClient.put.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.updateParkingLot(lotId, lotData);

      expect(apiClient.put).toHaveBeenCalledWith(`/parking/lots/${lotId}`, lotData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle partial update', async () => {
      const patchData = { pricePerHour: 7.00 };
      const patchResponse = {
        data: {
          id: 'lot1',
          name: 'Downtown Parking',
          pricePerHour: 7.00
        }
      };

      apiClient.patch.mockResolvedValueOnce(patchResponse);

      const result = await parkingService.patchParkingLot(lotId, patchData);

      expect(apiClient.patch).toHaveBeenCalledWith(`/parking/lots/${lotId}`, patchData);
      expect(result).toEqual(patchResponse.data);
    });
  });

  describe('deleteParkingLot (admin)', () => {
    const lotId = 'lot1';

    test('should successfully delete parking lot', async () => {
      const mockResponse = {
        data: {
          message: 'Parking lot deleted successfully'
        }
      };

      apiClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.deleteParkingLot(lotId);

      expect(apiClient.delete).toHaveBeenCalledWith(`/parking/lots/${lotId}`);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle deletion of non-existent lot', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Parking lot not found'
          }
        }
      };

      apiClient.delete.mockRejectedValueOnce(errorResponse);

      await expect(parkingService.deleteParkingLot('nonexistent')).rejects.toEqual({
        code: 'NOT_FOUND',
        message: 'Parking lot not found',
        status: 404,
        data: null
      });
    });
  });

  describe('updateParkingSpotStatus', () => {
    const spotId = 'spot1';
    const statusData = {
      status: 'occupied',
      vehicleId: 'vehicle123'
    };

    test('should successfully update parking spot status', async () => {
      const mockResponse = {
        data: {
          id: 'spot1',
          status: 'occupied',
          vehicleId: 'vehicle123',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      };

      apiClient.patch.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.updateParkingSpotStatus(spotId, statusData);

      expect(apiClient.patch).toHaveBeenCalledWith(`/parking/spots/${spotId}/status`, statusData);
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle spot not found', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            message: 'Parking spot not found'
          }
        }
      };

      apiClient.patch.mockRejectedValueOnce(errorResponse);

      await expect(
        parkingService.updateParkingSpotStatus('invalid', statusData)
      ).rejects.toEqual({
        code: 'NOT_FOUND',
        message: 'Parking spot not found',
        status: 404,
        data: null
      });
    });
  });

  describe('getAvailableSpots', () => {
    const lotId = 'lot1';
    const mockParams = {
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '14:00'
    };

    const mockResponse = {
      data: {
        spots: [
          {
            id: 'spot1',
            number: 'A1',
            type: 'standard',
            level: 1
          },
          {
            id: 'spot3',
            number: 'B2',
            type: 'ev_charging',
            level: 1
          }
        ],
        total: 2
      }
    };

    test('should successfully get available spots', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getAvailableSpots(lotId, mockParams);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}/available`, {
        params: mockParams
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle no available spots', async () => {
      const emptyResponse = {
        data: {
          spots: [],
          total: 0
        }
      };

      apiClient.get.mockResolvedValueOnce(emptyResponse);

      const result = await parkingService.getAvailableSpots(lotId, mockParams);

      expect(result.spots).toEqual([]);
      expect(result.total).toBe(0);
    });
  });

  describe('getParkingLotStatistics', () => {
    const lotId = 'lot1';
    const mockParams = {
      dateRange: 'weekly'
    };

    const mockResponse = {
      data: {
        occupancy: {
          current: 45,
          capacity: 100,
          percentage: 45
        },
        dailyStats: [
          { date: '2024-01-01', occupancy: 65, revenue: 325.00 },
          { date: '2024-01-02', occupancy: 70, revenue: 350.00 }
        ],
        peakHours: ['10:00', '17:00'],
        averageDuration: 3.5,
        totalRevenue: 1500.00,
        popularSpots: ['A1', 'B2', 'C3']
      }
    };

    test('should successfully get parking lot statistics', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingLotStatistics(lotId, mockParams);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}/statistics`, {
        params: mockParams
      });
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle unauthorized access to statistics', async () => {
      const errorResponse = {
        response: {
          status: 403,
          data: {
            message: 'Access denied to view statistics'
          }
        }
      };

      apiClient.get.mockRejectedValueOnce(errorResponse);

      await expect(
        parkingService.getParkingLotStatistics(lotId, mockParams)
      ).rejects.toEqual({
        code: 'FORBIDDEN',
        message: 'Access denied to view statistics',
        status: 403,
        data: null
      });
    });
  });

  describe('addParkingAmenity (admin)', () => {
    const lotId = 'lot1';
    const amenityData = {
      name: 'valet_parking',
      description: 'Valet parking service'
    };

    const mockResponse = {
      data: {
        id: 'amen1',
        ...amenityData,
        lotId: 'lot1'
      }
    };

    test('should successfully add parking amenity', async () => {
      apiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.addParkingAmenity(lotId, amenityData);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/parking/lots/${lotId}/amenities`,
        amenityData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle duplicate amenity', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: {
            message: 'Amenity already exists for this parking lot'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(
        parkingService.addParkingAmenity(lotId, amenityData)
      ).rejects.toEqual({
        code: 'CONFLICT',
        message: 'Amenity already exists for this parking lot',
        status: 409,
        data: null
      });
    });
  });

  describe('removeParkingAmenity (admin)', () => {
    const amenityId = 'amen1';

    test('should successfully remove parking amenity', async () => {
      const mockResponse = {
        data: {
          message: 'Amenity removed successfully'
        }
      };

      apiClient.delete.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.removeParkingAmenity(amenityId);

      expect(apiClient.delete).toHaveBeenCalledWith(`/parking/amenities/${amenityId}`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getParkingLotReviews', () => {
    const lotId = 'lot1';
    const mockParams = {
      page: 1,
      limit: 10,
      sort: 'newest'
    };

    const mockResponse = {
      data: {
        reviews: [
          {
            id: 'rev1',
            rating: 5,
            comment: 'Great parking lot, very convenient!',
            user: {
              id: 'user123',
              name: 'John Doe'
            },
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'rev2',
            rating: 4,
            comment: 'Good location but a bit expensive',
            user: {
              id: 'user456',
              name: 'Jane Smith'
            },
            createdAt: '2024-01-02T00:00:00Z'
          }
        ],
        averageRating: 4.5,
        totalReviews: 2,
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1
        }
      }
    };

    test('should successfully get parking lot reviews', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingLotReviews(lotId, mockParams);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}/reviews`, {
        params: mockParams
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('addParkingLotReview', () => {
    const lotId = 'lot1';
    const reviewData = {
      rating: 4.5,
      comment: 'Good parking experience'
    };

    const mockResponse = {
      data: {
        id: 'rev3',
        ...reviewData,
        userId: 'user123',
        lotId: 'lot1',
        createdAt: '2024-01-03T00:00:00Z'
      }
    };

    test('should successfully add review to parking lot', async () => {
      apiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.addParkingLotReview(lotId, reviewData);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/parking/lots/${lotId}/reviews`,
        reviewData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle validation errors in review', async () => {
      const errorResponse = {
        response: {
          status: 422,
          data: {
            message: 'Validation error',
            errors: {
              rating: ['Rating must be between 1 and 5']
            }
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(
        parkingService.addParkingLotReview(lotId, { rating: 10, comment: 'Too high' })
      ).rejects.toEqual({
        code: 'VALIDATION_ERROR',
        message: 'Validation error',
        status: 422,
        data: {
          rating: ['Rating must be between 1 and 5']
        }
      });
    });
  });

  describe('getParkingCapacity', () => {
    const lotId = 'lot1';

    const mockResponse = {
      data: {
        total: 100,
        available: 45,
        occupied: 55,
        reserved: 0,
        percentage: 55
      }
    };

    test('should successfully get parking capacity', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingCapacity(lotId);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}/capacity`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getParkingPricing', () => {
    const lotId = 'lot1';
    const mockParams = {
      duration: 3,
      vehicleType: 'standard'
    };

    const mockResponse = {
      data: {
        basePrice: 5.00,
        totalPrice: 15.00,
        duration: 3,
        pricingTiers: [
          { hours: 1, price: 5.00 },
          { hours: 2, price: 10.00 },
          { hours: 3, price: 15.00 }
        ],
        discounts: []
      }
    };

    test('should successfully get parking pricing', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingPricing(lotId, mockParams);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}/pricing`, {
        params: mockParams
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('assignParkingSpot', () => {
    const spotId = 'spot1';
    const assignmentData = {
      vehicleId: 'vehicle123',
      startTime: '2024-01-15T10:00:00Z',
      endTime: '2024-01-15T14:00:00Z'
    };

    const mockResponse = {
      data: {
        id: 'assignment1',
        spotId: 'spot1',
        vehicleId: 'vehicle123',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T14:00:00Z',
        status: 'active'
      }
    };

    test('should successfully assign parking spot', async () => {
      apiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.assignParkingSpot(spotId, assignmentData);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/parking/spots/${spotId}/assign`,
        assignmentData
      );
      expect(result).toEqual(mockResponse.data);
    });

    test('should handle spot already assigned', async () => {
      const errorResponse = {
        response: {
          status: 409,
          data: {
            message: 'Parking spot is already assigned'
          }
        }
      };

      apiClient.post.mockRejectedValueOnce(errorResponse);

      await expect(
        parkingService.assignParkingSpot(spotId, assignmentData)
      ).rejects.toEqual({
        code: 'CONFLICT',
        message: 'Parking spot is already assigned',
        status: 409,
        data: null
      });
    });
  });

  describe('releaseParkingSpot', () => {
    const spotId = 'spot1';
    const releaseData = {
      reason: 'Completed parking'
    };

    const mockResponse = {
      data: {
        id: 'assignment1',
        spotId: 'spot1',
        status: 'completed',
        releasedAt: '2024-01-15T14:00:00Z'
      }
    };

    test('should successfully release parking spot', async () => {
      apiClient.post.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.releaseParkingSpot(spotId, releaseData);

      expect(apiClient.post).toHaveBeenCalledWith(
        `/parking/spots/${spotId}/release`,
        releaseData
      );
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('searchParkingLots', () => {
    const searchParams = {
      query: 'downtown parking',
      radius: 5000,
      amenities: ['security', 'ev_charging'],
      minRating: 4.0,
      maxPrice: 10.00
    };

    const mockResponse = {
      data: {
        lots: [
          {
            id: 'lot1',
            name: 'Downtown Parking',
            address: '123 Main St',
            distance: 250,
            rating: 4.5,
            pricePerHour: 5.00,
            availableSpots: 45,
            amenities: ['security', 'ev_charging']
          }
        ],
        total: 1
      }
    };

    test('should successfully search parking lots', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.searchParkingLots(searchParams);

      expect(apiClient.get).toHaveBeenCalledWith('/parking/search', {
        params: searchParams
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getParkingLotMap', () => {
    const lotId = 'lot1';

    const mockResponse = {
      data: {
        mapUrl: 'https://maps.example.com/lot1.png',
        spots: [
          {
            id: 'spot1',
            number: 'A1',
            position: { x: 10, y: 20 },
            status: 'available'
          },
          {
            id: 'spot2',
            number: 'A2',
            position: { x: 30, y: 20 },
            status: 'occupied'
          }
        ]
      }
    };

    test('should successfully get parking lot map', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingLotMap(lotId);

      expect(apiClient.get).toHaveBeenCalledWith(`/parking/lots/${lotId}/map`);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getParkingLotOccupancyHistory', () => {
    const lotId = 'lot1';
    const mockParams = {
      dateRange: 'monthly',
      fromDate: '2024-01-01',
      toDate: '2024-01-31'
    };

    const mockResponse = {
      data: {
        history: [
          { date: '2024-01-01', occupancy: 65 },
          { date: '2024-01-02', occupancy: 70 },
          { date: '2024-01-03', occupancy: 55 }
        ],
        average: 63.3,
        peak: 85,
        low: 45
      }
    };

    test('should successfully get parking lot occupancy history', async () => {
      apiClient.get.mockResolvedValueOnce(mockResponse);

      const result = await parkingService.getParkingLotOccupancyHistory(lotId, mockParams);

      expect(apiClient.get).toHaveBeenCalledWith(
        `/parking/lots/${lotId}/occupancy-history`,
        { params: mockParams }
      );
      expect(result).toEqual(mockResponse.data);
    });
  });
});
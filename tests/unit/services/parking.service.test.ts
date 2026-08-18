// ============================================================================
// Parking Service Tests - Parking Service Unit Tests
// ============================================================================

// parking-management-system/tests/unit/services/parking.service.test.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParkingService } from '../../../src/services/parking.service';
import { ParkingLot } from '../../../src/models/parking-lot.model';
import { generateMockParkingLot, generateMockRepository } from '../utils/test-utils';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ParkingService', () => {
  let parkingService: ParkingService;
  let parkingLotRepository: Repository<ParkingLot>;

  const mockParkingLot = generateMockParkingLot();
  const mockRepository = generateMockRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParkingService,
        {
          provide: getRepositoryToken(ParkingLot),
          useValue: mockRepository
        }
      ],
    }).compile();

    parkingService = module.get<ParkingService>(ParkingService);
    parkingLotRepository = module.get<Repository<ParkingLot>>(getRepositoryToken(ParkingLot));
  });

  describe('getAllParkingLots', () => {
    it('should return paginated parking lots', async () => {
      const mockLots = [generateMockParkingLot(), generateMockParkingLot()];
      mockRepository.findAndCount.mockResolvedValue([mockLots, mockLots.length]);
      
      const result = await parkingService.getAllParkingLots(1, 10);
      
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('getParkingLotById', () => {
    it('should return parking lot when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockParkingLot);
      
      const result = await parkingService.getParkingLotById(mockParkingLot.id);
      
      expect(result).toEqual(mockParkingLot);
    });

    it('should throw NotFoundException when parking lot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        parkingService.getParkingLotById('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('createParkingLot', () => {
    const createData = {
      name: 'New Parking Lot',
      address: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        country: 'USA',
        postalCode: '10001'
      },
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      totalSpots: 100,
      basePricePerHour: { amount: 5.00, currency: 'USD' }
    };

    it('should create a new parking lot', async () => {
      mockRepository.create.mockReturnValue({ ...createData, id: 'new-lot-id' });
      mockRepository.save.mockResolvedValue({ ...createData, id: 'new-lot-id' });
      
      const result = await parkingService.createParkingLot(createData);
      
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(createData.name);
      expect(result.totalSpots).toBe(createData.totalSpots);
    });
  });

  describe('updateParkingLot', () => {
    const updateData = {
      name: 'Updated Parking Lot'
    };

    it('should update parking lot when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockParkingLot);
      mockRepository.save.mockResolvedValue({ ...mockParkingLot, ...updateData });
      
      const result = await parkingService.updateParkingLot(mockParkingLot.id, updateData);
      
      expect(result.name).toBe(updateData.name);
    });

    it('should throw NotFoundException when parking lot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        parkingService.updateParkingLot('non-existent-id', updateData)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteParkingLot', () => {
    it('should delete parking lot when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockParkingLot);
      mockRepository.softDelete.mockResolvedValue({ affected: 1 });
      
      const result = await parkingService.deleteParkingLot(mockParkingLot.id);
      
      expect(result).toBe(true);
    });

    it('should throw NotFoundException when parking lot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        parkingService.deleteParkingLot('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkAvailability', () => {
    it('should return availability status for parking lot', async () => {
      mockRepository.findOne.mockResolvedValue(mockParkingLot);
      
      const result = await parkingService.checkAvailability(mockParkingLot.id);
      
      expect(result).toHaveProperty('parkingLotId');
      expect(result).toHaveProperty('totalSpots');
      expect(result).toHaveProperty('availableSpots');
      expect(result).toHaveProperty('isFull');
    });

    it('should throw NotFoundException when parking lot not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        parkingService.checkAvailability('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getNearbyParkingLots', () => {
    it('should return nearby parking lots', async () => {
      const mockLots = [generateMockParkingLot(), generateMockParkingLot()];
      mockRepository.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockLots)
      });
      
      const result = await parkingService.getNearbyParkingLots(40.7128, -74.0060, 5);
      
      expect(result).toHaveLength(2);
    });
  });
});
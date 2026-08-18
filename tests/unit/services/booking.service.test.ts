// ============================================================================
// Booking Service Tests - Booking Service Unit Tests
// ============================================================================

// parking-management-system/tests/unit/services/booking.service.test.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingService } from '../../../src/services/booking.service';
import { Booking } from '../../../src/models/booking.model';
import { ParkingService } from '../../../src/services/parking.service';
import { PaymentService } from '../../../src/services/payment.service';
import { NotificationService } from '../../../src/services/notification.service';
import { generateMockBooking, generateMockRepository } from '../utils/test-utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('BookingService', () => {
  let bookingService: BookingService;
  let bookingRepository: Repository<Booking>;

  const mockBooking = generateMockBooking();
  const mockRepository = generateMockRepository();

  const mockParkingService = {
    checkAvailability: jest.fn(),
    reserveSpot: jest.fn(),
    releaseSpot: jest.fn()
  };

  const mockPaymentService = {
    processPayment: jest.fn(),
    refundPayment: jest.fn()
  };

  const mockNotificationService = {
    sendNotification: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockRepository
        },
        {
          provide: ParkingService,
          useValue: mockParkingService
        },
        {
          provide: PaymentService,
          useValue: mockPaymentService
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService
        }
      ],
    }).compile();

    bookingService = module.get<BookingService>(BookingService);
    bookingRepository = module.get<Repository<Booking>>(getRepositoryToken(Booking));
  });

  describe('createBooking', () => {
    const createData = {
      parkingLotId: 'parking-lot-id',
      spotId: 'spot-id',
      userId: 'user-id',
      vehicleId: 'vehicle-id',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 3600000).toISOString()
    };

    it('should create a new booking when all validations pass', async () => {
      mockParkingService.checkAvailability.mockResolvedValue({ available: true });
      mockParkingService.reserveSpot.mockResolvedValue(true);
      mockPaymentService.processPayment.mockResolvedValue({ success: true });
      mockRepository.create.mockReturnValue({ ...createData, id: 'new-booking-id' });
      mockRepository.save.mockResolvedValue({ ...createData, id: 'new-booking-id' });
      
      const result = await bookingService.createBooking(createData);
      
      expect(result).toHaveProperty('id');
      expect(result.parkingLotId).toBe(createData.parkingLotId);
      expect(result.status).toBe('confirmed');
    });

    it('should throw BadRequestException when spot is not available', async () => {
      mockParkingService.checkAvailability.mockResolvedValue({ available: false });
      
      await expect(bookingService.createBooking(createData)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('getBookingById', () => {
    it('should return booking when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);
      
      const result = await bookingService.getBookingById(mockBooking.id);
      
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        bookingService.getBookingById('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking when found', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.save.mockResolvedValue({ ...mockBooking, status: 'cancelled' });
      mockParkingService.releaseSpot.mockResolvedValue(true);
      mockPaymentService.refundPayment.mockResolvedValue({ success: true });
      
      const result = await bookingService.cancelBooking(mockBooking.id);
      
      expect(result.status).toBe('cancelled');
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        bookingService.cancelBooking('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('checkIn', () => {
    it('should check in booking when valid', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.save.mockResolvedValue({ ...mockBooking, checkInTime: new Date().toISOString() });
      
      const result = await bookingService.checkIn(mockBooking.id);
      
      expect(result).toHaveProperty('checkInTime');
    });
  });

  describe('checkOut', () => {
    it('should check out booking when valid', async () => {
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.save.mockResolvedValue({ ...mockBooking, checkOutTime: new Date().toISOString() });
      
      const result = await bookingService.checkOut(mockBooking.id);
      
      expect(result).toHaveProperty('checkOutTime');
    });
  });

  describe('extendBooking', () => {
    it('should extend booking when valid', async () => {
      const additionalHours = 2;
      mockRepository.findOne.mockResolvedValue(mockBooking);
      mockRepository.save.mockResolvedValue({
        ...mockBooking,
        endTime: new Date(Date.now() + additionalHours * 3600000).toISOString(),
        isExtended: true,
        extensionCount: 1
      });
      
      const result = await bookingService.extendBooking(mockBooking.id, additionalHours);
      
      expect(result.isExtended).toBe(true);
      expect(result.extensionCount).toBe(1);
    });
  });
});
// ============================================================================
// Payment Service Tests - Payment Service Unit Tests
// ============================================================================

// parking-management-system/tests/unit/services/payment.service.test.ts

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentService } from '../../../src/services/payment.service';
import { Payment } from '../../../src/models/payment.model';
import { generateMockPayment, generateMockRepository } from '../utils/test-utils';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let paymentRepository: Repository<Payment>;

  const mockPayment = generateMockPayment();
  const mockRepository = generateMockRepository();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentService,
        {
          provide: getRepositoryToken(Payment),
          useValue: mockRepository
        }
      ],
    }).compile();

    paymentService = module.get<PaymentService>(PaymentService);
    paymentRepository = module.get<Repository<Payment>>(getRepositoryToken(Payment));
  });

  describe('processPayment', () => {
    const paymentData = {
      userId: 'user-id',
      bookingId: 'booking-id',
      amount: { amount: 25.00, currency: 'USD' },
      paymentMethodId: 'payment-method-id'
    };

    it('should process payment successfully', async () => {
      mockRepository.create.mockReturnValue({ ...paymentData, id: 'new-payment-id' });
      mockRepository.save.mockResolvedValue({ ...paymentData, id: 'new-payment-id', status: 'completed' });
      
      const result = await paymentService.processPayment(paymentData);
      
      expect(result).toHaveProperty('id');
      expect(result.status).toBe('completed');
    });

    it('should throw BadRequestException when payment fails', async () => {
      mockRepository.create.mockReturnValue({ ...paymentData, id: 'new-payment-id' });
      mockRepository.save.mockRejectedValue(new Error('Payment failed'));
      
      await expect(paymentService.processPayment(paymentData)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('refundPayment', () => {
    it('should refund payment successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockPayment);
      mockRepository.save.mockResolvedValue({ ...mockPayment, status: 'refunded' });
      
      const result = await paymentService.refundPayment(mockPayment.id);
      
      expect(result.status).toBe('refunded');
    });

    it('should throw NotFoundException when payment not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      
      await expect(
        paymentService.refundPayment('non-existent-id')
      ).rejects.toThrow(NotFoundException);
    });
  });
});
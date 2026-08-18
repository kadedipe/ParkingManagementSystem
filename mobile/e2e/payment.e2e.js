// ============================================================================
// Payment E2E Tests - Payment Flow End-to-End Tests
// ============================================================================

// parking-management-system/mobile/e2e/payment.e2e.js

import { device, element, by } from 'detox';
import { 
  waitForElement, 
  tapElement, 
  typeText, 
  loginUser,
  createBooking,
} from './utils';

describe('Payment Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    await loginUser('test@example.com', 'Test@123456');
    await createBooking('1', 'A1');
  });

  describe('Payment Methods', () => {
    test('should navigate to payment methods', async () => {
      await tapElement('profileTab');
      await tapElement('paymentMethodsButton');
      await waitForElement('paymentMethodsScreen');
    });

    test('should add new payment method', async () => {
      await tapElement('addPaymentMethodButton');
      await waitForElement('addPaymentForm');
      await typeText('cardNumberInput', '4111111111111111');
      await typeText('cardExpiryInput', '12/25');
      await typeText('cardCvvInput', '123');
      await typeText('cardNameInput', 'Test User');
      await tapElement('savePaymentMethodButton');
      await waitForElement('paymentMethodAdded');
    });

    test('should set default payment method', async () => {
      await tapElement('paymentMethodCard_1');
      await tapElement('setDefaultButton');
      await waitForElement('defaultMethodSet');
    });

    test('should delete payment method', async () => {
      await tapElement('paymentMethodCard_1');
      await tapElement('deleteButton');
      await tapElement('confirmDeleteButton');
      await waitForElement('paymentMethodDeleted');
    });
  });

  describe('Payment Processing', () => {
    test('should navigate to payment', async () => {
      await tapElement('bookingsTab');
      await tapElement('bookingCard_1');
      await tapElement('payNowButton');
      await waitForElement('paymentScreen');
    });

    test('should display payment details', async () => {
      await waitForElement('paymentAmount');
      await waitForElement('paymentMethod');
    });

    test('should process payment successfully', async () => {
      await tapElement('paymentMethodSelector');
      await tapElement('selectPaymentMethod');
      await tapElement('processPaymentButton');
      await waitForElement('paymentSuccess', 15000);
    });

    test('should show payment receipt', async () => {
      await waitForElement('receiptScreen');
      await waitForElement('receiptAmount');
      await waitForElement('receiptDate');
    });
  });

  describe('Payment History', () => {
    test('should navigate to payment history', async () => {
      await tapElement('profileTab');
      await tapElement('paymentHistoryButton');
      await waitForElement('paymentHistoryScreen');
    });

    test('should display payment records', async () => {
      await waitForElement('paymentItem_1');
      await waitForElement('paymentStatus');
    });

    test('should view payment details', async () => {
      await tapElement('paymentItem_1');
      await waitForElement('paymentDetailsScreen');
    });
  });
});
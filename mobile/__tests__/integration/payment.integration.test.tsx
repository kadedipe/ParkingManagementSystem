// ============================================================================
// Payment Integration Tests - Payment Flow Integration Tests
// ============================================================================

// parking-management-system/mobile/__tests__/integration/payment.integration.test.tsx

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from '../../../src/store';
import { ThemeProvider } from '../../../src/contexts/ThemeContext';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import { PaymentScreen } from '../../../src/screens/Payment';
import paymentService from '../../../src/api/services/payment.service';
import { createMockNavigation, createMockRoute } from '../helpers';

// Mock payment service
jest.mock('../../../src/api/services/payment.service');

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <ThemeProvider>
        <NavigationContainer>
          <AuthProvider>
            {component}
          </AuthProvider>
        </NavigationContainer>
      </ThemeProvider>
    </Provider>
  );
};

describe('Payment Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment Processing Flow', () => {
    test('should process payment successfully', async () => {
      const mockPayment = {
        id: 'pay_123',
        amount: 25.00,
        status: 'completed',
        receiptUrl: 'https://example.com/receipt/123',
      };
      
      (paymentService.processPayment as jest.Mock).mockResolvedValue(mockPayment);

      const navigation = createMockNavigation();
      const route = createMockRoute({
        amount: 25.00,
        bookingId: 'booking_123',
      });

      const { getByText, findByText } = renderWithProviders(
        <PaymentScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Pay $25.00'));

      await waitFor(() => {
        expect(paymentService.processPayment).toHaveBeenCalledWith({
          amount: 25.00,
          bookingId: 'booking_123',
        });
      });

      expect(await findByText('Payment Successful!')).toBeTruthy();
    });

    test('should show error on payment failure', async () => {
      (paymentService.processPayment as jest.Mock).mockRejectedValue({
        message: 'Insufficient funds',
      });

      const navigation = createMockNavigation();
      const route = createMockRoute({
        amount: 25.00,
        bookingId: 'booking_123',
      });

      const { getByText, findByText } = renderWithProviders(
        <PaymentScreen navigation={navigation} route={route} />
      );

      fireEvent.press(getByText('Pay $25.00'));

      const errorMessage = await findByText('Insufficient funds');
      expect(errorMessage).toBeTruthy();
    });
  });
});
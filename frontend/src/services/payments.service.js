import api from './api';

const unwrap = (response) => response?.data ?? response;

export const paymentsService = {
  getPayments: async (params = {}) => unwrap(await api.get('/payments/', { params })),
  getPaymentHistory: async (params = {}) => unwrap(await api.get('/payments/history', { params })),
  getPaymentMethods: async () => unwrap(await api.get('/payments/methods')),
  getPaymentStats: async () => unwrap(await api.get('/payments/stats')),

  createPayment: async ({ reservationId, paymentMethod = 'credit_card', currency = 'USD' }) =>
    unwrap(await api.post('/payments/', {
      reservation_id: reservationId,
      payment_method: paymentMethod,
      currency,
    }, { retry: false })),

  processPayment: async (paymentId, providerPaymentMethodId = null) =>
    unwrap(await api.post(`/payments/${paymentId}/process`, {
      provider_payment_method_id: providerPaymentMethodId,
    }, { retry: false })),

  getPaymentReceipt: async (paymentId) => unwrap(await api.get(`/payments/${paymentId}/receipt`)),

  refundPayment: async (paymentId) =>
    unwrap(await api.post(`/payments/${paymentId}/refund`, {}, { retry: false })),
};

export default paymentsService;

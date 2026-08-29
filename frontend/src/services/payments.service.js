import api from './api';

const unwrap = (response) => response?.data ?? response;

export const paymentsService = {
  getPayments: async (params = {}) => unwrap(await api.get('/payments/', { params })),
  getPaymentHistory: async (params = {}) => unwrap(await api.get('/payments/history', { params })),
  getPaymentMethods: async () => unwrap(await api.get('/payments/methods')),
  getPaymentStats: async () => unwrap(await api.get('/payments/stats')),

  // Payment mutations are non-idempotent. Use the Axios instance directly so
  // the generic API retry wrapper cannot replay a charge/refund on a 5xx.
  createPayment: async ({ reservationId, paymentMethod = 'credit_card', currency = 'USD' }) =>
    unwrap(await api.instance.post('/payments/', {
      reservation_id: reservationId,
      payment_method: paymentMethod,
      currency,
    })),

  processPayment: async (paymentId, providerPaymentMethodId = null) =>
    unwrap(await api.instance.post(`/payments/${paymentId}/process`, {
      provider_payment_method_id: providerPaymentMethodId,
    })),

  getPaymentReceipt: async (paymentId) => unwrap(await api.get(`/payments/${paymentId}/receipt`)),

  refundPayment: async (paymentId) =>
    unwrap(await api.instance.post(`/payments/${paymentId}/refund`, {})),
};

export default paymentsService;

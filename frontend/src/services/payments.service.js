import api from './api';

export const paymentsService = {
  getPayments: async (params = {}) => {
    const response = await api.get('/payments', { params });
    return response.data;
  },
  getPaymentHistory: async (params = {}) => {
    const response = await api.get('/payments/history', { params });
    return response.data;
  },
  getPaymentMethods: async (params = {}) => {
    const response = await api.get('/payments/methods', { params });
    return response.data;
  },
  getPaymentStats: async (params = {}) => {
    const response = await api.get('/payments/stats', { params });
    return response.data;
  },
  processPayment: async (paymentId, data = {}) => {
    const response = await api.post(`/payments/${paymentId}/process`, data);
    return response.data;
  },
  getPaymentReceipt: async (paymentId, params = {}) => {
    const response = await api.get(`/payments/${paymentId}/receipt`, { params });
    return response.data;
  },
};

export default paymentsService;

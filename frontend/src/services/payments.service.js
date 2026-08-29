const emptyPayments = () => [];

export const paymentsService = {
  // Payment persistence is not implemented by a backend service yet. Return a
  // clean empty state instead of generating production 404s from placeholder
  // frontend routes. These methods can be switched back to API calls when the
  // payment service is introduced.
  getPayments: async () => emptyPayments(),
  getPaymentHistory: async () => emptyPayments(),
  getPaymentMethods: async () => emptyPayments(),
  getPaymentStats: async () => ({ total: 0, completed: 0, pending: 0 }),
  processPayment: async () => {
    throw new Error('Payment processing is not available yet.');
  },
  getPaymentReceipt: async () => {
    throw new Error('Payment receipts are not available yet.');
  },
};

export default paymentsService;

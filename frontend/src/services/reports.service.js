import api from './api';

export const reportsService = {
  generate: async ({ startDate, endDate, reportType = 'operations' }) => {
    const response = await api.get('/reports/analytics', {
      params: {
        start_date: startDate,
        end_date: endDate,
        report_type: reportType,
      },
    });
    return response.data;
  },
};

export default reportsService;

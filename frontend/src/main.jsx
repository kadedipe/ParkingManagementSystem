import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeContextProvider } from './contexts/ThemeContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';
import './styles/index.css';
import './styles/globals.css';
import { theme } from './theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: import.meta.env.PROD,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

window.addEventListener('error', (event) => {
  console.error('Uncaught error:', event.error || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});

export function renderApp() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Root element not found');

  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary fallback={<PageLoader />}>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <ThemeContextProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <AuthProvider>
                    <NotificationProvider>
                      <App />
                      <Toaster position="top-right" />
                    </NotificationProvider>
                  </AuthProvider>
                </LocalizationProvider>
              </ThemeProvider>
            </ThemeContextProvider>
            {import.meta.env.DEV && (
              <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
            )}
          </QueryClientProvider>
        </BrowserRouter>
      </ErrorBoundary>
    </React.StrictMode>,
  );
}

renderApp();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('Service Worker registration failed:', error);
    });
  });
}

export { queryClient };

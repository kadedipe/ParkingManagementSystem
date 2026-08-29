import React, { Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
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
import ErrorBoundary from './components/common/ErrorBoundary';
import { PageLoader } from './components/common/PageLoader';
import './styles/index.css';
import './styles/globals.css';
import { theme } from './theme';

const EvidenceParking = lazy(() => import('./pages/ParkingSearchPage'));
const EvidenceCharging = lazy(() => import('./pages/ChargingPage'));

const FacultyEvidenceApp = () => (
  <Suspense fallback={<PageLoader />}>
    <Routes>
      <Route path="/parking" element={<EvidenceParking />} />
      <Route path="/charging" element={<EvidenceCharging />} />
      <Route path="*" element={<Navigate to="/parking" replace />} />
    </Routes>
  </Suspense>
);

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
  const evidenceMode = import.meta.env.VITE_EVIDENCE_MODE === 'true';

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
                    {evidenceMode ? (
                      <FacultyEvidenceApp />
                    ) : (
                      <NotificationProvider>
                        <App />
                        <Toaster position="top-right" />
                      </NotificationProvider>
                    )}
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
  window.addEventListener('load', async () => {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
    } catch (error) {
      console.warn('Legacy service worker cleanup failed:', error);
    }
  });
}

export { queryClient };

// vite.config.ts
import { defineConfig, loadEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';
  
  const config: UserConfig = {
    // ... same configuration as above but typed
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: env.VITE_HOST || '0.0.0.0',
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@api': path.resolve(__dirname, './src/api'),
        '@store': path.resolve(__dirname, './src/store'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@services': path.resolve(__dirname, './src/services'),
        '@validators': path.resolve(__dirname, './src/validators'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@helpers': path.resolve(__dirname, './src/helpers'),
        '@config': path.resolve(__dirname, './src/config'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
      },
    },
    build: {
      outDir: env.VITE_BUILD_OUTPUT_DIR || 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'mui-vendor': ['@mui/material', '@mui/icons-material', '@mui/x-data-grid'],
            'state-vendor': ['@tanstack/react-query', 'zustand'],
            'chart-vendor': ['recharts'],
            'form-vendor': ['formik', 'react-hook-form', 'yup'],
            'utils-vendor': ['axios', 'date-fns'],
          },
        },
      },
    },
    plugins: [
      react(),
      createHtmlPlugin({
        minify: isProduction,
        entry: '/src/main.tsx',
        template: 'index.html',
        inject: {
          data: {
            title: env.VITE_APP_NAME || 'Parking Management System',
            description: env.VITE_APP_DESCRIPTION || 'A comprehensive parking management system',
          },
        },
      }),
      svgr({
        exportAsDefault: true,
        svgrOptions: {
          icon: true,
        },
      }),
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
      },
    },
  };
  
  return config;
});
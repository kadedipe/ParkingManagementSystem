import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const configDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, configDir, '');
  const isProduction = mode === 'production';
  const entry = './src/main.jsx';

  return {
    server: {
      port: Number.parseInt(env.VITE_PORT || '5173', 10),
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
        '@': path.resolve(configDir, './src'),
        '@components': path.resolve(configDir, './src/components'),
        '@pages': path.resolve(configDir, './src/pages'),
        '@hooks': path.resolve(configDir, './src/hooks'),
        '@utils': path.resolve(configDir, './src/utils'),
        '@types': path.resolve(configDir, './src/types'),
        '@api': path.resolve(configDir, './src/api'),
        '@store': path.resolve(configDir, './src/store'),
        '@assets': path.resolve(configDir, './src/assets'),
        '@styles': path.resolve(configDir, './src/styles'),
        '@routes': path.resolve(configDir, './src/routes'),
        '@services': path.resolve(configDir, './src/services'),
        '@validators': path.resolve(configDir, './src/validators'),
        '@constants': path.resolve(configDir, './src/constants'),
        '@helpers': path.resolve(configDir, './src/helpers'),
        '@config': path.resolve(configDir, './src/config'),
        '@contexts': path.resolve(configDir, './src/contexts'),
      },
    },
    build: {
      outDir: env.VITE_BUILD_OUTPUT_DIR || 'dist',
      sourcemap: !isProduction,
      // Use Vite's built-in minifier so production builds do not require
      // the optional terser package to be installed.
      minify: isProduction ? 'esbuild' : false,
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
        entry,
        template: 'index.html',
        inject: {
          data: {
            title: env.VITE_APP_NAME || 'Parking Management System',
            description:
              env.VITE_APP_DESCRIPTION || 'A comprehensive parking management system',
          },
        },
      }),
      svgr({
        svgrOptions: {
          icon: true,
        },
      }),
    ],
  };
});

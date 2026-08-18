// ============================================================================
// Vite Configuration
// ============================================================================

/**
 * Vite configuration for the Parking Management System frontend.
 * 
 * This configuration includes:
 * - React plugin with SWC for fast compilation
 * - Path aliases for cleaner imports
 * - Environment variable handling
 * - Build optimization
 * - Development server configuration
 * - Testing configuration
 * - PWA support
 * - Bundle analysis
 */

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { createHtmlPlugin } from 'vite-plugin-html';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Vite Configuration
// ============================================================================

export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  
  // Determine if this is a production build
  const isProduction = mode === 'production';
  const isDevelopment = mode === 'development';
  const isStaging = mode === 'staging';
  
  // Base configuration
  const config = {
    // ========================================================================
    // Base Options
    // ========================================================================
    
    // Base public path when served in production
    base: env.VITE_BASE_URL || '/',
    
    // ========================================================================
    // Server Configuration
    // ========================================================================
    
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      host: env.VITE_HOST || '0.0.0.0',
      strictPort: false,
      open: env.VITE_OPEN_BROWSER === 'true',
      
      // Proxy configuration for API calls
      proxy: {
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
        '/ws': {
          target: env.VITE_WEBSOCKET_URL || 'ws://localhost:8000',
          ws: true,
          changeOrigin: true,
        },
        '/uploads': {
          target: env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
        },
      },
      
      // CORS configuration
      cors: {
        origin: env.VITE_CORS_ORIGIN || '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
      },
      
      // HMR configuration
      hmr: {
        overlay: true,
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
    },
    
    // ========================================================================
    // Build Configuration
    // ========================================================================
    
    build: {
      // Output directory
      outDir: env.VITE_BUILD_OUTPUT_DIR || 'dist',
      
      // Generate source maps in development only
      sourcemap: isDevelopment || env.VITE_SOURCE_MAPS_ENABLED === 'true',
      
      // Minify options
      minify: isProduction ? 'terser' : false,
      
      // Terser options for production
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : [],
        },
        format: {
          comments: false,
        },
      },
      
      // Chunk size warning limit (in kB)
      chunkSizeWarningLimit: 1000,
      
      // Rollup options
      rollupOptions: {
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // React core
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            
            // UI library
            'mui-vendor': [
              '@mui/material',
              '@mui/icons-material',
              '@mui/x-data-grid',
              '@mui/x-date-pickers',
            ],
            
            // State management
            'state-vendor': ['@tanstack/react-query', 'zustand', 'jotai'],
            
            // Charts and visualization
            'chart-vendor': ['recharts', 'd3'],
            
            // Form libraries
            'form-vendor': ['formik', 'react-hook-form', 'yup'],
            
            // Utility libraries
            'utils-vendor': ['axios', 'date-fns', 'lodash'],
          },
          
          // Asset file naming
          assetFileNames: (assetInfo) => {
            if (assetInfo.name?.endsWith('.css')) {
              return 'assets/css/[name].[hash].[ext]';
            }
            if (assetInfo.name?.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
              return 'assets/images/[name].[hash].[ext]';
            }
            if (assetInfo.name?.match(/\.(woff|woff2|ttf|eot)$/)) {
              return 'assets/fonts/[name].[hash].[ext]';
            }
            return 'assets/[name].[hash].[ext]';
          },
          
          // Chunk file naming
          chunkFileNames: 'assets/js/[name].[hash].js',
          entryFileNames: 'assets/js/[name].[hash].js',
        },
      },
      
      // Target browser support
      target: 'es2020',
      
      // Enable/disable brotli compression
      brotliSize: true,
      
      // Enable/disable chunk size optimization
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          '@mui/material',
          '@mui/icons-material',
          '@tanstack/react-query',
          'axios',
          'date-fns',
        ],
      },
    },
    
    // ========================================================================
    // Development Server Configuration
    // ========================================================================
    
    preview: {
      port: parseInt(env.VITE_PREVIEW_PORT || '4173'),
      host: '0.0.0.0',
      open: env.VITE_OPEN_PREVIEW === 'true',
    },
    
    // ========================================================================
    // Plugin Configuration
    // ========================================================================
    
    plugins: [
      // React plugin with SWC for fast compilation
      react({
        // SWC options for faster builds
        tsDecorators: true,
        plugins: [],
      }),
      
      // HTML plugin for template variables
      createHtmlPlugin({
        minify: isProduction,
        entry: '/src/main.tsx',
        template: 'index.html',
        inject: {
          data: {
            title: env.VITE_APP_NAME || 'Parking Management System',
            description: env.VITE_APP_DESCRIPTION || 'A comprehensive parking management system',
            url: env.VITE_APP_URL || 'https://parking-system.com',
            apiUrl: env.VITE_API_URL || 'http://localhost:8000',
            environment: env.VITE_ENVIRONMENT || 'development',
          },
        },
      }),
      
      // SVGR plugin for SVG as React components
      svgr({
        exportAsDefault: true,
        svgrOptions: {
          icon: true,
          svgProps: {
            role: 'img',
          },
        },
      }),
    ],
    
    // ========================================================================
    // Path Aliases
    // ========================================================================
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@api': path.resolve(__dirname, './src/api'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@types': path.resolve(__dirname, './src/types'),
        '@store': path.resolve(__dirname, './src/store'),
        '@contexts': path.resolve(__dirname, './src/contexts'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@routes': path.resolve(__dirname, './src/routes'),
        '@services': path.resolve(__dirname, './src/services'),
        '@validators': path.resolve(__dirname, './src/validators'),
        '@constants': path.resolve(__dirname, './src/constants'),
        '@helpers': path.resolve(__dirname, './src/helpers'),
        '@config': path.resolve(__dirname, './src/config'),
      },
    },
    
    // ========================================================================
    // CSS Configuration
    // ========================================================================
    
    css: {
      // CSS modules configuration
      modules: {
        localsConvention: 'camelCase',
        generateScopedName: isProduction
          ? '[hash:base64:5]'
          : '[name]__[local]__[hash:base64:5]',
      },
      
      // Preprocessor options
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
          api: 'modern-compiler',
        },
      },
    },
    
    // ========================================================================
    // Environment Variables
    // ========================================================================
    
    define: {
      // Expose environment variables to the client
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        VITE_APP_VERSION: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      },
      // Global constants
      __APP_VERSION__: JSON.stringify(env.VITE_APP_VERSION || '1.0.0'),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __IS_PRODUCTION__: isProduction,
      __IS_DEVELOPMENT__: isDevelopment,
      __IS_STAGING__: isStaging,
    },
    
    // ========================================================================
    // ESBuild Configuration
    // ========================================================================
    
    esbuild: {
      // Drop console logs in production
      drop: isProduction ? ['console', 'debugger'] : [],
      // JSX configuration
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      // Legal comments
      legalComments: 'none',
    },
    
    // ========================================================================
    // Optimization
    // ========================================================================
    
    optimizeDeps: {
      // Include dependencies for optimization
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@mui/material',
        '@mui/icons-material',
        '@mui/x-data-grid',
        '@mui/x-date-pickers',
        '@tanstack/react-query',
        'axios',
        'date-fns',
        'formik',
        'yup',
        'recharts',
        'react-hot-toast',
      ],
      // Exclude dependencies from optimization
      exclude: [],
      // Force dependency optimization
      force: false,
    },
    
    // ========================================================================
    // Testing Configuration (Vitest)
    // ========================================================================
    
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html', 'lcov'],
        exclude: [
          'node_modules/',
          'src/test/',
          '**/*.d.ts',
          '**/*.test.ts',
          '**/*.spec.ts',
          '**/index.ts',
          '**/types.ts',
        ],
        thresholds: {
          lines: 80,
          functions: 80,
          branches: 80,
          statements: 80,
        },
      },
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/cypress/**',
        '**/*.d.ts',
      ],
      deps: {
        inline: ['@mui', '@emotion'],
      },
    },
  };
  
  // ============================================================================
  // Environment-specific Overrides
  // ============================================================================
  
  // Production-specific optimizations
  if (isProduction) {
    config.build.rollupOptions.output.manualChunks = {
      ...config.build.rollupOptions.output.manualChunks,
      // Separate vendors for better caching
      'vendor-react': ['react', 'react-dom'],
      'vendor-mui': ['@mui/material', '@mui/icons-material'],
      'vendor-utils': ['axios', 'date-fns', 'lodash-es'],
    };
  }
  
  // Staging-specific configuration
  if (isStaging) {
    config.build.sourcemap = true;
    config.build.minify = 'esbuild';
  }
  
  // Development-specific overrides
  if (isDevelopment) {
    // Faster builds for development
    config.build.rollupOptions.output.manualChunks = undefined;
  }
  
  return config;
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get the full path for an alias
 * @param {string} alias - The alias name
 * @returns {string} - The full path
 */
function getAliasPath(alias) {
  return path.resolve(__dirname, `./src/${alias}`);
}

// ============================================================================
// Export Configuration
// ============================================================================

// Export for use in other files
export { getAliasPath };
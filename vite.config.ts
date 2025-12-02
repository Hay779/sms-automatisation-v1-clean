import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        // Optimizations
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: isProduction, // Remove console.log in production
            drop_debugger: isProduction,
          }
        },
        // Code splitting
        rollupOptions: {
          output: {
            manualChunks: {
              'vendor-react': ['react', 'react-dom'],
              'vendor-supabase': ['@supabase/supabase-js'],
              'vendor-charts': ['recharts'],
              'vendor-icons': ['lucide-react'],
            }
          }
        },
        // Chunk size warnings
        chunkSizeWarningLimit: 1000,
        // Source maps (only in dev)
        sourcemap: !isProduction,
      },
      // Optimizations
      optimizeDeps: {
        include: ['react', 'react-dom', '@supabase/supabase-js']
      }
    };
});

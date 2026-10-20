import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(process.env.ANALYZE === 'true' ? [visualizer({ filename: 'dist/stats.html', open: false, gzipSize: true, brotliSize: true })] : []),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('recharts')) return 'vendor-recharts';
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react';
              if (id.includes('motion') || id.includes('framer-motion')) return 'vendor-motion';
              if (id.includes('lucide-react')) return 'vendor-lucide';
              if (id.includes('html2canvas')) return 'vendor-html2canvas';
              if (id.includes('dompurify')) return 'vendor-dompurify';
              if (id.includes('@google/genai') || id.includes('openai')) return 'vendor-ai';
              return 'vendor-core';
            }
            if (id.includes('src/data/lecture')) return 'charts-lecture';
            if (id.includes('src/data/charts')) return 'charts-data';
            if (id.includes('src/data/rules')) return 'charts-rules';
            if (id.includes('src/data/core')) return 'charts-core';
          },
        },
      },
      chunkSizeWarningLimit: 800,
    },
  };
});

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
      // [AI MOD] 不使用自訂 manualChunks。
      // 本專案的模組圖（react ↔ react-dom ↔ motion ↔ @bezi/core barrel ↔ src/data）存在循環依賴，
      // Rollup 手工分包會產生跨 chunk 循環 → 正式版 runtime 直接崩潰
      // （症狀：Cannot read properties of undefined (reading 'exports') / w is not a function），
      // 且 dev 模式不會觸發、只有 production bundle 會壞（E2E 抓不到）。
      // 改採 Vite 預設分包（route 層已由 React.lazy 自動切分），並以 chunkSizeWarningLimit 反映實際最大 chunk。
      chunkSizeWarningLimit: 900,
    },
  };
});

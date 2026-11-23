import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    exclude: ['sql.js'],
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          anki: ['jszip', 'sql.js'],
          react: ['react', 'react-dom'],
          study: ['dexie', 'ts-fsrs', 'wanakana', 'lucide-react'],
        },
      },
    },
  },
});

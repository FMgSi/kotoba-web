import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('firebase')) return 'firebase';
          if (id.includes('jszip') || id.includes('sql.js') || id.includes('fzstd')) return 'anki';
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react';
          if (id.includes('dexie') || id.includes('ts-fsrs') || id.includes('wanakana') || id.includes('lucide-react')) return 'study';
          if (id.includes('/src/data/')) return 'course-data';
        },
      },
    },
  },
});

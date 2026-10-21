import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false,
      allow: ['..', 'E:/CodeTranslator', 'e:/CodeTranslator', 'e:/Completely_New_Project'],
    },
  },
});

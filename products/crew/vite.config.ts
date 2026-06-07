import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// host:true exposes the dev server on the LAN so playtest phones can open it.
export default defineConfig({
  plugins: [react()],
  server: { host: true },
});

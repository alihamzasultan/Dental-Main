import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    envPrefix: ['VITE_', 'SUPABASE_'], // Support both standard and legacy prefixes
    server: {
        port: 5173,
        strictPort: false, // Allow it to try 5174 if 5173 is temporarily locked
    }
});

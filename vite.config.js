import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// No dev proxy: the client calls the API at VITE_API_URL in both dev and
// production, so the two environments exercise the same CORS and cookie path.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})

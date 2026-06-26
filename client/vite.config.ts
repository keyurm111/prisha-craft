import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const googleClientId = env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID || '';

  return {
    server: {
      port: parseInt(env.VITE_PORT || '5173'),
      proxy: {
        '/sitemap.xml': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
        }
      }
    },
    define: {
      __GOOGLE_CLIENT_ID__: JSON.stringify(googleClientId),
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

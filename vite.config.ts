import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ['react', 'react-dom', 'react-native-web', 'react-native'],
    alias: {
      'react-native-safe-area-context': path.resolve(__dirname, 'web/stubs/safe-area-context.js'),
      'react-native-screens': path.resolve(__dirname, 'web/stubs/screens.js'),
      'react-native/Libraries/Utilities/codegenNativeComponent': path.resolve(__dirname, 'web/stubs/codegenNativeComponent.js'),
      'react-native': 'react-native-web',
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@dashboards': path.resolve(__dirname, 'src/dashboards'),
      '@screens': path.resolve(__dirname, 'src/screens'),
      '@store': path.resolve(__dirname, 'src/shared/store'),
      '@models': path.resolve(__dirname, 'src/shared/models'),
      '@types': path.resolve(__dirname, 'src/shared/types'),
      '@components': path.resolve(__dirname, 'src/shared/components'),
      '@theme': path.resolve(__dirname, 'src/shared/theme'),
      '@db': path.resolve(__dirname, 'src/shared/db'),
      '@api': path.resolve(__dirname, 'src/shared/api'),
    },
  },
  build: {
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
  server: {
    port: 8082,
    host: true,
    proxy: {
      '/api': {
        target: 'https://sims-backends-3.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    __DEV__: true,
    global: 'globalThis',
  },
});

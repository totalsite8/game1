import path from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import healthHandler from './api/health.ts';
import telegramVerifyHandler from './api/telegram-verify.ts';
import savesSyncHandler from './api/saves-sync.ts';

function vercelApiDevPlugin(): Plugin {
  const attachMiddleware = (middlewares: {
    use: (route: string, fn: (req: any, res: any, next: any) => void) => void;
  }) => {
    middlewares.use('/api/health', (req, res) => {
      healthHandler(req, res);
    });
    middlewares.use('/api/telegram/verify', (req, res) => {
      void telegramVerifyHandler(req, res);
    });
    middlewares.use('/api/telegram-verify', (req, res) => {
      void telegramVerifyHandler(req, res);
    });
    middlewares.use('/api/saves/sync', (req, res) => {
      void savesSyncHandler(req, res);
    });
    middlewares.use('/api/saves-sync', (req, res) => {
      void savesSyncHandler(req, res);
    });
  };

  return {
    name: 'vercel-api-dev-middleware',
    configureServer(server) {
      attachMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachMiddleware(server.middlewares);
    },
  };
}

export default defineConfig({
  plugins: [react(), vercelApiDevPlugin()],
  resolve: {
    alias: {
      '@game-core': path.resolve(import.meta.dirname, 'src/packages/game-core'),
      '@render-babylon': path.resolve(import.meta.dirname, 'src/packages/render-babylon'),
      '@story': path.resolve(import.meta.dirname, 'src/packages/story'),
      '@content': path.resolve(import.meta.dirname, 'src/packages/content'),
      '@platform': path.resolve(import.meta.dirname, 'src/packages/platform'),
      '@validation': path.resolve(import.meta.dirname, 'src/packages/validation'),
      '@ui': path.resolve(import.meta.dirname, 'src/packages/ui'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: true,
  },
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 6000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react')) return 'react-vendor';
        },
      },
    },
  },
});

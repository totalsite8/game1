import type { IncomingMessage, ServerResponse } from 'node:http';

export default function handler(_req: IncomingMessage, res: ServerResponse) {
  const payload = {
    status: 'ok',
    service: 'unfiltered-route-katya-olya-vietnam',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    engines: {
      webgpu: 'planned',
      webgl2: 'available-when-supported',
      text_comfort_mode: 'enabled',
    },
    platforms: ['web', 'pwa'],
  };

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

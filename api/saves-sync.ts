import type { IncomingMessage, ServerResponse } from 'node:http';
// Fail closed until durable storage, authenticated sessions, rate limits and
// authoritative choice replay are implemented. Never claim ephemeral data is saved.
export default function handler(_req: IncomingMessage, res: ServerResponse) {
  res.statusCode = 503;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(
    JSON.stringify({
      status: 'unavailable',
      reason: 'Cloud saves are not configured. Progress is stored locally on your device.',
    })
  );
}

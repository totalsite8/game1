import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { TelegramVerifyRequestSchema } from '../src/packages/validation/schemas.ts';

/**
 * Official Telegram Mini App HMAC-SHA256 verification (Section 8 & 9 of brief):
 * secret_key = HMAC_SHA256("WebAppData", bot_token)
 * hash = HMAC_SHA256(secret_key, data_check_string)
 */
export function verifyTelegramInitDataServer(
  initDataRaw: string,
  botToken: string,
  maxAgeSeconds = 600
): {
  valid: boolean;
  reason?: string;
  pseudonymId?: string;
  authDate?: number;
  startParam?: string;
  isDemoMode?: boolean;
} {
  try {
    const params = new URLSearchParams(initDataRaw);
    const hash = params.get('hash');
    const authDateStr = params.get('auth_date');

    if (
      !hash ||
      !/^[a-f0-9]{64}$/i.test(hash) ||
      !authDateStr ||
      new Set([...params.keys()]).size !== [...params.keys()].length
    ) {
      return { valid: false, reason: 'Missing hash or auth_date in initData' };
    }

    const authDate = Number(authDateStr);
    if (!Number.isSafeInteger(authDate)) {
      return { valid: false, reason: 'Invalid auth_date format' };
    }

    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec - authDate > maxAgeSeconds || authDate > nowSec + 30) {
      return { valid: false, reason: 'initData expired (auth_date too old)' };
    }

    if (!botToken) return { valid: false, reason: 'Telegram authentication is not configured' };

    const entries: string[] = [];
    params.forEach((val, key) => {
      if (key !== 'hash') {
        entries.push(`${key}=${val}`);
      }
    });
    entries.sort();
    const dataCheckString = entries.join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    const computedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    const hashBuf = Buffer.from(hash, 'hex');
    const computedBuf = Buffer.from(computedHash, 'hex');
    if (hashBuf.length !== computedBuf.length || !crypto.timingSafeEqual(hashBuf, computedBuf)) {
      return { valid: false, reason: 'HMAC-SHA256 signature mismatch' };
    }

    const userJson = params.get('user');
    let rawUserId = '';
    if (userJson) {
      try {
        const parsed = JSON.parse(userJson);
        rawUserId = Number.isSafeInteger(parsed.id) && parsed.id > 0 ? String(parsed.id) : '';
      } catch {
        rawUserId = '';
      }
    }

    if (!rawUserId) return { valid: false, reason: 'Missing valid user ID' };

    // Privacy by design (Section 9): store a pseudonymized hash, never raw personal profile data
    const pseudonymId =
      'tg_' +
      crypto
        .createHmac('sha256', secretKey)
        .update(`pseudonym:${rawUserId}`)
        .digest('hex')
        .slice(0, 20);

    return {
      valid: true,
      pseudonymId,
      authDate,
      startParam: params.get('start_param') ?? undefined,
      isDemoMode: false,
    };
  } catch {
    return { valid: false, reason: 'Malformed initData payload' };
  }
}

async function readBody(req: IncomingMessage): Promise<string> {
  const parsedBody = (req as IncomingMessage & { body?: unknown }).body;
  if (parsedBody !== undefined) {
    const body = typeof parsedBody === 'string' ? parsedBody : JSON.stringify(parsedBody);
    if (body.length > 32768) throw new Error('Payload too large');
    return body;
  }
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
      if (data.length > 32_768) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }));
    return;
  }

  try {
    const raw = await readBody(req);
    const parsedJson = JSON.parse(raw || '{}');
    const validated = TelegramVerifyRequestSchema.safeParse(parsedJson);

    if (!validated.success) {
      res.statusCode = 400;
      res.end(
        JSON.stringify({
          ok: false,
          error: 'Invalid request schema',
          issues: validated.error.issues,
        })
      );
      return;
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN || '';
    if (!botToken) {
      res.statusCode = 503;
      res.end(JSON.stringify({ ok: false, error: 'Telegram authentication is not configured' }));
      return;
    }
    const result = verifyTelegramInitDataServer(validated.data.initData, botToken);

    if (!result.valid) {
      res.statusCode = 401;
      res.end(JSON.stringify({ ok: false, error: result.reason }));
      return;
    }

    res.statusCode = 200;
    res.end(
      JSON.stringify({
        ok: true,
        pseudonymId: result.pseudonymId,
        authDate: result.authDate,
        startParam: result.startParam ?? null,
        isDemoMode: result.isDemoMode ?? false,
      })
    );
  } catch (err) {
    res.statusCode = 400;
    res.end(
      JSON.stringify({
        ok: false,
        error: err instanceof Error ? err.message : 'Bad request',
      })
    );
  }
}

import { describe, it, expect } from 'vitest';
import { initial, choose, restore, ending } from '../src/packages/game-core/core';
import { story } from '../src/packages/story/story';
import { verifyTelegramInitDataServer } from '../api/telegram-verify';
import crypto from 'node:crypto';
describe('Story state', () => {
  it('has 12 bilingual beats, observations, choices and results', () => {
    expect(story).toHaveLength(12);
    for (const n of story) {
      expect(n.text.ru).toBeTruthy();
      expect(n.text.en).toBeTruthy();
      expect(n.choices.length).toBeGreaterThan(1);
      for (const c of n.choices) {
        expect(c.result.en).toBeTruthy();
        expect(c.label.ru).toBeTruthy();
      }
    }
  });
  it('replays all reachable paths, preserves bounded stats and reaches all four endings', () => {
    const reached = new Set();
    let paths = 0;
    function walk(g: ReturnType<typeof initial>) {
      expect(g.stats.trust).toBeGreaterThanOrEqual(0);
      expect(g.stats.trust).toBeLessThanOrEqual(100);
      expect(g.stats.battery).toBeLessThanOrEqual(100);
      if (g.step === 12) {
        reached.add(ending(g));
        expect(restore(JSON.parse(JSON.stringify(g)))).toEqual(g);
        paths++;
        return;
      }
      story[g.step].choices.forEach((_, i) => {
        const next = choose(g, i);
        if (next !== g) walk(next);
      });
    }
    walk(initial());
    expect([...reached].sort()).toEqual(['honest', 'restored', 'safe', 'viral']);
    expect(paths).toBeGreaterThan(4000);
  });
  it('rejects illegal transitions and reconstructs stats instead of trusting imports', () => {
    const g = initial();
    expect(choose(g, 500)).toBe(g);
    expect(() => restore({ ...g, step: 4 })).toThrow();
    const imported = restore({ ...g, stats: { ...g.stats, budget: 9999999 }, flags: ['viral'] });
    expect(imported.stats.budget).toBe(g.stats.budget);
    expect(imported.flags).toEqual([]);
  });
});
describe('Telegram verification (not yet connected to UI)', () => {
  function signed(token: string, date: number) {
    const p = new URLSearchParams({
      auth_date: String(date),
      user: JSON.stringify({ id: 123 }),
      start_param: 'episode1',
    });
    const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const content = [...p]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    p.set('hash', crypto.createHmac('sha256', secret).update(content).digest('hex'));
    return p.toString();
  }
  it('fails closed without secret, rejects old/future dates and forged signatures', () => {
    expect(
      verifyTelegramInitDataServer('hash=demo_telegram_signature_2030&auth_date=1', '').valid
    ).toBe(false);
    expect(
      verifyTelegramInitDataServer(signed('a', Math.floor(Date.now() / 1000) - 1000), 'a').valid
    ).toBe(false);
    expect(
      verifyTelegramInitDataServer(signed('a', Math.floor(Date.now() / 1000) + 1000), 'a').valid
    ).toBe(false);
    expect(
      verifyTelegramInitDataServer(signed('a', Math.floor(Date.now() / 1000)), 'b').valid
    ).toBe(false);
  });
  it('validates fresh HMAC and produces a pseudonym', () => {
    const v = verifyTelegramInitDataServer(signed('a', Math.floor(Date.now() / 1000)), 'a');
    expect(v.valid).toBe(true);
    expect(v.pseudonymId).toMatch(/^tg_/);
    expect(v.startParam).toBe('episode1');
  });
});

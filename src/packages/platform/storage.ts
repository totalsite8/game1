import { openDB } from 'idb';
import { restore, type Game } from '../game-core/core';
const db = () =>
  openDB('unfiltered-route', 1, {
    upgrade(db) {
      db.createObjectStore('saves');
    },
  });
let queue = Promise.resolve();
export async function load(): Promise<Game | null> {
  const d = await db();
  const v = await d.get('saves', 'guest');
  return v ? restore(v) : null;
}
export function save(g: Game) {
  const next = queue.then(async () => {
    const d = await db();
    await d.put('saves', g, 'guest');
  });
  queue = next.catch(() => {});
  return next;
}
export function remove() {
  const next = queue.then(async () => {
    const d = await db();
    await d.clear('saves');
  });
  queue = next.catch(() => {});
  return next;
}

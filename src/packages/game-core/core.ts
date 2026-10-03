import { z } from 'zod';
import { story, type Stats } from '../story/story';
export const SaveSchema = z.object({
  version: z.literal(1),
  step: z.number().int().min(0).max(story.length),
  hero: z.enum(['katya', 'olya']),
  history: z.array(z.number().int().min(0).max(2)).max(story.length),
  stats: z.object({
    trust: z.number(),
    safety: z.number(),
    budget: z.number(),
    battery: z.number(),
    evidence: z.number(),
    time: z.number(),
  }),
  flags: z.array(z.string()).max(40),
  journal: z.array(z.object({ step: z.number().int(), choice: z.number().int() })).max(40),
});
export type Game = z.infer<typeof SaveSchema>;
export const initial = (): Game => ({
  version: 1,
  step: 0,
  hero: 'katya',
  history: [],
  stats: { trust: 55, safety: 65, budget: 1800000, battery: 65, evidence: 0, time: 24 },
  flags: [],
  journal: [],
});
export function choose(state: Game, index: number): Game {
  const choice = story[state.step]?.choices[index];
  if (!choice || (choice.requires && state.stats.evidence < choice.requires)) return state;
  const stats = { ...state.stats };
  for (const key of Object.keys(choice.effect) as (keyof Stats)[])
    stats[key] = Math.max(0, stats[key] + (choice.effect[key] ?? 0));
  for (const key of ['trust', 'safety', 'battery'] as const) stats[key] = Math.min(100, stats[key]);
  stats.evidence = Math.min(10, stats.evidence);
  return {
    ...state,
    step: state.step + 1,
    stats,
    history: [...state.history, index],
    flags: choice.flag ? [...state.flags, choice.flag] : state.flags,
    journal: choice.fact ? [...state.journal, { step: state.step, choice: index }] : state.journal,
  };
}
export function restore(value: unknown): Game {
  const data = SaveSchema.parse(value);
  if (data.history.length !== data.step) throw Error('Invalid history');
  let canonical = initial();
  for (const index of data.history) {
    const next = choose(canonical, index);
    if (next === canonical) throw Error('Invalid transition');
    canonical = next;
  }
  return { ...canonical, hero: data.hero };
}
export function ending(g: Game): 'honest' | 'restored' | 'safe' | 'viral' {
  if (g.flags.includes('viral')) return 'viral';
  if (g.flags.includes('leave')) return 'safe';
  if (g.flags.includes('confrontation') && g.flags.includes('repaired')) return 'restored';
  return 'honest';
}

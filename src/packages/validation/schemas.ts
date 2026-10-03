import { z } from 'zod';
// Draft catalog identifiers. Runtime save schema is in game-core/core.ts.
export type HeroineId = 'katya' | 'olya';
export type LocationId = 'hotel_alley' | 'night_market' | 'riverfront_pier' | 'lantern_terrace';
export const TelegramVerifyRequestSchema = z.object({
  initData: z.string().min(1).max(4096),
});

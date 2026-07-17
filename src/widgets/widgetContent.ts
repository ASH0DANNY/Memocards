import { Card, Category } from '../types';
import { getCards, getCategories, getSettings } from '../storage/storageService';
import { RotationUnit } from '../types';

export type WidgetEntry = {
  card: Card;
  category?: Category;
  date: Date;
};

function stableHash(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) | 0;
  }
  return h;
}

/**
 * Produces the same ordering every time it's called for a given card set,
 * so "the 5th card in the sequence" means the same thing whether it's
 * computed by the app, a widget refresh, or a lock-screen notification —
 * without needing to persist an explicit shuffled list anywhere.
 */
export function buildStableOrder(cards: Card[], shuffle: boolean): Card[] {
  const copy = [...cards];
  if (shuffle) {
    copy.sort((a, b) => stableHash(a.id) - stableHash(b.id));
  } else {
    copy.sort((a, b) => a.createdAt - b.createdAt);
  }
  return copy;
}

export function intervalToMs(value: number, unit: RotationUnit): number {
  const seconds = unit === 'minutes' ? value * 60 : unit === 'hours' ? value * 3600 : value * 86400;
  return seconds * 1000;
}

/**
 * Deterministically picks "the card that should be showing right now" from
 * a fixed Unix-epoch anchor. This means any surface (widget, notification,
 * freshly opened app) that recomputes this independently will agree on the
 * same card for the same moment in time, even if it missed several ticks.
 */
export function currentIndexForTime(poolLength: number, intervalMs: number, nowMs: number): number {
  if (poolLength === 0) return 0;
  return Math.floor(nowMs / intervalMs) % poolLength;
}

/**
 * Builds `count` upcoming entries starting from "now", for surfaces that can
 * accept a whole timeline at once (iOS WidgetKit). Android widgets only ever
 * need entries[0], since Android has no native timeline concept — it just
 * re-renders using this same deterministic function whenever it gets a
 * chance to refresh.
 */
export async function buildUpcomingEntries(count: number): Promise<WidgetEntry[]> {
  const [cards, categories, settings] = await Promise.all([getCards(), getCategories(), getSettings()]);
  const enabledIds = new Set(categories.filter((c) => c.enabled).map((c) => c.id));
  const pool = buildStableOrder(
    cards.filter((c) => enabledIds.has(c.categoryId)),
    settings.shuffle
  );

  if (pool.length === 0) return [];

  const intervalMs = intervalToMs(settings.rotationValue, settings.rotationUnit);
  const now = Date.now();
  const startIndex = currentIndexForTime(pool.length, intervalMs, now);
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  const entries: WidgetEntry[] = [];
  for (let i = 0; i < count; i++) {
    const idx = (startIndex + i) % pool.length;
    const card = pool[idx];
    entries.push({
      card,
      category: categoryById.get(card.categoryId),
      date: new Date(now + intervalMs * i),
    });
  }
  return entries;
}

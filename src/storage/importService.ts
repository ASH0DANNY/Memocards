import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { Card, Category } from '../types';
import { getCards, getCategories, saveCards, saveCategories, generateId } from './storageService';

const PALETTE = ['#2D6A4F', '#087E8B', '#E85D4C', '#7B5EA7', '#C97B3D', '#3563E9'];

type RawCard = {
  category: string;
  front: string;
  back: string;
  tags?: string[];
};

export type ImportResult = {
  count: number;
  newCategories: number;
};

/**
 * Accepts either:
 *   1. A plain array:      [{ "category": "...", "front": "...", "back": "..." }, ...]
 *   2. A wrapped object:    { "cards": [ ... same shape ... ] }
 * "front"/"back" also accept "question"/"answer" as aliases.
 */
function parseJsonCards(content: string): RawCard[] {
  const data = JSON.parse(content);
  const list: unknown[] = Array.isArray(data) ? data : Array.isArray(data?.cards) ? data.cards : [];
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('JSON file must contain an array of cards (or a "cards" array).');
  }

  return list
    .map((raw): RawCard => {
      const item = raw as Record<string, unknown>;
      return {
        category: String(item.category ?? item.categoryName ?? 'Imported').trim() || 'Imported',
        front: String(item.front ?? item.question ?? '').trim(),
        back: String(item.back ?? item.answer ?? '').trim(),
        tags: Array.isArray(item.tags) ? (item.tags as string[]) : undefined,
      };
    })
    .filter((c) => c.front.length > 0 && c.back.length > 0);
}

/**
 * Expected line format: Category | Front | Back
 * Falls back to "Front | Back" (category becomes "Imported") if only 2 parts are given.
 * Blank lines are skipped.
 */
function parseTxtCards(content: string): RawCard[] {
  const lines = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const cards: RawCard[] = [];
  for (const line of lines) {
    const parts = line.split('|').map((p) => p.trim());
    if (parts.length >= 3) {
      cards.push({ category: parts[0], front: parts[1], back: parts.slice(2).join('|').trim() });
    } else if (parts.length === 2) {
      cards.push({ category: 'Imported', front: parts[0], back: parts[1] });
    }
  }
  return cards.filter((c) => c.front.length > 0 && c.back.length > 0);
}

export async function importCardsFromFile(): Promise<ImportResult> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', 'text/*', '*/*'],
    copyToCacheDirectory: true,
  });

  if (picked.canceled || !picked.assets?.[0]) {
    return { count: 0, newCategories: 0 };
  }

  const asset = picked.assets[0];
  const file = new File(asset.uri);
  const content = await file.text();

  const fileName = (asset.name ?? '').toLowerCase();
  const raw = fileName.endsWith('.json') ? parseJsonCards(content) : parseTxtCards(content);

  if (raw.length === 0) {
    throw new Error('No valid cards were found in that file.');
  }

  const existingCategories = await getCategories();
  const existingCards = await getCards();
  const byName = new Map<string, Category>(existingCategories.map((c) => [c.name.toLowerCase(), c]));

  let newCategoryCount = 0;
  const newCards: Card[] = [];

  for (const item of raw) {
    const key = item.category.toLowerCase();
    let category = byName.get(key);
    if (!category) {
      category = {
        id: generateId(),
        name: item.category,
        enabled: true,
        color: PALETTE[byName.size % PALETTE.length],
      };
      byName.set(key, category);
      newCategoryCount += 1;
    }
    newCards.push({
      id: generateId(),
      categoryId: category.id,
      front: item.front,
      back: item.back,
      tags: item.tags,
      createdAt: Date.now(),
    });
  }

  await saveCategories(Array.from(byName.values()));
  await saveCards([...existingCards, ...newCards]);

  return { count: newCards.length, newCategories: newCategoryCount };
}

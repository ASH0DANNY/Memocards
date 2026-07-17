import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card, Category, Settings } from '../types';

const KEYS = {
  cards: '@memocards/cards',
  categories: '@memocards/categories',
  settings: '@memocards/settings',
} as const;

export const DEFAULT_SETTINGS: Settings = {
  themeId: 'minimal-light',
  rotationValue: 30,
  rotationUnit: 'minutes',
  shuffle: true,
  lockScreenEnabled: false,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[storage] Failed to read ${key}`, e);
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ---- Cards ----

export const getCards = (): Promise<Card[]> => readJson<Card[]>(KEYS.cards, []);
export const saveCards = (cards: Card[]): Promise<void> => writeJson(KEYS.cards, cards);

export async function addCard(card: Card): Promise<void> {
  const cards = await getCards();
  cards.push(card);
  await saveCards(cards);
}

export async function updateCard(updated: Card): Promise<void> {
  const cards = await getCards();
  const idx = cards.findIndex((c) => c.id === updated.id);
  if (idx >= 0) {
    cards[idx] = updated;
    await saveCards(cards);
  }
}

export async function deleteCard(id: string): Promise<void> {
  const cards = await getCards();
  await saveCards(cards.filter((c) => c.id !== id));
}

// ---- Categories ----

export const getCategories = (): Promise<Category[]> => readJson<Category[]>(KEYS.categories, []);
export const saveCategories = (categories: Category[]): Promise<void> => writeJson(KEYS.categories, categories);

export async function addCategory(category: Category): Promise<void> {
  const categories = await getCategories();
  categories.push(category);
  await saveCategories(categories);
}

export async function updateCategory(updated: Category): Promise<void> {
  const categories = await getCategories();
  const idx = categories.findIndex((c) => c.id === updated.id);
  if (idx >= 0) {
    categories[idx] = updated;
    await saveCategories(categories);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await getCategories();
  await saveCategories(categories.filter((c) => c.id !== id));
  const cards = await getCards();
  await saveCards(cards.filter((c) => c.categoryId !== id));
}

// ---- Settings ----

export const getSettings = (): Promise<Settings> => readJson<Settings>(KEYS.settings, DEFAULT_SETTINGS);
export const saveSettings = (settings: Settings): Promise<void> => writeJson(KEYS.settings, settings);

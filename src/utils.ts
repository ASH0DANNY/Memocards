import { Category } from './types';

/** A set of study-relevant icons to choose from — deliberately small and
 * curated rather than a full emoji picker, since most of these categories
 * (dates, scripts, formulas, general facts) map cleanly onto a handful of
 * symbols, and a short list is much faster to pick from than a searchable
 * grid. */
export const CATEGORY_ICONS: string[] = ['📜', '📅', '🈶', '🔤', '➗', '🧪', '🌍', '⚖️', '📖', '💡'];

export function formatCategoryLabel(category?: Category): string {
  if (!category) return '';
  return category.icon ? `${category.icon} ${category.name}` : category.name;
}

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getCards, getCategories, getSettings } from '../storage/storageService';
import { RotationUnit } from '../types';

/**
 * Real Android lock-screen *widgets* are not supported by the OS (removed in
 * Android 5.0). This module gets you the closest practical equivalent: a
 * local notification, shown with full content on the lock screen, that
 * cycles through your enabled flashcards on your chosen schedule.
 *
 * How it works: rather than trying to run code "in the background" (which
 * both platforms restrict and throttle), we pre-schedule a batch of
 * one-time notifications, each already containing a specific card's
 * content, spaced out at the configured interval. Re-opening the app (or
 * toggling a relevant setting) tops the batch back up.
 */

const BATCH_SIZE = 24;
const CHANNEL_ID = 'memocards-flashcards';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function intervalToSeconds(value: number, unit: RotationUnit): number {
  if (unit === 'minutes') return value * 60;
  if (unit === 'hours') return value * 3600;
  return value * 86400;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: 'Flashcards',
    importance: Notifications.AndroidImportance.HIGH,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const result = await Notifications.requestPermissionsAsync();
  return result.granted;
}

export async function disableLockScreenCards(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

export async function refreshLockScreenSchedule(): Promise<{ scheduled: number; reason?: string }> {
  const settings = await getSettings();

  if (!settings.lockScreenEnabled) {
    await disableLockScreenCards();
    return { scheduled: 0, reason: 'disabled' };
  }

  const granted = await requestNotificationPermission();
  if (!granted) {
    return { scheduled: 0, reason: 'permission-denied' };
  }

  const [cards, categories] = await Promise.all([getCards(), getCategories()]);
  const enabledIds = new Set(categories.filter((c) => c.enabled).map((c) => c.id));
  let pool = cards.filter((c) => enabledIds.has(c.categoryId));

  if (pool.length === 0) {
    await disableLockScreenCards();
    return { scheduled: 0, reason: 'no-cards' };
  }

  if (settings.shuffle) pool = shuffleArray(pool);

  await ensureAndroidChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();

  const intervalSeconds = Math.max(60, intervalToSeconds(settings.rotationValue, settings.rotationUnit));
  const categoryById = new Map(categories.map((c) => [c.id, c]));

  let scheduled = 0;
  for (let i = 0; i < BATCH_SIZE; i++) {
    const card = pool[i % pool.length];
    const category = categoryById.get(card.categoryId);
    const title = category ? `${category.name} · ${card.front}` : card.front;

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body: card.back,
        sound: false,
        data: { cardId: card.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: intervalSeconds * (i + 1),
        repeats: false,
        channelId: CHANNEL_ID,
      },
    });
    scheduled += 1;
  }

  return { scheduled };
}

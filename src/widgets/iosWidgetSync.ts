import { Platform } from 'react-native';
import FlashCardWidget from './FlashCardWidget';
import { buildUpcomingEntries } from './widgetContent';

// iOS WidgetKit has a system-wide daily refresh budget shared across every
// app's widgets (Apple doesn't publish an exact number, but it's commonly a
// few dozen per day). Scheduling too many entries too close together won't
// crash anything, but very short custom durations (a few minutes) may not
// actually update that often on a real device — an hour or more is a safer
// bet for reliable Home/Lock Screen rotation.
const TIMELINE_LENGTH = 24;

export async function syncIOSWidget(): Promise<void> {
  if (Platform.OS !== 'ios') return;

  const entries = await buildUpcomingEntries(TIMELINE_LENGTH);
  if (entries.length === 0) return;

  FlashCardWidget.updateTimeline(
    entries.map((entry) => ({
      date: entry.date,
      props: {
        categoryName: entry.category?.name ?? '',
        categoryColor: entry.category?.color ?? '#2D6A4F',
        front: entry.card.front,
        back: entry.card.back,
      },
    }))
  );
}

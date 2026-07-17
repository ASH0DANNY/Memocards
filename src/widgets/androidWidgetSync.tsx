import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { FlashCardAndroidWidget } from './FlashCardAndroidWidget';
import { buildUpcomingEntries } from './widgetContent';

// Must match the widget "name" configured in the react-native-android-widget
// config plugin block in app.config.ts, and the key used in
// widget-task-handler.tsx's nameToWidget map.
const WIDGET_NAME = 'FlashCard';

export async function syncAndroidWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const [current] = await buildUpcomingEntries(1);
  if (!current) return;

  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => (
      <FlashCardAndroidWidget
        categoryName={current.category?.name ?? ''}
        categoryColor={current.category?.color ?? '#2D6A4F'}
        front={current.card.front}
        back={current.card.back}
      />
    ),
    widgetNotFound: () => {
      // No FlashCard widget on the home screen yet — nothing to push to.
    },
  });
}

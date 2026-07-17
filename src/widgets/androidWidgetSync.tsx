import React from 'react';
import { Platform } from 'react-native';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { FlashCardAndroidWidget } from './FlashCardAndroidWidget';
import { buildUpcomingEntries } from './widgetContent';
import { getSettings } from '../storage/storageService';
import { getTheme } from '../theme/themes';

// Must match the widget "name" configured in the react-native-android-widget
// config plugin block in app.config.ts, and the key used in
// widget-task-handler.tsx's nameToWidget map.
const WIDGET_NAME = 'FlashCard';

export async function syncAndroidWidget(): Promise<void> {
  if (Platform.OS !== 'android') return;

  const [current, settings] = await Promise.all([
    buildUpcomingEntries(1).then((entries) => entries[0]),
    getSettings(),
  ]);
  if (!current) return;

  const theme = getTheme(settings.themeId);

  await requestWidgetUpdate({
    widgetName: WIDGET_NAME,
    renderWidget: () => (
      <FlashCardAndroidWidget
        categoryName={current.category?.name ?? ''}
        categoryColor={current.category?.color ?? theme.accent}
        front={current.card.front}
        back={current.card.back}
        layout={settings.widgetLayout}
        background={theme.cardBackground}
        textColor={theme.textColor}
        subTextColor={theme.subTextColor}
        borderRadius={theme.borderRadius}
      />
    ),
    widgetNotFound: () => {
      // No FlashCard widget on the home screen yet — nothing to push to.
    },
  });
}

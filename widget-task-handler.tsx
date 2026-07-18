import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { FlashCardAndroidWidget } from './src/widgets/FlashCardAndroidWidget';
import { buildUpcomingEntries } from './src/widgets/widgetContent';
import { getSettings } from './src/storage/storageService';
import { getTheme } from './src/theme/themes';
import { formatCategoryLabel } from './src/utils';

const nameToWidget = {
  FlashCard: FlashCardAndroidWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetName = props.widgetInfo.widgetName as keyof typeof nameToWidget;
  if (!nameToWidget[widgetName]) return;

  switch (props.widgetAction) {
    case 'WIDGET_ADDED':
    case 'WIDGET_UPDATE':
    case 'WIDGET_RESIZED': {
      const [entries, settings] = await Promise.all([buildUpcomingEntries(1), getSettings()]);
      const [current] = entries;
      const theme = getTheme(settings.themeId);

      if (!current) {
        props.renderWidget(
          <FlashCardAndroidWidget
            categoryName=""
            categoryColor={theme.accent}
            front="No cards yet"
            back="Open MemoCards to add or enable some"
            layout={settings.widgetLayout}
            background={theme.cardBackground}
            textColor={theme.textColor}
            subTextColor={theme.subTextColor}
            borderRadius={theme.borderRadius}
          />
        );
        return;
      }

      props.renderWidget(
        <FlashCardAndroidWidget
          categoryName={formatCategoryLabel(current.category)}
          categoryColor={current.category?.color ?? theme.accent}
          front={current.card.front}
          back={current.card.back}
          layout={settings.widgetLayout}
          background={theme.cardBackground}
          textColor={theme.textColor}
          subTextColor={theme.subTextColor}
          borderRadius={theme.borderRadius}
        />
      );
      break;
    }
    case 'WIDGET_DELETED':
    case 'WIDGET_CLICK':
    default:
      break;
  }
}

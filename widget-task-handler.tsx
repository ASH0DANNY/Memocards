import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { FlashCardAndroidWidget } from './src/widgets/FlashCardAndroidWidget';
import { buildUpcomingEntries } from './src/widgets/widgetContent';

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
      const [current] = await buildUpcomingEntries(1);

      if (!current) {
        props.renderWidget(
          <FlashCardAndroidWidget
            categoryName=""
            categoryColor="#2D6A4F"
            front="No cards yet"
            back="Open MemoCards to add or enable some"
          />
        );
        return;
      }

      props.renderWidget(
        <FlashCardAndroidWidget
          categoryName={current.category?.name ?? ''}
          categoryColor={current.category?.color ?? '#2D6A4F'}
          front={current.card.front}
          back={current.card.back}
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

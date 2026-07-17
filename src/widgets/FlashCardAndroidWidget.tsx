import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { WidgetLayout } from '../types';

export type FlashCardAndroidWidgetProps = {
  categoryName: string;
  categoryColor: string;
  front: string;
  back: string;
  layout: WidgetLayout;
  background: string;
  textColor: string;
  subTextColor: string;
  borderRadius: number;
};

export function FlashCardAndroidWidget({
  categoryName,
  categoryColor,
  front,
  back,
  layout,
  background,
  textColor,
  subTextColor,
  borderRadius,
}: FlashCardAndroidWidgetProps) {
  const isCompact = layout === 'compact';

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: background,
        borderRadius,
        padding: 16,
      }}
    >
      {!isCompact && categoryName.length > 0 && (
        <TextWidget text={categoryName} style={{ fontSize: 12, color: categoryColor }} />
      )}
      <TextWidget
        text={front}
        style={{ fontSize: isCompact ? 24 : 20, color: textColor, marginTop: isCompact ? 0 : 4 }}
      />
      {!isCompact && (
        <TextWidget text={back} style={{ fontSize: 14, color: subTextColor, marginTop: 2 }} />
      )}
    </FlexWidget>
  );
}

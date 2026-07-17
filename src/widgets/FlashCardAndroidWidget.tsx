import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export type FlashCardAndroidWidgetProps = {
  categoryName: string;
  categoryColor: string;
  front: string;
  back: string;
};

export function FlashCardAndroidWidget({
  categoryName,
  categoryColor,
  front,
  back,
}: FlashCardAndroidWidgetProps) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 16,
      }}
    >
      {categoryName.length > 0 && (
        <TextWidget text={categoryName} style={{ fontSize: 12, color: categoryColor }} />
      )}
      <TextWidget
        text={front}
        style={{ fontSize: 20, color: '#1A1A1A', marginTop: 4 }}
      />
      <TextWidget text={back} style={{ fontSize: 14, color: '#6B6B6B', marginTop: 2 }} />
    </FlexWidget>
  );
}

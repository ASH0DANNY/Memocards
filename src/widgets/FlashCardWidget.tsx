import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type FlashCardWidgetProps = {
  categoryName: string;
  categoryColor: string;
  front: string;
  back: string;
};

function FlashCardWidgetComponent(props: FlashCardWidgetProps, environment: WidgetEnvironment) {
  'widget';

  const family = environment.widgetFamily;

  // ---- Lock Screen families (small, often monochrome) ----
  if (family === 'accessoryInline') {
    return <Text>{props.front}</Text>;
  }

  if (family === 'accessoryCircular') {
    return (
      <VStack modifiers={[padding({ all: 4 })]}>
        <Text modifiers={[font({ size: 12, weight: 'bold' })]}>{props.front}</Text>
      </VStack>
    );
  }

  if (family === 'accessoryRectangular') {
    return (
      <VStack modifiers={[padding({ all: 4 })]}>
        <Text modifiers={[font({ size: 13, weight: 'bold' })]}>{props.front}</Text>
        <Text modifiers={[font({ size: 11 })]}>{props.back}</Text>
      </VStack>
    );
  }

  // ---- Home Screen families ----
  const isSmall = family === 'systemSmall';

  return (
    <VStack modifiers={[padding({ all: 14 })]}>
      <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(props.categoryColor)]}>
        {props.categoryName}
      </Text>
      <Text modifiers={[font({ size: isSmall ? 18 : 22, weight: 'bold' })]}>{props.front}</Text>
      {!isSmall && (
        <Text modifiers={[font({ size: 14 }), foregroundStyle('#6B6B6B')]}>{props.back}</Text>
      )}
    </VStack>
  );
}

// This name ("FlashCardWidget") must exactly match the widget's "name" entry
// in the expo-widgets config plugin block in app.config.ts.
const FlashCardWidget = createWidget('FlashCardWidget', FlashCardWidgetComponent);

export default FlashCardWidget;

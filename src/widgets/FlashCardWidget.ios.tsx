import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type FlashCardWidgetProps = {
  categoryName: string;
  categoryColor: string;
  front: string;
  back: string;
  subTextColor: string;
  layout: 'compact' | 'detailed';
};

function FlashCardWidgetComponent(props: FlashCardWidgetProps, environment: WidgetEnvironment) {
  'widget';

  const family = environment.widgetFamily;
  const isCompact = props.layout === 'compact';

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
        {!isCompact && <Text modifiers={[font({ size: 11 })]}>{props.back}</Text>}
      </VStack>
    );
  }

  // ---- Home Screen families ----
  // A compact layout always behaves like the small size, regardless of how
  // much room the chosen widget size actually has — this is the setting
  // from Settings → Widget preview, not the OS-determined family.
  const showDetails = !isCompact && family !== 'systemSmall';

  return (
    <VStack modifiers={[padding({ all: 14 })]}>
      {!isCompact && (
        <Text modifiers={[font({ size: 11, weight: 'semibold' }), foregroundStyle(props.categoryColor)]}>
          {props.categoryName}
        </Text>
      )}
      <Text modifiers={[font({ size: isCompact || family === 'systemSmall' ? 18 : 22, weight: 'bold' })]}>
        {props.front}
      </Text>
      {showDetails && (
        <Text modifiers={[font({ size: 14 }), foregroundStyle(props.subTextColor)]}>{props.back}</Text>
      )}
    </VStack>
  );
}

// This name ("FlashCardWidget") must exactly match the widget's "name" entry
// in the expo-widgets config plugin block in app.config.ts.
const FlashCardWidget = createWidget('FlashCardWidget', FlashCardWidgetComponent);

export default FlashCardWidget;

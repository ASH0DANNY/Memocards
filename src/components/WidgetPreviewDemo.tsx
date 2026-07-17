import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Theme } from '../theme/themes';
import { WidgetLayout } from '../types';

type SampleContent = {
  categoryName: string;
  categoryColor: string;
  front: string;
  back: string;
};

type Props = {
  theme: Theme;
  layout: WidgetLayout;
  sample: SampleContent;
};

const TILE_DIMENSIONS = {
  small: { width: 96, height: 96 },
  medium: { width: 200, height: 96 },
  large: { width: 200, height: 200 },
};

function PreviewTile({
  label,
  width,
  height,
  theme,
  showCategory,
  showBack,
  frontSize,
  sample,
}: {
  label: string;
  width: number;
  height: number;
  theme: Theme;
  showCategory: boolean;
  showBack: boolean;
  frontSize: number;
  sample: SampleContent;
}) {
  return (
    <View style={styles.tileWrapper}>
      <View
        style={[
          styles.tile,
          {
            width,
            height,
            backgroundColor: theme.cardBackground,
            borderColor: theme.cardBorder,
            borderRadius: theme.borderRadius * 0.6,
          },
        ]}
      >
        {showCategory && sample.categoryName.length > 0 && (
          <Text style={[styles.category, { color: sample.categoryColor }]} numberOfLines={1}>
            {sample.categoryName}
          </Text>
        )}
        <Text
          style={[styles.front, { color: theme.textColor, fontSize: frontSize }]}
          numberOfLines={showBack ? 2 : 3}
        >
          {sample.front}
        </Text>
        {showBack && (
          <Text style={[styles.back, { color: theme.subTextColor }]} numberOfLines={2}>
            {sample.back}
          </Text>
        )}
      </View>
      <Text style={[styles.tileLabel, { color: theme.subTextColor }]}>{label}</Text>
    </View>
  );
}

export default function WidgetPreviewDemo({ theme, layout, sample }: Props) {
  const isCompact = layout === 'compact';

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      <PreviewTile
        label="Small"
        width={TILE_DIMENSIONS.small.width}
        height={TILE_DIMENSIONS.small.height}
        theme={theme}
        showCategory={false}
        showBack={false}
        frontSize={16}
        sample={sample}
      />
      <PreviewTile
        label="Medium"
        width={TILE_DIMENSIONS.medium.width}
        height={TILE_DIMENSIONS.medium.height}
        theme={theme}
        showCategory={!isCompact}
        showBack={false}
        frontSize={isCompact ? 20 : 17}
        sample={sample}
      />
      <PreviewTile
        label="Large"
        width={TILE_DIMENSIONS.large.width}
        height={TILE_DIMENSIONS.large.height}
        theme={theme}
        showCategory={!isCompact}
        showBack={!isCompact}
        frontSize={isCompact ? 22 : 19}
        sample={sample}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 20, gap: 14, paddingVertical: 4 },
  tileWrapper: { alignItems: 'center' },
  tile: {
    borderWidth: 1,
    padding: 12,
    justifyContent: 'center',
  },
  tileLabel: { fontSize: 12, marginTop: 6, fontWeight: '600' },
  category: { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  front: { fontWeight: '700' },
  back: { fontSize: 12, marginTop: 4 },
});

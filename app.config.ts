import type { ConfigContext, ExpoConfig } from 'expo/config';
import type { WithAndroidWidgetsParams } from 'react-native-android-widget';

const androidWidgetConfig: WithAndroidWidgetsParams = {
  fonts: [],
  widgets: [
    {
      name: 'FlashCard',
      label: 'MemoCards Flash Card',
      description: 'Shows your current flash card, rotating on your chosen schedule.',
      minWidth: '250dp',
      minHeight: '150dp',
      targetCellWidth: 4,
      targetCellHeight: 2,
    },
  ],
};

// This file is evaluated *in addition to* app.json — app.json's fields are
// passed in as `config` below and spread first, so keep app.json as-is
// (name, slug, icon, splash, android.package, etc.) and this file only adds
// config plugins on top of it: the widget plugins, plus expo-sharing and
// expo-notifications, both of which *require* being listed here — `expo
// install` can normally add plugins like these automatically, but only for
// a plain app.json. Since this is a dynamic (code) config, it can't be
// auto-edited, so any future package that needs a plugin must be added here
// by hand (the CI error message will tell you exactly which one).
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  // Hardcoded, not `config.name ?? 'MemoCards'` — the scaffolding step in CI
  // creates a temp project whose folder name can end up here as a "valid
  // but wrong" value (e.g. a name derived from a temp folder), which a `??`
  // fallback won't catch since it's non-empty. These two must always win.
  name: 'MemoCards',
  slug: 'memocards',
  plugins: [
    ...(config.plugins ?? []),
    'expo-sharing',
    'expo-notifications',
    ['react-native-android-widget', androidWidgetConfig],
    [
      'expo-widgets',
      {
        widgets: [
          {
            name: 'FlashCardWidget',
            displayName: 'MemoCards',
            description: 'Shows your current flash card on the Home Screen or Lock Screen.',
            supportedFamilies: [
              'systemSmall',
              'systemMedium',
              'systemLarge',
              'accessoryCircular',
              'accessoryRectangular',
              'accessoryInline',
            ],
          },
        ],
      },
    ],
  ],
});

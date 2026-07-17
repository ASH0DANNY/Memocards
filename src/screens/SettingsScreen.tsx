import React, { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Platform } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import { THEMES } from '../theme/themes';
import { exportBackup, importBackup } from '../storage/backupService';
import { getCards, getCategories } from '../storage/storageService';
import { RotationUnit, WidgetLayout } from '../types';
import WidgetPreviewDemo from '../components/WidgetPreviewDemo';

const PLACEHOLDER_SAMPLE = {
  categoryName: 'Indian History',
  categoryColor: '#2D6A4F',
  front: '1857',
  back: 'Indian Rebellion of 1857',
};

const PRESETS: { label: string; value: number; unit: RotationUnit }[] = [
  { label: '15 min', value: 15, unit: 'minutes' },
  { label: '1 hour', value: 1, unit: 'hours' },
  { label: '4 hours', value: 4, unit: 'hours' },
  { label: '1 day', value: 1, unit: 'days' },
];

export default function SettingsScreen() {
  const { theme, settings, setThemeId, setRotation, setShuffle, setLockScreenEnabled, setWidgetLayout } =
    useAppTheme();
  const [customValue, setCustomValue] = useState(String(settings.rotationValue));
  const [customUnit, setCustomUnit] = useState<RotationUnit>(settings.rotationUnit);
  const [busy, setBusy] = useState(false);
  const [previewSample, setPreviewSample] = useState(PLACEHOLDER_SAMPLE);

  useEffect(() => {
    (async () => {
      const [cards, categories] = await Promise.all([getCards(), getCategories()]);
      const enabledIds = new Set(categories.filter((c) => c.enabled).map((c) => c.id));
      const card = cards.find((c) => enabledIds.has(c.categoryId));
      if (card) {
        const category = categories.find((c) => c.id === card.categoryId);
        setPreviewSample({
          categoryName: category?.name ?? '',
          categoryColor: category?.color ?? theme.accent,
          front: card.front,
          back: card.back,
        });
      }
    })();
    // Only needs to run once on mount — this is just a representative sample,
    // not something that needs to track live edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCustom = () => {
    const num = parseInt(customValue, 10);
    if (!num || num <= 0) {
      Alert.alert('Invalid duration', 'Enter a positive whole number.');
      return;
    }
    setRotation(num, customUnit);
  };

  const handleExport = async () => {
    setBusy(true);
    try {
      await exportBackup();
    } catch (e) {
      Alert.alert('Export failed', e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = () => {
    Alert.alert(
      'Restore backup?',
      'This replaces all current cards, categories, and settings with the ones from the backup file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              const ok = await importBackup();
              if (ok) {
                Alert.alert('Restored', 'Your backup has been restored. Reopen the app to see it fully refreshed.');
              }
            } catch (e) {
              Alert.alert('Restore failed', e instanceof Error ? e.message : 'Could not read that file.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={[styles.header, { color: theme.textColor }]}>Settings</Text>

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Theme</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 8 }}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {THEMES.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setThemeId(t.id)}
              style={[
                styles.themeSwatch,
                {
                  backgroundColor: t.cardBackground,
                  borderColor: settings.themeId === t.id ? t.accent : t.cardBorder,
                  borderWidth: settings.themeId === t.id ? 3 : 1,
                },
              ]}
            >
              <View style={[styles.swatchDot, { backgroundColor: t.accent }]} />
              <Text style={{ color: t.textColor, fontSize: 12, marginTop: 6, fontWeight: '600' }}>{t.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Rotation schedule</Text>
        <Text style={[styles.mutedText, { color: theme.subTextColor }]}>
          How often the lock screen card and your home screen widget move to the next card.
        </Text>
        <View style={styles.presetsRow}>
          {PRESETS.map((p) => {
            const active = settings.rotationValue === p.value && settings.rotationUnit === p.unit;
            return (
              <TouchableOpacity
                key={p.label}
                onPress={() => setRotation(p.value, p.unit)}
                style={[
                  styles.presetChip,
                  { borderColor: theme.accent, backgroundColor: active ? theme.accent : 'transparent' },
                ]}
              >
                <Text style={{ color: active ? '#fff' : theme.accent, fontSize: 13, fontWeight: '600' }}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.customRow}>
          <TextInput
            style={[styles.customInput, { borderColor: theme.cardBorder, color: theme.textColor }]}
            keyboardType="number-pad"
            value={customValue}
            onChangeText={setCustomValue}
          />
          <View style={styles.unitRow}>
            {(['minutes', 'hours', 'days'] as RotationUnit[]).map((u) => (
              <TouchableOpacity
                key={u}
                onPress={() => setCustomUnit(u)}
                style={[
                  styles.unitChip,
                  { borderColor: theme.accent, backgroundColor: customUnit === u ? theme.accent : 'transparent' },
                ]}
              >
                <Text style={{ color: customUnit === u ? '#fff' : theme.accent, fontSize: 12 }}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[styles.applyButton, { backgroundColor: theme.accent }]} onPress={applyCustom}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Set</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.currentValue, { color: theme.subTextColor }]}>
          Current: every {settings.rotationValue} {settings.rotationUnit}
        </Text>

        <View style={styles.switchRow}>
          <Text style={{ color: theme.textColor, fontSize: 15 }}>Shuffle cards</Text>
          <Switch value={settings.shuffle} onValueChange={setShuffle} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Widget preview</Text>
        <Text style={[styles.mutedText, { color: theme.subTextColor }]}>
          What your widget looks like at different sizes, in your current theme. The size itself is chosen by
          you when you add the widget (long-press your Home Screen → Widgets, or customize your Lock Screen on
          iOS) — this is a preview to help you decide, not a setting.
        </Text>
        <WidgetPreviewDemo theme={theme} layout={settings.widgetLayout} sample={previewSample} />
        <View style={styles.presetsRow}>
          {(['detailed', 'compact'] as WidgetLayout[]).map((l) => {
            const active = settings.widgetLayout === l;
            return (
              <TouchableOpacity
                key={l}
                onPress={() => setWidgetLayout(l)}
                style={[
                  styles.presetChip,
                  { borderColor: theme.accent, backgroundColor: active ? theme.accent : 'transparent' },
                ]}
              >
                <Text style={{ color: active ? '#fff' : theme.accent, fontSize: 13, fontWeight: '600' }}>
                  {l === 'detailed' ? 'Detailed' : 'Compact'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Text style={[styles.mutedText, { color: theme.subTextColor, marginTop: 8 }]}>
          Detailed shows the category and both sides of the card where there's room. Compact always shows just
          the front, larger — better for small widgets or a quick glance.
        </Text>

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Lock screen</Text>
        <Text style={[styles.mutedText, { color: theme.subTextColor }]}>
          {Platform.OS === 'android'
            ? 'Android does not support resizable lock-screen widgets, so this shows your card as a lock-screen notification instead. Make sure your device shows full notification content on the lock screen (Settings → Notifications → "Show all notification content").'
            : 'On iOS, add a real Lock Screen widget from your Lock Screen\'s customize menu once this app has been built with the iOS widget included (see the README\'s "iOS builds" section).'}
        </Text>
        <View style={styles.switchRow}>
          <Text style={{ color: theme.textColor, fontSize: 15 }}>Show cards on lock screen</Text>
          <Switch value={settings.lockScreenEnabled} onValueChange={setLockScreenEnabled} />
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Backup</Text>
        <TouchableOpacity disabled={busy} style={[styles.button, { backgroundColor: theme.accent }]} onPress={handleExport}>
          <Text style={styles.buttonText}>Export backup</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={busy}
          style={[styles.button, styles.outlineButton, { borderColor: theme.accent }]}
          onPress={handleImport}
        >
          <Text style={[styles.buttonText, { color: theme.accent }]}>Restore from backup</Text>
        </TouchableOpacity>

        <Text style={[styles.note, { color: theme.subTextColor }]}>
          Everything is stored only on this device. There's no account, and nothing is uploaded anywhere unless you
          export a backup file yourself.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 28, fontWeight: '700', margin: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginHorizontal: 20, marginTop: 20, marginBottom: 6 },
  mutedText: { marginHorizontal: 20, fontSize: 13, marginBottom: 10, lineHeight: 18 },
  themeSwatch: { width: 90, height: 90, borderRadius: 16, marginRight: 12, alignItems: 'center', justifyContent: 'center' },
  swatchDot: { width: 24, height: 24, borderRadius: 12 },
  presetsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 20 },
  presetChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  customRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginTop: 12, flexWrap: 'wrap' },
  customInput: { width: 60, borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15 },
  unitRow: { flexDirection: 'row', gap: 6 },
  unitChip: { paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5 },
  applyButton: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  currentValue: { marginHorizontal: 20, marginTop: 10, fontSize: 13 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 20, marginTop: 16 },
  button: { marginHorizontal: 20, marginTop: 12, paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
  outlineButton: { backgroundColor: 'transparent', borderWidth: 1.5 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  note: { marginHorizontal: 20, marginTop: 24, fontSize: 12, lineHeight: 18 },
});

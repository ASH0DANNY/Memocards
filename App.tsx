import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import StudyScreen from './src/screens/StudyScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// How notifications behave while the app is open in the foreground.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

type Tab = 'study' | 'library' | 'settings';

const TAB_LABELS: Record<Tab, string> = {
  study: 'Study',
  library: 'Library',
  settings: 'Settings',
};

function Root() {
  const { theme, loaded } = useAppTheme();
  const [tab, setTab] = useState<Tab>('study');

  if (!loaded) {
    return <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="auto" />

      {tab === 'study' && <StudyScreen />}
      {tab === 'library' && <LibraryScreen />}
      {tab === 'settings' && <SettingsScreen />}

      <SafeAreaView
        style={[styles.tabBar, { borderTopColor: theme.cardBorder, backgroundColor: theme.cardBackground }]}
      >
        {(Object.keys(TAB_LABELS) as Tab[]).map((t) => (
          <TouchableOpacity key={t} style={styles.tabButton} onPress={() => setTab(t)}>
            <Text
              style={{
                color: tab === t ? theme.accent : theme.subTextColor,
                fontWeight: tab === t ? '700' : '500',
              }}
            >
              {TAB_LABELS[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </SafeAreaView>
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  tabButton: { flex: 1, alignItems: 'center', paddingVertical: 8 },
});

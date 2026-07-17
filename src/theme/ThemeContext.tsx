import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { RotationUnit, Settings } from '../types';
import { DEFAULT_SETTINGS, getSettings, saveSettings } from '../storage/storageService';
import { refreshAllSurfaces } from '../widgets/syncAll';
import { getTheme, Theme } from './themes';

type ThemeContextValue = {
  theme: Theme;
  settings: Settings;
  loaded: boolean;
  setThemeId: (id: string) => Promise<void>;
  setRotation: (value: number, unit: RotationUnit) => Promise<void>;
  setShuffle: (shuffle: boolean) => Promise<void>;
  setLockScreenEnabled: (enabled: boolean) => Promise<void>;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await getSettings();
      setSettings(stored);
      setLoaded(true);
      refreshAllSurfaces();
    })();
  }, []);

  const persist = useCallback(async (next: Settings) => {
    setSettings(next);
    await saveSettings(next);
  }, []);

  const setThemeId = useCallback(
    async (id: string) => {
      await persist({ ...settings, themeId: id });
    },
    [settings, persist]
  );

  const setRotation = useCallback(
    async (value: number, unit: RotationUnit) => {
      const next = { ...settings, rotationValue: value, rotationUnit: unit };
      await persist(next);
      refreshAllSurfaces();
    },
    [settings, persist]
  );

  const setShuffle = useCallback(
    async (shuffle: boolean) => {
      const next = { ...settings, shuffle };
      await persist(next);
      refreshAllSurfaces();
    },
    [settings, persist]
  );

  const setLockScreenEnabled = useCallback(
    async (enabled: boolean) => {
      const next = { ...settings, lockScreenEnabled: enabled };
      await persist(next);
      await refreshAllSurfaces();
    },
    [settings, persist]
  );

  const theme = getTheme(settings.themeId);

  return (
    <ThemeContext.Provider
      value={{ theme, settings, loaded, setThemeId, setRotation, setShuffle, setLockScreenEnabled }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useAppTheme must be used within a ThemeProvider');
  return ctx;
}

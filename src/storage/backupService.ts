import { File, Paths } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import {
  getCards,
  getCategories,
  getSettings,
  saveCards,
  saveCategories,
  saveSettings,
} from './storageService';
import { BackupPayload } from '../types';

const APP_VERSION = '1.0.0';

export async function exportBackup(): Promise<void> {
  const [cards, categories, settings] = await Promise.all([getCards(), getCategories(), getSettings()]);

  const payload: BackupPayload = {
    cards,
    categories,
    settings,
    exportedAt: new Date().toISOString(),
    appVersion: APP_VERSION,
  };

  const json = JSON.stringify(payload, null, 2);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = new File(Paths.cache, `memocards-backup-${stamp}.json`);

  file.create();
  file.write(json);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/json',
      dialogTitle: 'Save your MemoCards backup',
    });
  }
}

export async function importBackup(): Promise<boolean> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: ['application/json', '*/*'],
    copyToCacheDirectory: true,
  });

  if (picked.canceled || !picked.assets?.[0]) return false;

  const file = new File(picked.assets[0].uri);
  const content = await file.text();
  const data = JSON.parse(content) as Partial<BackupPayload>;

  if (!Array.isArray(data.cards) || !Array.isArray(data.categories)) {
    throw new Error('This file is not a valid MemoCards backup.');
  }

  await saveCategories(data.categories);
  await saveCards(data.cards);
  if (data.settings) {
    await saveSettings(data.settings);
  }

  return true;
}

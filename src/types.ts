export type Card = {
  id: string;
  categoryId: string;
  front: string;
  back: string;
  tags?: string[];
  createdAt: number;
};

export type Category = {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
};

export type RotationUnit = 'minutes' | 'hours' | 'days';
export type WidgetLayout = 'compact' | 'detailed';

export type Settings = {
  themeId: string;
  rotationValue: number;
  rotationUnit: RotationUnit;
  shuffle: boolean;
  lockScreenEnabled: boolean;
  widgetLayout: WidgetLayout;
};

export type BackupPayload = {
  cards: Card[];
  categories: Category[];
  settings: Settings;
  exportedAt: string;
  appVersion: string;
};

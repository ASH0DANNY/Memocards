import { registerWidgetTaskHandler } from 'react-native-android-widget';
import { widgetTaskHandler } from '../../widget-task-handler';

export function registerAndroidWidgetHandler(): void {
  registerWidgetTaskHandler(widgetTaskHandler);
}

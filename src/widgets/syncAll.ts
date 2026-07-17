import { refreshLockScreenSchedule } from '../notifications/lockScreenService';
import { syncIOSWidget } from './iosWidgetSync';
import { syncAndroidWidget } from './androidWidgetSync';

/**
 * Call this any time cards, categories, or rotation-related settings change.
 * Each individual sync function no-ops on the wrong platform and swallows
 * its own errors (logged, not thrown) so one failing surface never blocks
 * the others.
 */
export async function refreshAllSurfaces(): Promise<void> {
  await Promise.all([
    refreshLockScreenSchedule().catch((e) => console.warn('[widgets] lock screen refresh failed', e)),
    syncIOSWidget().catch((e) => console.warn('[widgets] iOS widget sync failed', e)),
    syncAndroidWidget().catch((e) => console.warn('[widgets] Android widget sync failed', e)),
  ]);
}

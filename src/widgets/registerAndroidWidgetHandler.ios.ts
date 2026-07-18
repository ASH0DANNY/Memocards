// iOS stub. index.ts imports this unconditionally at startup — Metro's
// ".android.ts"/".ios.ts" file convention makes sure *this* file (not the
// real one) is the one bundled for iOS, so the react-native-android-widget
// import in the real implementation never enters the iOS bundle graph at
// all, the same reasoning as iosWidgetSync.android.ts's stub.
export function registerAndroidWidgetHandler(): void {
  // no-op on iOS
}

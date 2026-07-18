// Android stub. iOS widgets rely on @expo/ui/swift-ui, which has no Android
// build at all — importing FlashCardWidget.ios.tsx (even just to no-op at
// runtime via a Platform.OS check) still makes Metro try to statically
// resolve that import for the Android bundle and fail, since Metro bundles
// the whole reachable import graph regardless of runtime platform checks.
// This stub file — picked automatically by Metro's ".android.ts" convention
// instead of "iosWidgetSync.ios.ts" when bundling for Android — keeps that
// import out of the Android graph entirely.
export async function syncIOSWidget(): Promise<void> {
  // no-op on Android
}

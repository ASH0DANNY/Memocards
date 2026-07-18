import { registerRootComponent } from 'expo';
import { registerAndroidWidgetHandler } from './src/widgets/registerAndroidWidgetHandler';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and works the same whether the app is loaded in a development build or a
// production build.
registerRootComponent(App);

// Lets Android call back into JS to render the widget when it's added,
// resized, or due for an update. This is a platform-resolved wrapper (see
// src/widgets/registerAndroidWidgetHandler.*.ts) rather than importing
// react-native-android-widget directly here — Metro bundles every reachable
// import regardless of runtime Platform.OS checks, so an unconditional
// direct import of an Android-only library would break iOS builds the same
// way importing the iOS-only widget did on Android (see
// src/widgets/iosWidgetSync.*.ts for that fix).
registerAndroidWidgetHandler();

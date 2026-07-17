import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';
import App from './App';
import { widgetTaskHandler } from './widget-task-handler';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App)
// and works the same whether the app is loaded in a development build or a
// production build.
registerRootComponent(App);

// Lets Android call back into JS to render the widget when it's added,
// resized, or due for an update.
registerWidgetTaskHandler(widgetTaskHandler);

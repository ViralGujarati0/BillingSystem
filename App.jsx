import 'react-native-gesture-handler';
import React from 'react';
import { Provider as JotaiProvider } from 'jotai';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => (
  <JotaiProvider>
    <AppNavigator />
  </JotaiProvider>
);
export default App;
import { navigationRef } from '../navigation/AppNavigator';

/* Reset navigation stack */

export const resetTo = (name, params = {}) => {
  if (!navigationRef.isReady()) return;

  navigationRef.reset({
    index: 0,
    routes: [{ name, params }],
  });
};

/* Navigate */

export const navigateTo = (name, params = {}) => {
  if (!navigationRef.isReady()) return;

  navigationRef.navigate(name, params);
};

/* Go back */

export const goBack = () => {
  if (!navigationRef.isReady()) return;

  navigationRef.goBack();
};
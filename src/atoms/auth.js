import { atom } from 'jotai';

/** Auth loading (sign in / sign out in progress). */
export const authLoadingAtom = atom(false);

/** Auth error message (e.g. from sign in failure). */
export const authErrorAtom = atom(null);

/** App is resolving auth state on startup. */
export const appInitializingAtom = atom(true);

/** Initial route after auth check (Login | CreateShop | OwnerTabs | StaffHome). */
export const appInitialRouteAtom = atom('Login');

/** Initial params for the initial route (e.g. { userDoc }). */
export const appInitialParamsAtom = atom(undefined);

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { useSetAtom, useAtomValue } from 'jotai';
import { authLoadingAtom, authErrorAtom } from '../atoms/auth';
import { createOrUpdateOwnerUser, getUser } from '../services/firestore';

GoogleSignin.configure({
  webClientId: '365406749603-3ulea8cc0psm28s1dmp55vektg41rs04.apps.googleusercontent.com', // Web client ID for Google Sign-In
});

const useAuthViewModel = () => {
  const setLoading = useSetAtom(authLoadingAtom);
  const setError = useSetAtom(authErrorAtom);
  const loading = useAtomValue(authLoadingAtom);
  const error = useAtomValue(authErrorAtom);

  /** Owner: sign in with Google → create/update owner user doc in Firestore */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await GoogleSignin.hasPlayServices();
  
      // ✅ Force fresh sign-in — prevents stale cached token after logout
      try { await GoogleSignin.signOut(); } catch (_) {}
  
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult?.data?.idToken ?? signInResult?.idToken;
      if (!idToken) throw new Error('No ID token received');
      
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);
      const userDoc = await createOrUpdateOwnerUser(userCredential.user);
      return { firebaseUser: userCredential.user, userDoc };
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /** Staff: sign in with email/password (credentials set by owner). Returns Firebase user + Firestore user doc. */
  const signInWithEmailPassword = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const userDoc = await getUser(userCredential.user.uid);
      if (!userDoc || userDoc.role !== 'STAFF') {
        await auth().signOut();
        throw new Error('Invalid staff account');
      }
      if (!userDoc.isActive) {
        await auth().signOut();
        throw new Error('Account is deactivated');
      }
      return { firebaseUser: userCredential.user, userDoc };
    } catch (err) {
      setError(err.message);
      console.error('Sign-in error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // const signOut = async () => {
  //   try {
  //     await GoogleSignin.signOut(); // works for owner
  //   } catch (e) {
  //     // staff never used Google → ignore
  //   }
  
  //   await auth().signOut(); // ALWAYS runs
  // };

  const signOut = async () => {
    try { await GoogleSignin.revokeAccess(); } catch (_) {}
    try { await GoogleSignin.signOut(); } catch (_) {}
    await auth().signOut();
  };

  return { loading, error, signInWithGoogle, signInWithEmailPassword, signOut };
};

export default useAuthViewModel;
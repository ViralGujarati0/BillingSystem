import { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { createOrUpdateOwnerUser, getUser } from '../services/firestore';

GoogleSignin.configure({
  webClientId: '365406749603-3ulea8cc0psm28s1dmp55vektg41rs04.apps.googleusercontent.com', // Web client ID for Google Sign-In
});

const useAuthViewModel = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Owner: sign in with Google → create/update owner user doc in Firestore */
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult?.data?.idToken ?? signInResult?.idToken;
      if (!idToken) throw new Error('No ID token received');
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);
      await createOrUpdateOwnerUser(userCredential.user);
      return userCredential.user;
    } catch (err) {
      setError(err.message);
      console.error('Sign-in error:', err);
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

  const signOut = async () => {
    await GoogleSignin.revokeAccess();
    await GoogleSignin.signOut();
    await auth().signOut();
  };

  return { loading, error, signInWithGoogle, signInWithEmailPassword, signOut };
};

export default useAuthViewModel;
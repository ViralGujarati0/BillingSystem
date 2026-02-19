import { useState } from 'react';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { UserModel } from '../models/UserModel';

GoogleSignin.configure({
  webClientId: '29866076156-j3b1h9okscggb3crcha2cekm67vthqvr.apps.googleusercontent.com', // ← must be Web type, not Android
});

const useAuthViewModel = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);

      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();

      // Handle both old and new SDK response shapes
      const idToken = signInResult?.data?.idToken ?? signInResult?.idToken;

      if (!idToken) throw new Error('No ID token received');

      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);

      const userModel = UserModel.fromFirebaseUser(userCredential.user);
      setUser(userModel);
      return userModel;
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
    setUser(null);
  };

  return { user, loading, error, signInWithGoogle, signOut };
};

export default useAuthViewModel;
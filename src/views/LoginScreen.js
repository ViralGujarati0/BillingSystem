import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import useAuthViewModel from '../viewmodels/AuthViewModel';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { loading, error, signInWithGoogle } = useAuthViewModel();

  const handleGoogleSignIn = async () => {
    const user = await signInWithGoogle();
    if (user) {
      navigation.replace('Home', { user });
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />

      {/* Background gradient circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      {/* Logo & Branding */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Text style={styles.logoEmoji}>✦</Text>
        </View>
        <Text style={styles.appName}>Welcome Back</Text>
        <Text style={styles.subtitle}>Sign in to continue your journey</Text>
      </View>

      {/* Illustration area */}
      <View style={styles.illustrationContainer}>
        <View style={styles.illustrationCard}>
          <Text style={styles.illustrationEmoji}>🚀</Text>
          <Text style={styles.illustrationText}>Your personal space awaits</Text>
        </View>
      </View>

      {/* Sign In Section */}
      <View style={styles.signInContainer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.googleButton, loading && styles.googleButtonDisabled]}
          onPress={handleGoogleSignIn}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <View style={styles.googleIconWrapper}>
                <Text style={styles.googleLetter}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.termsText}>
          By signing in, you agree to our{' '}
          <Text style={styles.termsLink}>Terms</Text> &{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#16213e',
    top: -80,
    right: -80,
  },
  circle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0f3460',
    bottom: 100,
    left: -60,
  },
  header: {
    alignItems: 'center',
    zIndex: 1,
  },
  logoContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#e94560',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  logoEmoji: {
    fontSize: 32,
    color: '#fff',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: '#8892b0',
    marginTop: 8,
    letterSpacing: 0.3,
  },
  illustrationContainer: {
    width: '100%',
    alignItems: 'center',
    zIndex: 1,
  },
  illustrationCard: {
    width: width * 0.78,
    backgroundColor: '#16213e',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#0f3460',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  illustrationEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  illustrationText: {
    fontSize: 16,
    color: '#8892b0',
    textAlign: 'center',
    lineHeight: 24,
  },
  signInContainer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 32,
    zIndex: 1,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e94560',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#e94560',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
    marginBottom: 20,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleLetter: {
    fontSize: 16,
    fontWeight: '800',
    color: '#e94560',
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.4,
  },
  errorText: {
    color: '#ff6b6b',
    marginBottom: 12,
    textAlign: 'center',
    fontSize: 13,
  },
  termsText: {
    fontSize: 12,
    color: '#8892b0',
    textAlign: 'center',
  },
  termsLink: {
    color: '#e94560',
    fontWeight: '600',
  },
});

export default LoginScreen;
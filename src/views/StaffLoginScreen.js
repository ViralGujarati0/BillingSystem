// src/screens/StaffLoginScreen.js
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { useAtom } from 'jotai';

import useAuthViewModel from '../viewmodels/AuthViewModel';
import { staffLoginFormAtom } from '../atoms/forms';
import { colors as T } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const wp = (pct) => width  * (pct / 100);
const hp = (pct) => height * (pct / 100);
const sp = (size) => Math.round(size * (width / 375));

// ── Email icon ────────────────────────────────────────────────────────────────
const EmailIcon = () => (
  <Svg viewBox="0 0 24 24" width={sp(18)} height={sp(18)} fill="none">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={T.textSecondary} strokeWidth="1.6" />
    <Path d="M3 8l9 6 9-6" stroke={T.textSecondary} strokeWidth="1.6" strokeLinecap="round" />
  </Svg>
);

// ── Lock icon ─────────────────────────────────────────────────────────────────
const LockIcon = () => (
  <Svg viewBox="0 0 24 24" width={sp(18)} height={sp(18)} fill="none">
    <Rect x="5" y="11" width="14" height="10" rx="2" stroke={T.textSecondary} strokeWidth="1.6" />
    <Path d="M8 11V7a4 4 0 018 0v4" stroke={T.textSecondary} strokeWidth="1.6" strokeLinecap="round" />
    <Circle cx="12" cy="16" r="1.2" fill={T.textSecondary} />
  </Svg>
);

// ── Eye icon ──────────────────────────────────────────────────────────────────
const EyeIcon = ({ off }) => (
  <Svg viewBox="0 0 24 24" width={sp(18)} height={sp(18)} fill="none">
    <Path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z" stroke={T.textSecondary} strokeWidth="1.6" />
    <Circle cx="12" cy="12" r="3" stroke={T.textSecondary} strokeWidth="1.6" />
    {off && <Path d="M3 3l18 18" stroke={T.textSecondary} strokeWidth="1.6" strokeLinecap="round" />}
  </Svg>
);

// ── Shield icon ───────────────────────────────────────────────────────────────
const ShieldIcon = () => (
  <Svg viewBox="0 0 24 24" width={sp(14)} height={sp(14)} fill="none">
    <Path d="M12 2L4 6v6c0 5 4 9 8 10 4-1 8-5 8-10V6l-8-4z" stroke={T.textSecondary} strokeWidth="1.6" strokeLinejoin="round" />
    <Path d="M9 12l2 2 4-4" stroke={T.textSecondary} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);
// ─────────────────────────────────────────────────────────────────────────────

const StaffLoginScreen = ({ navigation }) => {
  const { signInWithEmailPassword, loading, error } = useAuthViewModel();

  // ── YOUR EXACT LOGIC — untouched ─────────────────────
  const [form, setForm] = useAtom(staffLoginFormAtom);

  const handleLogin = async () => {
    await signInWithEmailPassword(form.email, form.password);
    // AppNavigator handles routing
  };
  // ─────────────────────────────────────────────────────

  const [emailFocused, setEmailFocused]       = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPass, setShowPass]               = useState(false);

  const masterFadeRef = useRef(null);
  const heroSlideRef  = useRef(null);
  const cardSlideRef  = useRef(null);
  const orb1Ref       = useRef(null);
  const orb2Ref       = useRef(null);

  if (masterFadeRef.current === null) masterFadeRef.current = new Animated.Value(0);
  if (heroSlideRef.current  === null) heroSlideRef.current  = new Animated.Value(-hp(3));
  if (cardSlideRef.current  === null) cardSlideRef.current  = new Animated.Value(hp(4));
  if (orb1Ref.current       === null) orb1Ref.current       = new Animated.Value(0);
  if (orb2Ref.current       === null) orb2Ref.current       = new Animated.Value(0);

  const masterFade = masterFadeRef.current;
  const heroSlide  = heroSlideRef.current;
  const cardSlide  = cardSlideRef.current;
  const orb1       = orb1Ref.current;
  const orb2       = orb2Ref.current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(masterFade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(heroSlide, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
      ]),
    ]).start();

    const floatLoop = (anim, up, dur) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: up, duration: dur, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0,  duration: dur, useNativeDriver: true }),
        ])
      ).start();

    floatLoop(orb1, -hp(1.5), 4200);
    floatLoop(orb2,  hp(1.2), 5600);
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Animated.View style={[styles.root, { opacity: masterFade }]}>
        <StatusBar barStyle="light-content" backgroundColor={T.primary} />

        {/* ── HERO PANEL ── */}
        <Animated.View style={[styles.hero, { transform: [{ translateY: heroSlide }] }]}>

          {/* Thick outline rings */}
          <Animated.View style={[styles.ring1, { transform: [{ translateY: orb1 }] }]} />
          <Animated.View style={[styles.ring2, { transform: [{ translateY: orb2 }] }]} />
          <Animated.View style={[styles.ring3, { transform: [{ translateY: orb1 }] }]} />

          {/* Left: Title */}
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Staff</Text>
            <Text style={styles.heroTitleAccent}>Sign In</Text>
            <Text style={styles.heroSub}>
              Enter your credentials to{'\n'}access the billing panel.
            </Text>
          </View>

          {/* Right: Staff Access badge */}
          <View style={styles.accessBadge}>
            <Text style={styles.accessBadgeTitle}>Staff Access</Text>
            <Text style={styles.accessBadgeSub}>Secured & Monitored</Text>
          </View>

        </Animated.View>

        {/* ── CONTENT CARD ── */}
        <Animated.View style={[styles.card, { transform: [{ translateY: cardSlide }] }]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.cardScroll}
          >

            {/* Email field */}
            <Text style={styles.fieldLabel}>Email Address</Text>
            <View style={[styles.inputBox, emailFocused && styles.inputBoxFocused]}>
              <View style={styles.inputIconWrap}><EmailIcon /></View>
              <TextInput
                style={styles.input}
                placeholder="staff@yourshop.com"
                placeholderTextColor={T.textSecondary + '88'}
                value={form.email}
                onChangeText={(v) => setForm((prev) => ({ ...prev, email: v }))}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="next"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            {/* Password field */}
            <Text style={[styles.fieldLabel, { marginTop: hp(2.4) }]}>Password</Text>
            <View style={[styles.inputBox, passwordFocused && styles.inputBoxFocused]}>
              <View style={styles.inputIconWrap}><LockIcon /></View>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor={T.textSecondary + '88'}
                value={form.password}
                onChangeText={(v) => setForm((prev) => ({ ...prev, password: v }))}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                onPress={() => setShowPass(p => !p)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.eyeBtn}
              >
                <EyeIcon off={showPass} />
              </TouchableOpacity>
            </View>

            {/* Forgot password */}
            <TouchableOpacity style={styles.forgotRow} activeOpacity={0.7}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            {/* Error */}
            {error ? (
              <View style={styles.errorBox}>
                <View style={styles.errorDot} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In button — amber */}
            <TouchableOpacity
              style={[styles.signInBtn, loading && { opacity: 0.70 }]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.signInText}>
                {loading ? 'Signing in…' : 'Sign In to Dashboard  →'}
              </Text>
            </TouchableOpacity>

            {/* Security note */}
            <View style={styles.secureRow}>
              <ShieldIcon />
              <Text style={styles.secureText}>Secured with end-to-end encryption</Text>
            </View>

            {/* Back link */}
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backText}>← Back to Owner Login</Text>
            </TouchableOpacity>

          </ScrollView>
        </Animated.View>

      </Animated.View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: T.background,
  },

  // ── HERO ──────────────────────────────────────────────
  hero: {
    width: '100%',
    height: hp(40),
    backgroundColor: T.primary,
    borderBottomLeftRadius: wp(8.5),
    borderBottomRightRadius: wp(8.5),
    paddingHorizontal: wp(7),
    paddingTop: hp(6.5),
    paddingBottom: hp(3),
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },

  ring1: {
    position: 'absolute',
    top: -hp(11),
    right: -wp(22),
    width: wp(75),
    height: wp(75),
    borderRadius: wp(37.5),
    borderWidth: wp(8.5),
    borderColor: T.glassPrimary,
    backgroundColor: 'transparent',
  },
  ring2: {
    position: 'absolute',
    top: hp(2.5),
    right: -wp(27),
    width: wp(55),
    height: wp(55),
    borderRadius: wp(27.5),
    borderWidth: wp(7),
    borderColor: T.darkBorder,
    backgroundColor: 'transparent',
  },
  ring3: {
    position: 'absolute',
    bottom: -hp(6),
    right: -wp(10),
    width: wp(37),
    height: wp(37),
    borderRadius: wp(18.5),
    borderWidth: wp(5),
    borderColor: T.glassDark,
    backgroundColor: 'transparent',
  },

  heroLeft: {
    flex: 1,
    paddingRight: wp(3),
  },

  heroTitle: {
    fontSize: sp(46),
    fontWeight: '900',
    color: T.darkText,
    lineHeight: sp(50),
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  heroTitleAccent: {
    fontSize: sp(46),
    fontWeight: '900',
    color: T.accent,
    lineHeight: sp(54),
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  heroSub: {
    marginTop: hp(1.5),
    fontSize: sp(13),
    color: T.darkTextMuted,
    lineHeight: sp(20),
    fontWeight: '400',
  },

  accessBadge: {
    backgroundColor: T.glassWhite,
    borderRadius: wp(3.5),
    borderWidth: 1,
    borderColor: T.glassWhiteThin,
    paddingHorizontal: wp(3.5),
    paddingVertical: hp(1.2),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(14),
    marginRight: wp(4),
  },
  accessBadgeTitle: {
    fontSize: sp(13),
    fontWeight: '700',
    color: T.darkText,
    letterSpacing: 0.3,
  },
  accessBadgeSub: {
    fontSize: sp(10),
    color: T.darkTextMuted,
    marginTop: hp(0.3),
    letterSpacing: 0.2,
  },

  // ── CARD ──────────────────────────────────────────────
  card: {
    flex: 1,
    backgroundColor: T.card,
    marginHorizontal: wp(4.5),
    marginTop: -hp(3),
    borderRadius: wp(6.5),
    shadowColor: T.shadowCard,
    shadowOffset: { width: 0, height: hp(1.2) },
    shadowOpacity: 0.10,
    shadowRadius: wp(7),
    elevation: 12,
    overflow: 'hidden',
  },

  cardScroll: {
    paddingHorizontal: wp(6),
    paddingTop: hp(3.2),
    paddingBottom: hp(4.5),
  },

  fieldLabel: {
    fontSize: sp(14),
    fontWeight: '600',
    color: T.textPrimary,
    marginBottom: hp(1.2),
    letterSpacing: 0.1,
  },

  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.background,
    borderRadius: wp(3.5),
    borderWidth: 1.5,
    borderColor: T.border,
    paddingHorizontal: wp(3.5),
    height: hp(6.5),
  },
  inputBoxFocused: {
    borderColor: T.primary,
    backgroundColor: T.card,
  },

  inputIconWrap: {
    width: wp(7),
    alignItems: 'center',
    marginRight: wp(1.5),
  },

  input: {
    flex: 1,
    fontSize: sp(15),
    color: T.textPrimary,
    fontWeight: '400',
  },

  eyeBtn: {
    paddingLeft: wp(2.5),
  },

  forgotRow: {
    alignItems: 'flex-end',
    marginTop: hp(1.2),
    marginBottom: hp(0.8),
  },
  forgotText: {
    fontSize: sp(13),
    color: T.primary,
    fontWeight: '600',
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.errorBg,
    borderRadius: wp(2.5),
    padding: wp(3),
    marginTop: hp(1),
    marginBottom: hp(0.5),
    borderWidth: 1,
    borderColor: T.errorBorder,
    gap: wp(2),
  },
  errorDot: {
    width: wp(1.5),
    height: wp(1.5),
    borderRadius: wp(0.75),
    backgroundColor: T.danger,
  },
  errorText: {
    color: T.danger,
    fontSize: sp(13),
    fontWeight: '500',
    flex: 1,
  },

  // Amber CTA button
  signInBtn: {
    backgroundColor: T.accent,
    borderRadius: wp(3.5),
    height: hp(7),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hp(2.8),
    shadowColor: T.accent,
    shadowOffset: { width: 0, height: hp(1) },
    shadowOpacity: 0.35,
    shadowRadius: wp(4),
    elevation: 8,
  },
  signInText: {
    color: T.darkText,
    fontSize: sp(16),
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  secureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wp(1.5),
    marginTop: hp(2),
  },
  secureText: {
    fontSize: sp(12),
    color: T.textSecondary,
    fontWeight: '500',
  },

  backBtn: {
    alignItems: 'center',
    paddingTop: hp(2.2),
  },
  backText: {
    fontSize: sp(13),
    color: T.textSecondary,
    fontWeight: '500',
  },
});

export default StaffLoginScreen;
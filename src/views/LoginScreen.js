// src/screens/LoginScreen.js
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

import useAuthViewModel from '../viewmodels/AuthViewModel';
import { colors as T } from '../theme/colors';

const { width, height } = Dimensions.get('window');

const wp = (pct) => width  * (pct / 100);
const hp = (pct) => height * (pct / 100);
const sp = (size) => Math.round(size * (width / 375));

// ── Google "G" SVG logo ───────────────────────────────────────────────────────
const GoogleLogo = () => (
  <View style={{ marginRight: wp(3), width: sp(24), height: sp(24) }}>
    <Svg viewBox="0 0 533.5 544.3" width={sp(24)} height={sp(24)}>
      <Path d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-54.4 82.7v68h87.7c51.5-47.4 81.1-117.4 81.1-200.2z" fill="#4285F4" />
      <Path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.6-55.9 26-92.6 26-71 0-131.2-47.9-152.8-112.3H28.9v70.1c46.2 91.9 140.3 149.9 243.2 149.9z" fill="#34A853" />
      <Path d="M119.3 324.3c-11.4-33.8-11.4-70.4 0-104.2V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.4-70.1z" fill="#FBBC04" />
      <Path d="M272.1 107.7c38.8-.6 76.3 14 104.4 40.8l77.7-77.7C405 24.6 339.7-.8 272.1 0 169.2 0 75.1 58 28.9 150l90.4 70.1c21.5-64.5 81.8-112.4 152.8-112.4z" fill="#EA4335" />
    </Svg>
  </View>
);

// ── Staff icon ────────────────────────────────────────────────────────────────
const StaffIcon = () => (
  <View style={{ marginRight: wp(2.5), width: sp(24), height: sp(24) }}>
    <Svg viewBox="0 0 24 24" width={sp(24)} height={sp(24)} fill="none">
      <Circle cx="9"  cy="7"  r="3.5" stroke={T.accent} strokeWidth="1.7" />
      <Circle cx="16" cy="8"  r="2.8" stroke={T.accent} strokeWidth="1.5" />
      <Path d="M2 20c0-3.8 3.1-6.5 7-6.5s7 2.7 7 6.5" stroke={T.accent} strokeWidth="1.7" strokeLinecap="round" />
      <Path d="M16 13.5c2.8 0 5 1.8 5 4.5" stroke={T.accent} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  </View>
);
// ─────────────────────────────────────────────────────────────────────────────

const LoginScreen = ({ navigation }) => {
  const { loading, error, signInWithGoogle } = useAuthViewModel();

  const masterFadeRef = useRef(null);
  const heroSlideRef  = useRef(null);
  const cardSlideRef  = useRef(null);
  const cardScaleRef  = useRef(null);
  const orb1Ref       = useRef(null);
  const orb2Ref       = useRef(null);

  if (masterFadeRef.current === null) masterFadeRef.current = new Animated.Value(0);
  if (heroSlideRef.current  === null) heroSlideRef.current  = new Animated.Value(-hp(3));
  if (cardSlideRef.current  === null) cardSlideRef.current  = new Animated.Value(hp(4));
  if (cardScaleRef.current  === null) cardScaleRef.current  = new Animated.Value(0.96);
  if (orb1Ref.current       === null) orb1Ref.current       = new Animated.Value(0);
  if (orb2Ref.current       === null) orb2Ref.current       = new Animated.Value(0);

  const masterFade = masterFadeRef.current;
  const heroSlide  = heroSlideRef.current;
  const cardSlide  = cardSlideRef.current;
  const cardScale  = cardScaleRef.current;
  const orb1       = orb1Ref.current;
  const orb2       = orb2Ref.current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(masterFade, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(heroSlide, { toValue: 0, tension: 65, friction: 12, useNativeDriver: true }),
        Animated.spring(cardSlide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
        Animated.spring(cardScale, { toValue: 1, tension: 60, friction: 12, useNativeDriver: true }),
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

  // ── YOUR EXACT LOGIC — untouched ─────────────────────
  const handleOwnerLogin = async () => {
    await signInWithGoogle();
    // DO NOTHING ELSE — AppNavigator will redirect automatically
  };
  // ─────────────────────────────────────────────────────

  return (
    <Animated.View style={[styles.root, { opacity: masterFade }]}>

      {/* ── HERO PANEL ── */}
      <Animated.View style={[styles.hero, { transform: [{ translateY: heroSlide }] }]}>

        {/* Thick outline rings */}
        <Animated.View style={[styles.ring1, { transform: [{ translateY: orb1 }] }]} />
        <Animated.View style={[styles.ring2, { transform: [{ translateY: orb2 }] }]} />
        <Animated.View style={[styles.ring3, { transform: [{ translateY: orb1 }] }]} />

        {/* ● OWNER PORTAL badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeLabel}>OWNER PORTAL</Text>
        </View>

        {/* Headline */}
        <Text style={styles.headline}>
          {'Welcome\nBack, '}
          <Text style={styles.headlineAccent}>Boss.</Text>
        </Text>

        {/* Subtitle */}
        <Text style={styles.subText}>
          {'Manage your shop, staff &\nbilling all in one place.'}
        </Text>

      </Animated.View>

      {/* ── BOTTOM WHITE CARD ── */}
      <Animated.View
        style={[styles.card, { transform: [{ translateY: cardSlide }, { scale: cardScale }] }]}
      >
        <Text style={styles.sectionLabel}>SIGN IN AS OWNER</Text>

        {error ? (
          <View style={styles.errorBox}>
            <View style={styles.errorPill} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Google button */}
        <TouchableOpacity
          style={[styles.googleBtn, loading && { opacity: 0.65 }]}
          onPress={handleOwnerLogin}
          activeOpacity={0.80}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={T.textSecondary} size="small" />
          ) : (
            <View style={styles.btnInner}>
              <GoogleLogo />
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* OR separator */}
        <View style={styles.sepRow}>
          <View style={styles.sepLine} />
          <Text style={styles.sepText}>or</Text>
          <View style={styles.sepLine} />
        </View>

        {/* Staff Login button */}
        <TouchableOpacity
          style={styles.staffBtn}
          onPress={() => navigation.navigate('StaffLogin')}
          activeOpacity={0.80}
        >
          <View style={styles.btnInner}>
            <StaffIcon />
            <Text style={styles.staffBtnText}>Staff Login</Text>
          </View>
        </TouchableOpacity>

      </Animated.View>

    </Animated.View>
  );
};

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: T.background,
    alignItems: 'center',
  },

  // ── HERO ──────────────────────────────────────────────
  hero: {
    width: '100%',
    height: hp(55),
    backgroundColor: T.primary,
    borderBottomLeftRadius: wp(8.5),
    borderBottomRightRadius: wp(8.5),
    paddingHorizontal: wp(7.5),
    paddingTop: hp(7),
    paddingBottom: hp(3.5),
    overflow: 'hidden',
  },

  // Thick outline rings — teal-on-teal with slight green tint
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
    top: hp(3),
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
    bottom: -hp(7),
    right: -wp(15),
    width: wp(37),
    height: wp(37),
    borderRadius: wp(18.5),
    borderWidth: wp(5),
    borderColor: T.glassDark,
    backgroundColor: 'transparent',
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: T.glassDark,
    borderRadius: wp(5.5),
    paddingHorizontal: wp(4),
    paddingVertical: hp(0.9),
    marginBottom: hp(3.2),
    gap: wp(2),
    borderWidth: 1,
    borderColor: T.glassWhiteThin,
  },
  badgeDot: {
    width: wp(2),
    height: wp(2),
    borderRadius: wp(1),
    backgroundColor: T.accent,
  },
  badgeLabel: {
    fontSize: sp(11),
    fontWeight: '700',
    color: T.accent,
    letterSpacing: 2,
  },

  headline: {
    fontSize: sp(52),
    fontWeight: '900',
    color: T.darkText,
    lineHeight: sp(60),
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },
  headlineAccent: {
    color: T.accent,
    fontWeight: '900',
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif' }),
  },

  subText: {
    marginTop: hp(1.6),
    fontSize: sp(15),
    color: T.darkTextMuted,
    lineHeight: sp(23),
    fontWeight: '400',
  },

  // ── CARD ──────────────────────────────────────────────
  card: {
    width: wp(90),
    maxWidth: 420,
    backgroundColor: T.card,
    borderRadius: wp(6.5),
    paddingHorizontal: wp(5.5),
    paddingTop: hp(3.2),
    paddingBottom: hp(3),
    marginTop: -hp(6),
    zIndex: 10,
    shadowColor: T.shadowCard,
    shadowOffset: { width: 0, height: hp(1.2) },
    shadowOpacity: 0.09,
    shadowRadius: wp(6.5),
    elevation: 12,
  },

  sectionLabel: {
    fontSize: sp(11),
    fontWeight: '700',
    color: T.textSecondary,
    letterSpacing: 2.5,
    marginBottom: hp(2.2),
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: T.errorBg,
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(1.8),
    borderWidth: 1,
    borderColor: T.errorBorder,
    gap: wp(2.5),
  },
  errorPill: {
    width: wp(1),
    height: hp(4),
    borderRadius: wp(0.5),
    backgroundColor: T.danger,
  },
  errorText: {
    color: T.danger,
    fontSize: sp(13),
    fontWeight: '500',
    flex: 1,
  },

  // Google button — white card bg, warm border
  googleBtn: {
    backgroundColor: T.background,
    borderRadius: wp(3.5),
    paddingVertical: hp(1.9),
    borderWidth: 1.5,
    borderColor: T.border,
    marginBottom: hp(2.2),
    shadowColor: T.shadowCard,
    shadowOffset: { width: 0, height: hp(0.3) },
    shadowOpacity: 0.05,
    shadowRadius: wp(1.5),
    elevation: 2,
  },

  btnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  googleBtnText: {
    color: T.textPrimary,
    fontSize: sp(15),
    fontWeight: '600',
    letterSpacing: 0.1,
  },

  sepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2.2),
    gap: wp(3.5),
  },
  sepLine: {
    flex: 1,
    height: 1,
    backgroundColor: T.divider,
  },
  sepText: {
    fontSize: sp(13),
    color: T.textSecondary,
    fontWeight: '500',
  },

  // Staff button — accentLight / cream fill
  staffBtn: {
    backgroundColor: T.accentLight,
    borderRadius: wp(3.5),
    paddingVertical: hp(1.9),
    borderWidth: 1,
    borderColor: T.border,
  },
  staffBtnText: {
    color: T.textPrimary,
    fontSize: sp(15),
    fontWeight: '600',
    letterSpacing: 0.1,
  },
});

export default LoginScreen;
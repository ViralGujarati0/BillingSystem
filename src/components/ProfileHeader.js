import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

const AVATAR_SIZE = rs(60);

/**
 * ProfileHeader
 * Props: photoURL, email, role, displayName,
 *        billsCount, staffCount, suppliersCount
 */
const ProfileHeader = ({
  photoURL,
  email,
  role,
  displayName,
  billsCount,
  staffCount,
  suppliersCount,
}) => {

  const initial    = displayName
    ? displayName.trim()[0].toUpperCase()
    : email ? email[0].toUpperCase() : '?';

  const roleLabel  = (role || 'OWNER').toUpperCase();

  return (
    <View style={styles.card}>

      {/* ── Left teal stripe ── */}
      <View style={styles.stripe} />

      <View style={styles.inner}>

        {/* ── Role badge — absolute top-right corner ── */}
        <View style={styles.roleBadge}>
          <View style={styles.roleDot} />
          <Text style={styles.roleBadgeText}>{roleLabel}</Text>
        </View>

        {/* ── Top row: avatar + info ── */}
        <View style={styles.topRow}>

          {/* Avatar — small circle */}
          <View style={styles.avatarWrap}>
            {photoURL ? (
              <Image
                source={{ uri: photoURL }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
            )}
          </View>

          {/* Info — role pill removed from here, now top-right */}
          <View style={styles.infoBlock}>
            {!!displayName && (
              <Text style={styles.displayName} numberOfLines={1}>
                {displayName}
              </Text>
            )}
            <Text
              style={styles.email}
              numberOfLines={2}
              textBreakStrategy="simple"
            >
              {email || '—'}
            </Text>
          </View>

        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Stats row ── */}
        <View style={styles.statsRow}>

          <View style={styles.statCell}>
            <Text style={styles.statValue}>{billsCount ?? '—'}</Text>
            <Text style={styles.statLabel}>BILLS</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCell}>
            <Text style={styles.statValue}>{staffCount ?? '—'}</Text>
            <Text style={styles.statLabel}>STAFF</Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statCell}>
            <Text style={styles.statValue}>{suppliersCount ?? '—'}</Text>
            <Text style={styles.statLabel}>SUPPLIERS</Text>
          </View>

        </View>

      </View>
    </View>
  );
};

export default ProfileHeader;

const styles = StyleSheet.create({

  card: {
    flexDirection: 'row',
    marginHorizontal: rs(16),
    backgroundColor: '#FFFFFF',
    borderRadius: rs(18),
    borderWidth: 1,
    borderColor: colors.borderCard,
    shadowColor: colors.shadowCard,
    shadowOffset: { width: 0, height: rvs(3) },
    shadowOpacity: 1,
    shadowRadius: rs(14),
    elevation: 4,
    overflow: 'hidden',
  },

  // ── Left stripe ───────────────────────────────────────
  stripe: {
    width: rs(4),
    backgroundColor: colors.primary,
    flexShrink: 0,
  },

  inner: {
    flex: 1,
    padding: rs(16),
  },

  // ── Role badge — pinned top-right inside card ─────────
  roleBadge: {
    position: 'absolute',
    top: rs(14),
    right: rs(14),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.14)',
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(4),
    zIndex: 1,
  },

  roleDot: {
    width: rs(6),
    height: rs(6),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  roleBadgeText: {
    fontSize: rfs(10),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.8,
  },

  // ── Top row ───────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
    paddingRight: rs(74), // reserve space so text doesn't slide under badge
  },

  // ── Avatar (compact circle) ─────────────────────────
  avatarWrap: {
    flexShrink: 0,
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(45,74,82,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.10)',
  },

  avatarImage: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
  },

  avatarFallback: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarLetter: {
    fontSize: rfs(22),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  // ── Info block (minWidth: 0 so email uses full row width for wrapping) ──
  infoBlock: {
    flex: 1,
    minWidth: 0,
    gap: rvs(3),
  },

  displayName: {
    fontSize: rfs(20),       // was 15
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  email: {
    fontSize: rfs(15),
    fontWeight: '500',
    color: colors.textSecondary,
    lineHeight: rfs(20),
  },

  // ── Divider ───────────────────────────────────────────
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderCard,
    marginVertical: rvs(14),
  },

  // ── Stats row ─────────────────────────────────────────
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statCell: {
    flex: 1,
    alignItems: 'center',
    gap: rvs(3),
  },

  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: rvs(32),
    backgroundColor: colors.borderCard,
  },

  statValue: {
    fontSize: rfs(21),       // was 18
    fontWeight: '800',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },

  statLabel: {
    fontSize: rfs(9),        // was 8
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.6,
  },

});
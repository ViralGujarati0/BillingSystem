import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * ProfileHeader
 * Props: photoURL, email, role (optional), displayName (optional),
 *        billsCount, staffCount, suppliersCount
 */
const ProfileHeader = ({ photoURL, email, role, displayName, billsCount, staffCount, suppliersCount }) => {

  // ── Derive initials from email or displayName ──
  const initial = displayName
    ? displayName.trim()[0].toUpperCase()
    : email
    ? email[0].toUpperCase()
    : '?';

  return (
    <View style={styles.card}>

      {/* Left teal→amber gradient stripe */}
      <View style={styles.stripe} />

      <View style={styles.inner}>

        {/* ── Top row: avatar + info ── */}
        <View style={styles.topRow}>

          {/* Avatar */}
          <View style={styles.avatarWrap}>
            {photoURL ? (
              <Image source={{ uri: photoURL }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarLetter}>{initial}</Text>
              </View>
            )}
          </View>

          {/* Info block */}
          <View style={styles.infoBlock}>
            {displayName ? (
              <Text style={styles.displayName} numberOfLines={1}>
                {displayName}
              </Text>
            ) : null}
            <Text style={styles.email} numberOfLines={2}>
              {email || '—'}
            </Text>
            <View style={styles.rolePill}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>
                {role || 'OWNER'}
              </Text>
            </View>
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

  // ── Gradient stripe ───────────────────────────────────
  stripe: {
    width: rs(4),
    backgroundColor: colors.primary,
    flexShrink: 0,
  },

  inner: {
    flex: 1,
    padding: rs(16),
  },

  // ── Top row ──────────────────────────────────────────
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(14),
  },

  // ── Avatar ───────────────────────────────────────────
  avatarWrap: {
    flexShrink: 0,
  },

  avatarImage: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(18),
  },

  avatarFallback: {
    width: rs(64),
    height: rs(64),
    borderRadius: rs(18),
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 0.38,
    shadowRadius: rs(10),
    elevation: 4,
  },

  avatarLetter: {
    fontSize: rfs(26),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },

  // ── Info block ────────────────────────────────────────
  infoBlock: {
    flex: 1,
    gap: rvs(0),
  },

  displayName: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: 0.1,
  },

  email: {
    fontSize: rfs(11),
    fontWeight: '500',
    color: colors.textSecondary,
    marginTop: rvs(2),
    lineHeight: rfs(16),
  },

  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(4),
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(45,74,82,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(45,74,82,0.12)',
    borderRadius: rs(20),
    paddingHorizontal: rs(9),
    paddingVertical: rvs(3),
    marginTop: rvs(6),
  },

  roleDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },

  roleText: {
    fontSize: rfs(9),
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.7,
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
    gap: rvs(2),
  },

  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: rvs(28),
    backgroundColor: colors.borderCard,
  },

  statValue: {
    fontSize: rfs(18),
    fontWeight: '800',
    color: colors.textPrimary,
  },

  statLabel: {
    fontSize: rfs(8),
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },

});
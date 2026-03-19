import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ActivityIndicator, Dimensions, Alert, Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { StatusBar } from 'react-native';
import { generateDailyReportPdf } from '../services/generateDailyReportPdf';
import { buildDailyReportHtml }   from '../utils/buildDailyReportHtml';
import { colors } from '../theme/colors';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const scale = SCREEN_W / 390;
const vs    = SCREEN_H / 844;
const rs    = (n) => Math.round(n * scale);
const rvs   = (n) => Math.round(n * vs);
const rfs   = (n) => Math.round(n * Math.min(scale, vs));

/**
 * DailyReportPreviewScreen
 * Navigate to this screen with:
 *   navigation.navigate('DailyReportPreview', { reportData })
 *
 * reportData: {
 *   shopName, shopAddress, periodLabel,
 *   stats, prevStats, topProducts, recentBills,
 *   lowStockItems, dailyData, generatedAt
 * }
 */
const DailyReportPreviewScreen = ({ navigation, route }) => {
  const reportData  = route?.params?.reportData || {};
  const html        = buildDailyReportHtml(reportData);

  const [webLoading,  setWebLoading]  = useState(true);
  const [pdfLoading,  setPdfLoading]  = useState(false);

  const handleDownload = async () => {
    if (pdfLoading) return;
    setPdfLoading(true);
    try {
      await generateDailyReportPdf(reportData);
    } catch (e) {
      console.log('[ReportPDF error]', e?.message);
      if (!String(e?.message).toLowerCase().includes('cancel')) {
        Alert.alert('Error', 'Could not generate PDF. Please try again.');
      }
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* ── Header ── */}
      <LinearGradient
        colors={['#1E3A42', '#2D4A52', '#354E58']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}
        >
          <Icon name="arrow-back" size={rfs(18)} color="#fff" />
        </TouchableOpacity>

        {/* Title */}
        <View style={styles.titleBlock}>
          <View style={styles.accentBar} />
          <View>
            <Text style={styles.title}>Report Preview</Text>
            <View style={styles.pill}>
              <View style={styles.pillDot} />
              <Text style={styles.pillText}>{reportData.periodLabel || 'Today'}</Text>
            </View>
          </View>
        </View>

        {/* Glow border */}
        <View style={styles.glowBorder} />
      </LinearGradient>

      {/* ── WebView ── */}
      <View style={styles.webWrap}>
        {webLoading && (
          <View style={styles.webLoader}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.webLoaderText}>Loading preview…</Text>
          </View>
        )}
        <WebView
          source={{ html }}
          style={styles.webView}
          scrollEnabled
          showsVerticalScrollIndicator={false}
          originWhitelist={['*']}
          onLoadEnd={() => setWebLoading(false)}
          // Scale content to fit mobile screen width
          injectedJavaScript={`
            (function() {
              var meta = document.createElement('meta');
              meta.name = 'viewport';
              meta.content = 'width=794, initial-scale=${(SCREEN_W / 794).toFixed(3)}, maximum-scale=3.0';
              document.getElementsByTagName('head')[0].appendChild(meta);
            })();
            true;
          `}
        />
      </View>

      {/* ── Download button ── */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.downloadBtn, pdfLoading && styles.downloadBtnDisabled]}
          onPress={handleDownload}
          activeOpacity={0.85}
          disabled={pdfLoading}
        >
          {pdfLoading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.downloadText}>Generating PDF…</Text>
            </>
          ) : (
            <>
              <View style={styles.downloadIconWrap}>
                <Icon name="download-outline" size={rfs(16)} color="#fff" />
              </View>
              <Text style={styles.downloadText}>Download PDF</Text>
              <Icon name="share-outline" size={rfs(16)} color="rgba(255,255,255,0.7)" />
            </>
          )}
        </TouchableOpacity>
      </View>

    </View>
  );
};

export default DailyReportPreviewScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // ── Header ───────────────────────────────────────────────
  header: {
    paddingTop: Platform.OS === 'android'
      ? (StatusBar.currentHeight ?? rvs(24)) + rvs(12)
      : rvs(52),
    paddingHorizontal: rs(20),
    paddingBottom: rvs(20),
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(12),
    position: 'relative',
    overflow: 'hidden',
  },
  backBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(10),
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  titleBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(10),
  },
  accentBar: {
    width: rs(3),
    height: rvs(36),
    borderRadius: 2,
    backgroundColor: colors.accent,
    flexShrink: 0,
  },
  title: {
    fontSize: rfs(18),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: rs(5),
    backgroundColor: 'rgba(245,166,35,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(245,166,35,0.30)',
    borderRadius: rs(20),
    paddingHorizontal: rs(10),
    paddingVertical: rvs(2),
    marginTop: rvs(3),
  },
  pillDot: {
    width: rs(5),
    height: rs(5),
    borderRadius: rs(3),
    backgroundColor: colors.accent,
  },
  pillText: {
    fontSize: rfs(10),
    fontWeight: '500',
    color: 'rgba(245,166,35,0.90)',
    letterSpacing: 0.4,
  },
  glowBorder: {
    position: 'absolute',
    bottom: 0,
    left: rs(20),
    right: rs(20),
    height: 1.5,
    backgroundColor: 'rgba(245,166,35,0.22)',
  },

  // ── WebView ──────────────────────────────────────────────
  webWrap: {
    flex: 1,
    backgroundColor: '#F0F4F5',
  },
  webLoader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F4F5',
    zIndex: 10,
    gap: rvs(12),
  },
  webLoaderText: {
    fontSize: rfs(13),
    color: colors.textSecondary,
    fontWeight: '500',
  },
  webView: {
    flex: 1,
    backgroundColor: '#F0F4F5',
  },

  // ── Footer ───────────────────────────────────────────────
  footer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: colors.borderCard,
    paddingHorizontal: rs(16),
    paddingVertical: rvs(14),
    paddingBottom: rvs(Platform.OS === 'ios' ? 28 : 14),
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: rs(10),
    backgroundColor: colors.primary,
    paddingVertical: rvs(15),
    borderRadius: rs(14),
    shadowColor: colors.shadowPrimary,
    shadowOffset: { width: 0, height: rvs(4) },
    shadowOpacity: 1,
    shadowRadius: rs(12),
    elevation: 6,
  },
  downloadBtnDisabled: {
    opacity: 0.7,
  },
  downloadIconWrap: {
    width: rs(28),
    height: rs(28),
    borderRadius: rs(8),
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadText: {
    fontSize: rfs(15),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.2,
  },
});
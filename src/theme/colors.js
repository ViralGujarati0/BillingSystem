// src/theme/colors.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for ALL colors in BillPro.
// Palette: Dark Teal · Orange/Amber · Cream/Peach · Off White · Dark Text
// ─────────────────────────────────────────────────────────────────────────────

export const colors = {

    // ── Brand gradient ────────────────────────────────────
    gradientStart: "#2D4A52",
    gradientEnd:   "#1E3A42",
  
    // ── Light surfaces ────────────────────────────────────
    background: "#F8F8F8",          // Off White page background
    card:       "#FFF3E8",          // Cream/Peach card background
  
    // ── Brand primary (dark teal) ─────────────────────────
    primary:     "#2D4A52",
    primaryDark: "#1E3A42",
  
    // ── Brand accent (orange/amber) ───────────────────────
    accent:      "#F5A623",
    accentLight: "#FFF3E8",
  
    // ── Text ──────────────────────────────────────────────
    textPrimary:   "#1A2B30",       // Dark Text
    textSecondary: "#8A9BA3",       // Muted Gray
    textLight:     "#FFFFFF",
  
    // ── Borders / Dividers ────────────────────────────────
    border:     "#E8DDD4",          // warm-toned border to match cream cards
    borderCard: "rgba(45,74,82,0.10)",
    divider:    "#EDE5DC",
  
    // ── Button / UI states ────────────────────────────────
    staffBtnBg: "rgba(255,243,232,0.70)",   // ghost staff btn fill
  
    // ── Semantic ──────────────────────────────────────────
    success:  "#5B9E6D",
    warning:  "#F5A623",
    danger:   "#D95F5F",
    errorBg:  "rgba(217,95,95,0.08)",
    errorBorder: "rgba(217,95,95,0.20)",
  
    // ── Glass utilities ───────────────────────────────────
    glassWhite:    "rgba(255,255,255,0.30)",
    glassWhiteThin:"rgba(255,255,255,0.12)",
    glassPrimary:  "rgba(45,74,82,0.18)",
    glassDark:     "rgba(0,0,0,0.06)",
  
    // ── Shadow tokens ─────────────────────────────────────
    shadowPrimary: "rgba(26,43,48,0.30)",
    shadowCard:    "rgba(26,43,48,0.12)",
  
    // ── Dark surfaces (headers / calendar panels) ─────────
    darkBg:        "#1E3A42",
    darkSurface:   "#2D4A52",
    darkInput:     "rgba(255,255,255,0.06)",
    darkBorder:    "rgba(255,255,255,0.10)",
    darkText:      "#FFFFFF",
    darkTextMuted: "rgba(255,255,255,0.40)",
    darkTextFaint: "rgba(255,255,255,0.22)",
    darkTextLabel: "rgba(255,255,255,0.40)",
  };
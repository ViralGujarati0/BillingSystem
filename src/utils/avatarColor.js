/**
 * getAvatarColor(name)
 *
 * Returns a deterministic background + text color pair based on the
 * first character of the name. Same name always gives the same color.
 * All colors are picked from / harmonized with the app theme palette.
 */

const AVATAR_PALETTE = [
    { bg: 'rgba(45,74,82,0.90)',   text: '#FFFFFF' }, // teal (primary)
    { bg: 'rgba(245,166,35,0.90)', text: '#FFFFFF' }, // amber (accent)
    { bg: 'rgba(91,158,109,0.90)', text: '#FFFFFF' }, // green
    { bg: 'rgba(64,120,200,0.90)', text: '#FFFFFF' }, // blue
    { bg: 'rgba(120,86,200,0.90)', text: '#FFFFFF' }, // purple
    { bg: 'rgba(224,82,82,0.90)',  text: '#FFFFFF' }, // red
    { bg: 'rgba(26,180,160,0.90)', text: '#FFFFFF' }, // teal-green
    { bg: 'rgba(200,120,64,0.90)', text: '#FFFFFF' }, // orange
  ];
  
  export function getAvatarColor(name) {
    if (!name || typeof name !== 'string') return AVATAR_PALETTE[0];
    const code = name.trim().toUpperCase().charCodeAt(0) || 65;
    return AVATAR_PALETTE[code % AVATAR_PALETTE.length];
  }
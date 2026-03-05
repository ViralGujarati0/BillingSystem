/**
 * Generate barcode variants
 * Helps match barcodes with/without leading zeros
 */
export function barcodeVariants(barcode) {

    const s = String(barcode || '').trim();
  
    if (!s) return [];
  
    const set = new Set([s]);
  
    // Remove leading zeros
    const noLeading = s.replace(/^0+/, '') || s;
  
    set.add(noLeading);
  
    // Pad to 13 digits (EAN format)
    if (s.length <= 13) {
      set.add(s.padStart(13, '0'));
    }
  
    return [...set];
  }
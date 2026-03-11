import Share from 'react-native-share';
import { buildPurchaseHtml } from '../utils/purchaseHtmlBuilder';

/**
 * generatePurchasePdf — generates and shares a purchase invoice PDF.
 * Same pattern as generateBillPdf in pdfService.js.
 */
export async function generatePurchasePdf(data) {
  const { generatePDF } = require('react-native-html-to-pdf');

  const html = buildPurchaseHtml(data);

  // Height: base sections + per-item rows
  // header(80) + meta(90) + table-header(34) + totals(120) + footer(56) = ~380
  // Per item ~34px. Min 500 so single-item invoices don't clip.
  const itemCount = (data?.items || []).length;
  const pdfHeight = Math.max(500, 380 + itemCount * 34);

  const result = await generatePDF({
    html,
    fileName: `Purchase_${data?.invoiceNo || Date.now()}_${Date.now()}`,
    width:    360,
    height:   pdfHeight,
    padding:  0,
    bgColor:  '#f4f6f8',
    base64:   false,
  });

  if (!result?.filePath) {
    throw new Error('PDF could not be created');
  }

  const fileUrl = result.filePath.startsWith('file://')
    ? result.filePath
    : `file://${result.filePath}`;

  await Share.open({
    url:          fileUrl,
    type:         'application/pdf',
    title:        `Purchase_${data?.invoiceNo || 'invoice'}`,
    filename:     `Purchase_${data?.invoiceNo || Date.now()}.pdf`,
    failOnCancel: false,
  });
}
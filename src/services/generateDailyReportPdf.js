import Share from 'react-native-share';
import { buildDailyReportHtml } from '../utils/buildDailyReportHtml';

/**
 * generateDailyReportPdf(data)
 * Same pattern as generateBillPdf in pdfService.js.
 */
export async function generateDailyReportPdf(data) {

  const { generatePDF } = require('react-native-html-to-pdf');

  const html = buildDailyReportHtml(data);

  // A4 at 96dpi = 794×1123px
  const productRows = (data?.topProducts   || []).length;
  const billRows    = (data?.recentBills   || []).length;
  const stockRows   = (data?.lowStockItems || []).length;
  const extraRows   = Math.max(productRows, billRows, stockRows);
  const pdfHeight   = Math.max(1123, 900 + extraRows * 36);

  const result = await generatePDF({
    html,
    fileName: `DailyReport_${Date.now()}`,
    width:    794,
    height:   pdfHeight,
    padding:  0,
    bgColor:  '#F0F4F5',
    base64:   false,
  });

  if (!result?.filePath) {
    throw new Error('PDF could not be created');
  }

  const fileUrl = result.filePath.startsWith('file://')
    ? result.filePath
    : `file://${result.filePath}`;

  const today = new Date();
  const label = `${String(today.getDate()).padStart(2,'0')}_${String(today.getMonth()+1).padStart(2,'0')}_${today.getFullYear()}`;

  await Share.open({
    url:          fileUrl,
    type:         'application/pdf',
    title:        `Daily Report ${label}`,
    filename:     `DailyReport_${label}.pdf`,
    failOnCancel: false,
  });
}
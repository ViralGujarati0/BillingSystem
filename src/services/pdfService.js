import Share from "react-native-share";
import { buildReceiptHtml } from "../utils/receiptHtmlBuilder";

export const generateBillPdf = async (data) => {

  const { generatePDF } = require("react-native-html-to-pdf");

  const html = buildReceiptHtml(data);

  // ── Height: base sections + per-item rows ─────────────────────────────────
  // header(100) + meta(52) + customer(58) + items-header(34)
  // + totals(80) + grand-total(76) + footer(56) + tears(16) = ~472
  // Per item ~34px. Min 600 so single-item bills don't clip.
  const itemCount  = (data.items || []).length;
  const pdfHeight  = Math.max(600, 472 + itemCount * 34);

  const result = await generatePDF({
    html,
    fileName: `Bill_${data.billNo}_${Date.now()}`,
    width:    360,     // ← matches body width exactly
    height:   pdfHeight,
    padding:  0,
    bgColor:  "#DDE3E6",
    base64:   false,
  });

  if (!result?.filePath) {
    throw new Error("PDF could not be created");
  }

  const fileUrl = result.filePath.startsWith("file://")
    ? result.filePath
    : `file://${result.filePath}`;

  await Share.open({
    url:          fileUrl,
    type:         "application/pdf",
    title:        `Bill ${data.billNo}`,
    filename:     `Bill_${data.billNo}.pdf`,
    failOnCancel: false,
  });
};
import Share from "react-native-share";
import { buildReceiptHtml } from "../utils/receiptHtmlBuilder";

export const generateBillPdf = async (data) => {

  const { generatePDF } = require("react-native-html-to-pdf");

  const html = buildReceiptHtml(data);

  const result = await generatePDF({
    html,
    fileName: `bill_${data.billNo}_${Date.now()}`,
    width: 320,
    height: 600,
    padding: 24,
  });

  if (!result?.filePath) {
    throw new Error("PDF could not be created");
  }

  const fileUrl = result.filePath.startsWith("file://")
    ? result.filePath
    : `file://${result.filePath}`;

  await Share.open({
    url: fileUrl,
    type: "application/pdf",
    title: `Bill_${data.billNo}`,
    filename: `Bill_${data.billNo}.pdf`,
  });
};
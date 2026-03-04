import { numberToWords } from "../utils/numberToWords";

export function billItemFromCartItem(cartItem, index) {
  if (!cartItem) return null;

  return {
    no: index + 1,
    type: cartItem.type,
    barcode: cartItem.barcode || "",
    name: cartItem.name || "",
    qty: Number(cartItem.qty) || 0,
    mrp: Number(cartItem.mrp) || Number(cartItem.rate) || 0,
    rate: Number(cartItem.rate) || 0,
    amount: Number(cartItem.amount) || 0,
  };
}

export function createBillSuccessModel({
  shop,
  settings,
  customerName,
  billNo,
  paymentType,
  cartItems,
}) {

  const items = (cartItems || []).map((it, idx) =>
    billItemFromCartItem(it, idx)
  );

  const grandTotal = items.reduce(
    (sum, it) => sum + (it?.amount || 0),
    0
  );

  const totalQty = items.reduce(
    (sum, it) => sum + (it?.qty || 0),
    0
  );

  const totalInWords =
    "Rs. " +
    numberToWords(Math.floor(grandTotal))
      .replace(/^./, (c) => c.toUpperCase()) +
    " only";

  return {
    shopName: shop?.businessName || "Shop",

    shopAddress:
      [shop?.address, shop?.phone]
        .filter(Boolean)
        .join(" • ") || "—",

    customerName: (customerName || "").trim() || "Walk-in",

    billNo: billNo != null ? String(billNo) : "—",

    date: new Date().toLocaleString(),

    paymentType: paymentType || "CASH",

    items,

    grandTotal,

    totalQty,

    totalInWords,

    thankYouMessage:
      settings?.billMessage || "Thank you for shopping!",
  };
}
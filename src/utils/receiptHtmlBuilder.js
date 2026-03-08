/**
 * buildReceiptHtml(data)
 *
 * Phone-width receipt — 360px wide for react-native-html-to-pdf.
 * Handles all Firestore date formats cleanly.
 */
export const buildReceiptHtml = (data) => {
  if (!data) return '';

  // ── Safe number formatter ─────────────────────────────────────────────────
  const num = (v) => { const n = parseFloat(v); return isNaN(n) ? 0 : n; };
  const fmt = (v) => num(v).toFixed(2);

  // ── Auto-compute subtotal if missing/zero ─────────────────────────────────
  const itemsArr = data.items || [];
  const computedSubtotal = itemsArr.reduce((sum, it) => sum + num(it.amount), 0);
  const subtotal   = num(data.subtotal) > 0 ? num(data.subtotal) : computedSubtotal;
  const discount   = num(data.discount ?? 0);
  const grandTotal = num(data.grandTotal) > 0 ? num(data.grandTotal) : (subtotal - discount);
  const totalQty   = data.totalQty ?? itemsArr.reduce((s, it) => s + num(it.qty), 0);
  const itemCount  = itemsArr.length;

  // ── Universal date+time parser ─────────────────────────────────────────────
  // Handles ALL of these:
  //   • Firestore Timestamp object  { toDate() }
  //   • JS Date object
  //   • Locale string  "8/3/2026, 4:56:06 pm"
  //   • ISO string     "2026-03-08T11:26:06Z"
  //   • Formatted      "08 Mar 2026"
  const parseDT = (v) => {
    if (!v) return null;
    // Firestore Timestamp
    if (typeof v === 'object' && typeof v.toDate === 'function') return v.toDate();
    // JS Date
    if (v instanceof Date && !isNaN(v.getTime())) return v;
    // String — try direct parse first (handles locale & ISO)
    if (typeof v === 'string') {
      const d = new Date(v);
      if (!isNaN(d.getTime())) return d;
    }
    return null;
  };

  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const dateObj = parseDT(data.date);
  let dateTimeStr = '';

  if (dateObj) {
    const day  = String(dateObj.getDate()).padStart(2, '0');
    const mon  = MONTHS[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    let   h    = dateObj.getHours();
    const m    = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    // e.g.  "08 Mar 2026  4:56 PM"
    dateTimeStr = `${day} ${mon} ${year}  ${h}:${m} ${ampm}`;
  } else {
    // Absolute fallback — show raw string, strip the seconds part if present
    // "8/3/2026, 4:56:06 pm"  →  "8/3/2026, 4:56 pm"
    const raw = String(data.date || '');
    dateTimeStr = raw.replace(/:\d{2}(\s?(am|pm))/i, '$1').trim();
  }

  // ── Item rows ─────────────────────────────────────────────────────────────
  const rows = itemsArr.map((it, i) => `
    <tr class="${i % 2 === 1 ? 'alt' : ''}">
      <td class="cn">${i + 1}</td>
      <td class="cp">${escHtml(it.name)}</td>
      <td class="cr">${it.qty}</td>
      <td class="cr">&#8377;${fmt(it.mrp)}</td>
      <td class="cr">&#8377;${fmt(it.rate)}</td>
      <td class="ca">&#8377;${fmt(it.amount)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>

* { margin:0; padding:0; box-sizing:border-box; }

body {
  font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
  background: #DDE3E6;
  width: 360px;
  margin: 0 auto;
  padding: 0;
  color: #1A2E33;
  font-size: 12px;
  -webkit-print-color-adjust: exact;
}

.card { width:360px; background:#fff; overflow:hidden; }

/* ════ HEADER ════ */
.hdr {
  background: #1E3A42;
  padding: 24px 20px 20px;
  position: relative; overflow: hidden;
}
.orb {
  position:absolute; top:-38px; right:-38px;
  width:120px; height:120px; border-radius:60px;
  background:rgba(255,255,255,0.05);
}
.badge {
  position:absolute; top:20px; right:20px;
  background:rgba(245,166,35,0.15);
  border:1px solid rgba(245,166,35,0.38);
  border-radius:4px; padding:3px 8px;
  font-size:8px; font-weight:700;
  color:#F5A623; letter-spacing:1.2px;
  text-transform:uppercase;
}
.shop-name {
  font-size:20px; font-weight:800; color:#fff;
  line-height:1.25; padding-right:90px;
  word-break:break-word; white-space:normal;
}
.shop-addr {
  font-size:10px; color:rgba(255,255,255,0.45);
  margin-top:4px; line-height:1.5;
  word-break:break-word;
}
.accent-line {
  width:32px; height:3px; background:#F5A623;
  border-radius:2px; margin-top:10px;
}

/* ════ META ════ */
.meta { background:#F4F6F7; border-bottom:1px solid #E0E7E9; }
.meta table { width:100%; border-collapse:collapse; }
.mc { padding:11px 12px; vertical-align:top; }
.ml {
  font-size:8px; font-weight:700;
  color:#7A9099; letter-spacing:0.8px;
  text-transform:uppercase;
}
/* Bill No — no word break, no wrap */
.mv-billno {
  font-size:11px; font-weight:700; color:#1A2E33;
  margin-top:2px;
  font-family:'Courier New',Courier,monospace;
  white-space:nowrap;       /* never break Bill No */
  overflow:hidden;
  text-overflow:ellipsis;
}
/* Date+Time — allow wrapping on the space between date and time */
.mv-dt {
  font-size:11px; font-weight:700; color:#1A2E33;
  margin-top:2px;
  font-family:'Courier New',Courier,monospace;
  word-break:keep-all;
  line-height:1.5;
}
.mv-plain {
  font-size:12px; font-weight:700; color:#1A2E33;
  margin-top:2px; font-family:inherit;
}

/* ════ CUSTOMER ════ */
.cust { padding:11px 18px; border-bottom:1px solid #E0E7E9; }
.cust table { width:100%; border-collapse:collapse; }
.cust-ico {
  width:32px; height:32px; border-radius:7px;
  background:rgba(30,58,66,0.07);
  border:1px solid #D5E0E3;
  text-align:center; line-height:32px; font-size:14px;
}
.cust-lbl {
  font-size:8px; font-weight:700; color:#7A9099;
  letter-spacing:0.7px; text-transform:uppercase;
}
.cust-name { font-size:13px; font-weight:700; color:#1A2E33; margin-top:1px; }
.paid {
  display:inline-block;
  background:rgba(62,155,92,0.10);
  border:1px solid rgba(62,155,92,0.28);
  border-radius:20px; padding:3px 10px;
  font-size:9px; font-weight:700;
  color:#3E9B5C; white-space:nowrap;
}

/* ════ ITEMS ════ */
.items { padding:0 14px; }
.itbl { width:100%; border-collapse:collapse; }
.itbl col.c0 { width:18px; }
.itbl col.c1 { }
.itbl col.c2 { width:28px; }
.itbl col.c3 { width:54px; }
.itbl col.c4 { width:54px; }
.itbl col.c5 { width:60px; }

.itbl thead tr { border-bottom:2px solid #1E3A42; }
.itbl thead th {
  padding:9px 3px 7px;
  font-size:8px; font-weight:700;
  color:#7A9099; letter-spacing:0.5px;
  text-transform:uppercase; text-align:right;
}
.itbl thead th:nth-child(1),
.itbl thead th:nth-child(2) { text-align:left; }

.itbl tbody tr { border-bottom:1px solid #EDF0F1; }
.itbl tbody tr:last-child { border-bottom:none; }
.alt { background:rgba(244,246,247,0.7); }

.cn {
  padding:9px 3px; font-size:9px; font-weight:600;
  color:#9AAFB5; text-align:left; vertical-align:middle;
}
.cp {
  padding:9px 3px; font-size:11px; font-weight:600;
  color:#1A2E33; vertical-align:middle;
  line-height:1.3; word-break:break-word;
}
.cr {
  padding:9px 3px; font-size:10px; color:#3A5560;
  text-align:right; vertical-align:middle;
  font-family:'Courier New',Courier,monospace; white-space:nowrap;
}
.ca {
  padding:9px 3px; font-size:11px; font-weight:700;
  color:#1A2E33; text-align:right; vertical-align:middle;
  font-family:'Courier New',Courier,monospace; white-space:nowrap;
}

/* ════ TOTALS ════ */
.totals { margin:0 14px; border-top:2px solid #E0E7E9; padding:10px 0 2px; }
.totals table { width:100%; border-collapse:collapse; }
.totals td { padding:3px 0; }
.tl { font-size:11px; color:#7A9099; font-weight:500; }
.tv {
  font-size:11px; font-weight:700; color:#1A2E33;
  text-align:right; font-family:'Courier New',Courier,monospace;
}
.tv.dsc { color:#3E9B5C; }

/* ════ GRAND TOTAL ════ */
.gt {
  margin:12px 14px 0; background:#1E3A42;
  border-radius:10px; padding:14px 16px;
}
.gt table { width:100%; border-collapse:collapse; }
.gt-lbl {
  font-size:8px; font-weight:700;
  color:rgba(255,255,255,0.45);
  letter-spacing:1px; text-transform:uppercase;
}
.gt-words {
  font-size:9px; color:rgba(255,255,255,0.35);
  margin-top:3px; font-style:italic;
  line-height:1.4; max-width:170px;
}
.gt-amt {
  font-size:26px; font-weight:800; color:#F5A623;
  text-align:right; vertical-align:middle;
  font-family:'Courier New',Courier,monospace;
  letter-spacing:-0.5px; white-space:nowrap;
}

/* ════ FOOTER ════ */
.ftr { margin:12px 14px 0; padding:12px 0 18px; border-top:1px dashed #C8D4D7; }
.ftr table { width:100%; border-collapse:collapse; }
.fi { font-size:9px; color:#7A9099; font-weight:500; vertical-align:middle; }
.fi b { color:#1A2E33; font-weight:700; }
.ft { font-size:9px; color:#9AAFB5; font-style:italic; text-align:right; vertical-align:middle; }

/* ════ TEARS ════ */
.tear-t { height:6px; background:#2D4A52; border-bottom:2px dashed rgba(255,255,255,0.18); }
.tear-b { height:8px; background:#F4F6F7; border-top:2px dashed #C8D4D7; }

</style>
</head>
<body>
<div class="card">

  <div class="tear-t"></div>

  <!-- Header -->
  <div class="hdr">
    <div class="orb"></div>
    <div class="badge">Tax Invoice</div>
    <div class="shop-name">${escHtml(data.shopName)}</div>
    <div class="shop-addr">${escHtml(data.shopAddress)}</div>
    <div class="accent-line"></div>
  </div>

  <!-- Meta — 3 columns only: Bill No | Date & Time | Payment -->
  <div class="meta">
    <table>
      <tr>
        <td class="mc" style="width:28%">
          <div class="ml">Bill No</div>
          <div class="mv-billno">${escHtml(data.billNo)}</div>
        </td>
        <td class="mc" style="width:44%">
          <div class="ml">Date &amp; Time</div>
          <div class="mv-dt">${escHtml(dateTimeStr)}</div>
        </td>
        <td class="mc" style="width:28%">
          <div class="ml">Payment</div>
          <div class="mv-plain">${escHtml(data.paymentType)}</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Customer -->
  <div class="cust">
    <table>
      <tr>
        <td style="width:42px;vertical-align:middle;">
          <div class="cust-ico">&#128100;</div>
        </td>
        <td style="vertical-align:middle;">
          <div class="cust-lbl">Customer</div>
          <div class="cust-name">${escHtml(data.customerName)}</div>
        </td>
        <td style="text-align:right;vertical-align:middle;">
          <span class="paid">&#10003;&nbsp;Paid</span>
        </td>
      </tr>
    </table>
  </div>

  <!-- Items -->
  <div class="items">
    <table class="itbl">
      <colgroup>
        <col class="c0"><col class="c1"><col class="c2">
        <col class="c3"><col class="c4"><col class="c5">
      </colgroup>
      <thead>
        <tr>
          <th>#</th><th>Product</th><th>Qty</th>
          <th>MRP</th><th>Rate</th><th>Amt</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  </div>

  <!-- Totals -->
  <div class="totals">
    <table>
      <tr>
        <td class="tl">Subtotal</td>
        <td class="tv">&#8377;${fmt(subtotal)}</td>
      </tr>
      <tr>
        <td class="tl">Discount</td>
        <td class="tv dsc">&#8722;&nbsp;&#8377;${fmt(discount)}</td>
      </tr>
      <tr>
        <td class="tl">Total Qty</td>
        <td class="tv">${totalQty}&nbsp;pcs</td>
      </tr>
    </table>
  </div>

  <!-- Grand total -->
  <div class="gt">
    <table>
      <tr>
        <td style="vertical-align:middle;">
          <div class="gt-lbl">Grand Total</div>
          <div class="gt-words">${escHtml(data.totalInWords)}</div>
        </td>
        <td class="gt-amt">&#8377;${fmt(grandTotal)}</td>
      </tr>
    </table>
  </div>

  <!-- Footer -->
  <div class="ftr">
    <table>
      <tr>
        <td class="fi"><b>${itemCount} item${itemCount !== 1 ? 's' : ''}</b> &middot; <b>${totalQty} pcs</b></td>
        <td class="ft">Thank you for shopping! &#128591;</td>
      </tr>
    </table>
  </div>

  <div class="tear-b"></div>

</div>
</body>
</html>`;
};

// ── HTML escape ──────────────────────────────────────────────────────────────
const escHtml = (str) => {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};
/**
 * buildPurchaseHtml — generates HTML string for purchase invoice PDF.
 * Mirrors the pattern of receiptHtmlBuilder.js used for bills.
 *
 * data shape:
 *   shopName, supplierName, invoiceNo, date,
 *   items: [{ name, qty, purchasePrice, amount }],
 *   subtotal, paidAmount, dueAmount
 */
export function buildPurchaseHtml(data) {
    const rows = (data?.items || [])
      .map(
        (it) => `
        <tr>
          <td>${it.name || '—'}</td>
          <td style="text-align:center">${it.qty}</td>
          <td style="text-align:right">₹${Number(it.purchasePrice || 0).toFixed(2)}</td>
          <td style="text-align:right">₹${Number(it.amount || 0).toFixed(2)}</td>
        </tr>`
      )
      .join('');
  
    const hasDue = Number(data?.dueAmount || 0) > 0;
  
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        background: #f4f6f8;
        padding: 16px;
        font-size: 12px;
        color: #111;
      }
  
      /* ── Card ── */
      .card {
        background: #fff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      }
  
      /* ── Header ── */
      .header {
        background: #2D4A52;
        padding: 20px 20px 16px;
        text-align: center;
      }
      .shop-name {
        font-size: 18px;
        font-weight: 800;
        color: #fff;
        letter-spacing: 0.3px;
      }
      .invoice-label {
        font-size: 11px;
        font-weight: 600;
        color: rgba(255,255,255,0.6);
        margin-top: 4px;
        text-transform: uppercase;
        letter-spacing: 0.8px;
      }
  
      /* ── Meta section ── */
      .meta-section {
        padding: 14px 20px;
        border-bottom: 1px solid #f0f0f0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .meta-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .meta-label {
        font-size: 10px;
        font-weight: 700;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .meta-value {
        font-size: 12px;
        font-weight: 600;
        color: #111;
      }
  
      /* ── Items table ── */
      .table-wrap {
        padding: 0 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 14px 0;
      }
      thead tr {
        border-bottom: 2px solid #f0f0f0;
      }
      th {
        font-size: 10px;
        font-weight: 700;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        padding: 8px 4px;
      }
      td {
        font-size: 12px;
        color: #111;
        padding: 8px 4px;
        border-bottom: 1px solid #f7f7f7;
      }
      tr:last-child td { border-bottom: none; }
  
      /* ── Totals ── */
      .totals {
        padding: 12px 20px;
        border-top: 1px solid #f0f0f0;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .total-row {
        display: flex;
        justify-content: space-between;
      }
      .total-label {
        font-size: 12px;
        font-weight: 600;
        color: #666;
      }
      .total-value {
        font-size: 12px;
        font-weight: 700;
        color: #111;
      }
      .total-due {
        color: ${hasDue ? '#f59e0b' : '#16a34a'};
      }
      .grand-row {
        display: flex;
        justify-content: space-between;
        background: #f7f9fa;
        border-radius: 8px;
        padding: 10px 12px;
        margin-top: 6px;
      }
      .grand-label {
        font-size: 13px;
        font-weight: 700;
        color: #111;
      }
      .grand-value {
        font-size: 15px;
        font-weight: 800;
        color: #2D4A52;
      }
  
      /* ── Footer ── */
      .footer {
        padding: 14px 20px;
        text-align: center;
        border-top: 1px dashed #e0e0e0;
      }
      .footer-text {
        font-size: 11px;
        color: #aaa;
        font-style: italic;
      }
    </style>
  </head>
  <body>
    <div class="card">
  
      <!-- Header -->
      <div class="header">
        <div class="shop-name">${data?.shopName || 'Shop'}</div>
        <div class="invoice-label">Purchase Invoice</div>
      </div>
  
      <!-- Meta -->
      <div class="meta-section">
        <div class="meta-row">
          <span class="meta-label">Supplier</span>
          <span class="meta-value">${data?.supplierName || '—'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Invoice No</span>
          <span class="meta-value">${data?.invoiceNo || '—'}</span>
        </div>
        <div class="meta-row">
          <span class="meta-label">Date</span>
          <span class="meta-value">${data?.date || '—'}</span>
        </div>
      </div>
  
      <!-- Items table -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th style="text-align:left">Product</th>
              <th style="text-align:center">Qty</th>
              <th style="text-align:right">Rate</th>
              <th style="text-align:right">Amt</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
  
      <!-- Totals -->
      <div class="totals">
        <div class="total-row">
          <span class="total-label">Subtotal</span>
          <span class="total-value">₹${Number(data?.subtotal || 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span class="total-label">Paid</span>
          <span class="total-value" style="color:#16a34a">₹${Number(data?.paidAmount || 0).toFixed(2)}</span>
        </div>
        <div class="grand-row">
          <span class="grand-label">Due Amount</span>
          <span class="grand-value total-due">₹${Number(data?.dueAmount || 0).toFixed(2)}</span>
        </div>
      </div>
  
      <!-- Footer -->
      <div class="footer">
        <div class="footer-text">This is a computer generated purchase invoice</div>
      </div>
  
    </div>
  </body>
  </html>`;
  }
/**
 * buildDailyReportHtml(data)
 * A4 professional daily report — 794px wide, full bleed.
 */

const esc = (str) => {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };
  
  const fmtC = (v) => {
    const n = Number(v || 0);
    if (n >= 100000) return '&#8377;' + (n / 100000).toFixed(1) + 'L';
    if (n >= 1000)   return '&#8377;' + (n / 1000).toFixed(1) + 'K';
    return '&#8377;' + n.toFixed(0);
  };
  
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  const formatDate = (d) => {
    const dt = d instanceof Date ? d : new Date(d || Date.now());
    return `${String(dt.getDate()).padStart(2,'0')} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}  ${String(dt.getHours()).padStart(2,'0')}:${String(dt.getMinutes()).padStart(2,'0')}`;
  };
  
  const changePill = (cur, prev) => {
    if (prev == null || prev === 0) return '';
    const c = (((cur - prev) / prev) * 100).toFixed(1);
    const up = parseFloat(c) >= 0;
    return `<span style="background:${up ? 'rgba(91,158,109,0.13)' : 'rgba(217,95,95,0.13)'};
      color:${up ? '#5B9E6D' : '#D95F5F'};border-radius:4px;padding:2px 8px;
      font-size:9px;font-weight:700;margin-left:6px;">${up ? '▲' : '▼'} ${Math.abs(c)}%</span>`;
  };
  
  /* ── Bar chart ─────────────────────────────────────────────────────────────── */
  const buildBars = (dailyData, mode, color, chartW = 680) => {
    if (!dailyData || !dailyData.length) {
      return `<div style="text-align:center;color:#8A9BA3;font-size:11px;padding:20px 0;">No data</div>`;
    }
    const values = dailyData.map(d => Number(d[mode] || 0));
    const maxVal = Math.max(...values, 1);
    const H      = 110;
    const n      = dailyData.length;
    const slot   = Math.floor(chartW / n);
    const barW   = Math.max(8, Math.min(36, slot - 8));
  
    const fmtL = (key) => {
      if (!key || key === 'Today') return 'Today';
      const p = key.replace('daily_', '').split('_');
      if (p.length === 3) {
        const m = ['J','F','M','A','M','J','J','A','S','O','N','D'];
        return `${parseInt(p[2])}/${m[parseInt(p[1])-1]}`;
      }
      return key;
    };
  
    const bars = dailyData.map((d, i) => {
      const val  = Number(d[mode] || 0);
      const barH = Math.max(3, (val / maxVal) * (H - 24));
      const x    = i * slot + Math.floor((slot - barW) / 2);
      const y    = H - 18 - barH;
      const vStr = val >= 1000 ? (val/1000).toFixed(1)+'K' : val.toFixed(0);
      return `
        <rect x="${x}" y="${y}" width="${barW}" height="${barH}"
              fill="${color}" rx="3" opacity="0.88"/>
        <text x="${x + barW/2}" y="${y-3}" text-anchor="middle"
              font-size="7" fill="${color}" font-weight="700">${val > 0 ? vStr : ''}</text>
        <text x="${x + barW/2}" y="${H-3}" text-anchor="middle"
              font-size="7" fill="#8A9BA3">${fmtL(d.key)}</text>`;
    }).join('');
  
    return `<svg viewBox="0 0 ${chartW} ${H}" xmlns="http://www.w3.org/2000/svg"
      style="width:100%;height:${H}px;display:block;">${bars}</svg>`;
  };
  
  /* ── Donut ─────────────────────────────────────────────────────────────────── */
  const buildDonut = (cash, upi, card) => {
    const total = cash + upi + card || 1;
    const R = 48; const CX = 60; const CY = 60; const SW = 16;
    const circ = 2 * Math.PI * R;
    const segs = [
      { val: cash, color: '#2D4A52', label: 'Cash' },
      { val: upi,  color: '#F5A623', label: 'UPI'  },
      { val: card, color: '#5B9E6D', label: 'Card' },
    ];
    let off = 0;
    const arcs = segs.map(s => {
      const dash = (s.val / total) * circ;
      const a = { ...s, dash, off };
      off += dash;
      return a;
    });
    const arcSvg = arcs.map(a =>
      `<circle cx="${CX}" cy="${CY}" r="${R}" fill="none" stroke="${a.color}"
        stroke-width="${SW}" stroke-dasharray="${a.dash} ${circ-a.dash}"
        stroke-dashoffset="${-a.off}" transform="rotate(-90 ${CX} ${CY})"/>`
    ).join('');
    const legend = segs.map((s, i) => {
      const p = total > 1 ? ((s.val/total)*100).toFixed(0) : 0;
      return `
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <div style="width:8px;height:8px;border-radius:4px;background:${s.color};flex-shrink:0;"></div>
          <div>
            <div style="font-size:11px;font-weight:700;color:#1A2B30;">${s.label}</div>
            <div style="font-size:9px;color:#8A9BA3;">${fmtC(s.val)} · ${p}%</div>
          </div>
        </div>`;
    }).join('');
    return `
      <div style="display:flex;align-items:center;gap:20px;">
        <div style="flex-shrink:0;">
          <svg viewBox="0 0 120 120" style="width:120px;height:120px;display:block;">
            <circle cx="${CX}" cy="${CY}" r="${R}" fill="none"
              stroke="#F0F4F5" stroke-width="${SW}"/>
            ${arcSvg}
            <text x="${CX}" y="${CY-5}" text-anchor="middle"
              font-size="10" fill="#1A2B30" font-weight="800">${fmtC(cash+upi+card)}</text>
            <text x="${CX}" y="${CY+8}" text-anchor="middle"
              font-size="8" fill="#8A9BA3">Total</text>
          </svg>
        </div>
        <div style="flex:1;">${legend}</div>
      </div>`;
  };
  
  /* ── Main ──────────────────────────────────────────────────────────────────── */
  export const buildDailyReportHtml = (data = {}) => {
    const {
      shopName      = 'My Shop',
      shopAddress   = '',
      periodLabel   = 'Today',
      stats         = {},
      prevStats     = null,
      topProducts   = [],
      recentBills   = [],
      lowStockItems = [],
      dailyData     = [],
      generatedAt,
    } = data;
  
    const s  = stats;
    const ps = prevStats || {};
    const avgBill = s.totalBills > 0 ? (s.totalSales / s.totalBills) : 0;
  
    /* ── Stat cards ── */
    const statDefs = [
      { label:'Total Revenue',  value:fmtC(s.totalSales),          color:'#2D4A52', cur:s.totalSales,          prev:ps.totalSales          },
      { label:'Total Profit',   value:fmtC(s.totalProfit),         color:'#5B9E6D', cur:s.totalProfit,         prev:ps.totalProfit         },
      { label:'Total Bills',    value:String(s.totalBills||0),     color:'#F5A623', cur:s.totalBills,          prev:ps.totalBills          },
      { label:'Items Sold',     value:String(s.totalItemsSold||0), color:'#7C6AF5', cur:s.totalItemsSold,      prev:ps.totalItemsSold      },
      { label:'Avg Bill Value', value:fmtC(avgBill),               color:'#E07B2A', cur:null,                  prev:null                   },
      { label:'Purchases',      value:fmtC(s.totalPurchaseAmount), color:'#D95F5F', cur:s.totalPurchaseAmount, prev:ps.totalPurchaseAmount },
    ];
  
    const statCards = statDefs.map(c => `
      <div style="background:#fff;border-radius:10px;border:1px solid #E4EAEC;
                  border-left:3px solid ${c.color};padding:14px 16px;
                  width:calc(33.33% - 9px);box-sizing:border-box;">
        <div style="font-size:9px;font-weight:700;color:#8A9BA3;letter-spacing:0.5px;
                    text-transform:uppercase;margin-bottom:6px;">${c.label}</div>
        <div style="font-size:20px;font-weight:800;color:#1A2B30;line-height:1.1;">
          ${c.value}${c.prev != null ? changePill(c.cur, c.prev) : ''}
        </div>
      </div>`).join('');
  
    /* ── Top products ── */
    const maxQty = Math.max(...topProducts.map(p => p.qty), 1);
    const BAR_COLORS = ['#2D4A52','#F5A623','#5B9E6D','#7C6AF5','#E07B2A'];
    const productRows = !topProducts.length
      ? `<tr><td colspan="4" style="text-align:center;color:#8A9BA3;padding:16px;font-size:11px;">No sales data</td></tr>`
      : topProducts.map((p, i) => {
          const bw = Math.round((p.qty / maxQty) * 100);
          const c  = BAR_COLORS[i] || '#2D4A52';
          return `<tr style="border-bottom:1px solid #F0F4F5;">
            <td style="padding:9px 8px;font-size:11px;font-weight:800;color:${c};">#${i+1}</td>
            <td style="padding:9px 8px;">
              <div style="font-size:11px;font-weight:700;color:#1A2B30;">${esc(p.name)}</div>
              <div style="margin-top:3px;background:#F0F4F5;border-radius:3px;height:3px;">
                <div style="background:${c};border-radius:3px;height:3px;width:${bw}%;"></div>
              </div>
            </td>
            <td style="padding:9px 8px;text-align:center;font-size:11px;font-weight:700;color:#1A2B30;">${p.qty}</td>
            <td style="padding:9px 8px;text-align:right;font-size:11px;font-weight:700;color:#1A2B30;">${fmtC(p.revenue)}</td>
          </tr>`;
        }).join('');
  
    /* ── Recent bills ── */
    const ptColor = { CASH:'#2D4A52', UPI:'#F5A623', CARD:'#5B9E6D' };
    const billRows = !recentBills.length
      ? `<tr><td colspan="4" style="text-align:center;color:#8A9BA3;padding:16px;font-size:11px;">No bills</td></tr>`
      : recentBills.map(b => {
          const c = ptColor[b.paymentType] || '#2D4A52';
          return `<tr style="border-bottom:1px solid #F0F4F5;">
            <td style="padding:9px 8px;font-size:10px;font-weight:700;color:#2D4A52;font-family:monospace;">${esc(b.billNoFormatted||'#'+b.billNo)}</td>
            <td style="padding:9px 8px;font-size:11px;color:#1A2B30;">${esc(b.customerName||'Walk-in')}</td>
            <td style="padding:9px 8px;text-align:center;">
              <span style="background:${c}18;color:${c};border-radius:4px;
                           padding:2px 8px;font-size:9px;font-weight:700;">${esc(b.paymentType)}</span>
            </td>
            <td style="padding:9px 8px;text-align:right;font-size:12px;font-weight:800;color:#1A2B30;">${fmtC(b.grandTotal)}</td>
          </tr>`;
        }).join('');
  
    /* ── Low stock ── */
    const stockRows = !lowStockItems.length
      ? `<tr><td colspan="3" style="text-align:center;color:#5B9E6D;padding:16px;font-size:11px;">✓ All items well stocked</td></tr>`
      : lowStockItems.map(item => {
          const stock = item.stock || 0;
          const c = stock === 0 ? '#D95F5F' : stock <= 2 ? '#E07B2A' : '#F5A623';
          return `<tr style="border-bottom:1px solid #F0F4F5;">
            <td style="padding:9px 8px;font-size:11px;font-weight:700;color:#1A2B30;">${esc(item.name||item.barcode||item.id)}</td>
            <td style="padding:9px 8px;font-size:10px;color:#8A9BA3;font-family:monospace;">${esc(item.barcode||item.id)}</td>
            <td style="padding:9px 8px;text-align:right;">
              <span style="background:${c}18;color:${c};border-radius:4px;
                           padding:3px 10px;font-size:9px;font-weight:800;">
                ${stock === 0 ? 'Out of stock' : stock+' left'}
              </span>
            </td>
          </tr>`;
        }).join('');
  
    return `<!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=794">
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      width: 794px;
      min-width: 794px;
      background: #F0F4F5;
      font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      color: #1A2B30;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      width: 794px;
      min-width: 794px;
      padding: 28px;
      background: #F0F4F5;
    }
    .card {
      background: #fff;
      border-radius: 10px;
      border: 1px solid #E4EAEC;
      padding: 18px;
      margin-bottom: 14px;
    }
    .card-title {
      font-size: 12px;
      font-weight: 800;
      color: #1A2B30;
      margin-bottom: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .dot { width:8px;height:8px;border-radius:4px;display:inline-block;flex-shrink:0; }
    .row { display:flex;gap:14px; }
    .col { flex:1; }
    table { width:100%;border-collapse:collapse; }
    th {
      font-size:9px;font-weight:700;color:#8A9BA3;
      letter-spacing:0.5px;text-transform:uppercase;
      padding:8px;border-bottom:2px solid #1E3A42;text-align:left;
    }
    th.r { text-align:right; }
    th.c { text-align:center; }
  </style>
  </head>
  <body>
  <div class="page">
  
    <!-- HEADER -->
    <div style="background:#1E3A42;border-radius:12px;padding:26px 28px;
                margin-bottom:18px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:-40px;right:-40px;width:180px;height:180px;
                  border-radius:90px;background:rgba(255,255,255,0.04);"></div>
      <div style="position:absolute;bottom:-20px;right:120px;width:100px;height:100px;
                  border-radius:50px;background:rgba(245,166,35,0.07);"></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <div>
          <div style="font-size:9px;font-weight:700;color:rgba(255,255,255,0.38);
                      letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;">
            Daily Business Report
          </div>
          <div style="font-size:24px;font-weight:800;color:#fff;line-height:1.2;">
            ${esc(shopName)}
          </div>
          ${shopAddress ? `<div style="font-size:10px;color:rgba(255,255,255,0.4);margin-top:3px;">${esc(shopAddress)}</div>` : ''}
          <div style="width:32px;height:3px;background:#F5A623;border-radius:2px;margin-top:10px;"></div>
        </div>
        <div style="text-align:right;">
          <div style="background:rgba(245,166,35,0.15);border:1px solid rgba(245,166,35,0.32);
                      border-radius:6px;padding:5px 14px;
                      font-size:11px;font-weight:800;color:#F5A623;margin-bottom:6px;
                      display:inline-block;">
            ${esc(periodLabel)}
          </div>
          <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-top:4px;">
            ${formatDate(generatedAt || new Date())}
          </div>
        </div>
      </div>
    </div>
  
    <!-- STAT CARDS -->
    <div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px;">
      ${statCards}
    </div>
  
    <!-- CHARTS ROW -->
    <div class="row">
      <div class="card col" style="margin-bottom:0;flex:2;">
        <div class="card-title">
          <span class="dot" style="background:#2D4A52;"></span>Revenue &amp; Profit Trend
        </div>
        <div style="font-size:9px;font-weight:700;color:#2D4A52;margin-bottom:4px;letter-spacing:0.3px;">REVENUE</div>
        ${buildBars(dailyData, 'sales', '#2D4A52', 420)}
        <div style="font-size:9px;font-weight:700;color:#5B9E6D;margin:10px 0 4px;letter-spacing:0.3px;">PROFIT</div>
        ${buildBars(dailyData, 'profit', '#5B9E6D', 420)}
      </div>
      <div class="card col" style="margin-bottom:0;flex:1;">
        <div class="card-title">
          <span class="dot" style="background:#F5A623;"></span>Payment Split
        </div>
        ${buildDonut(Number(s.cashSales||0), Number(s.upiSales||0), Number(s.cardSales||0))}
        <div style="margin-top:12px;border-top:1px solid #F0F4F5;padding-top:10px;">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="font-size:10px;color:#8A9BA3;">Cash Bills</span>
            <span style="font-size:10px;font-weight:700;color:#1A2B30;">${s.cashBills||0}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;">
            <span style="font-size:10px;color:#8A9BA3;">UPI Bills</span>
            <span style="font-size:10px;font-weight:700;color:#1A2B30;">${s.upiBills||0}</span>
          </div>
          <div style="display:flex;justify-content:space-between;">
            <span style="font-size:10px;color:#8A9BA3;">Card Bills</span>
            <span style="font-size:10px;font-weight:700;color:#1A2B30;">${s.cardBills||0}</span>
          </div>
        </div>
      </div>
    </div>
    <div style="margin-top:14px;"></div>
  
    <!-- PURCHASE BAR -->
    <div class="card">
      <div class="card-title">
        <span class="dot" style="background:#D95F5F;"></span>Purchase Amount Trend
      </div>
      ${buildBars(dailyData, 'purchases', '#D95F5F', 710)}
    </div>
  
    <!-- TOP PRODUCTS + LOW STOCK -->
    <div class="row">
      <div class="card col" style="margin-bottom:0;">
        <div class="card-title">
          <span class="dot" style="background:#7C6AF5;"></span>Top Products
        </div>
        <table>
          <thead><tr>
            <th style="width:24px;">#</th>
            <th>Product</th>
            <th class="c">Qty</th>
            <th class="r">Revenue</th>
          </tr></thead>
          <tbody>${productRows}</tbody>
        </table>
      </div>
      <div class="card col" style="margin-bottom:0;">
        <div class="card-title">
          <span class="dot" style="background:#D95F5F;"></span>Low Stock Alerts
          ${lowStockItems.length > 0
            ? `<span style="background:#D95F5F;color:#fff;border-radius:10px;
                            padding:2px 8px;font-size:9px;font-weight:800;">${lowStockItems.length}</span>`
            : ''}
        </div>
        <table>
          <thead><tr>
            <th>Item</th><th>Barcode</th><th class="r">Stock</th>
          </tr></thead>
          <tbody>${stockRows}</tbody>
        </table>
      </div>
    </div>
    <div style="margin-top:14px;"></div>
  
    <!-- RECENT BILLS -->
    <div class="card">
      <div class="card-title">
        <span class="dot" style="background:#2D4A52;"></span>Recent Bills
      </div>
      <table>
        <thead><tr>
          <th>Bill No</th><th>Customer</th>
          <th class="c">Payment</th><th class="r">Amount</th>
        </tr></thead>
        <tbody>${billRows}</tbody>
      </table>
    </div>
  
    <!-- FOOTER -->
    <div style="text-align:center;padding:14px 0 2px;border-top:1px dashed #C8D4D7;">
      <div style="font-size:10px;color:#8A9BA3;">
        ${esc(shopName)} &middot; ${esc(periodLabel)} Report &middot; ${formatDate(generatedAt||new Date())}
      </div>
      <div style="font-size:9px;color:#B0BFC5;margin-top:3px;">Powered by BillingSystem</div>
    </div>
  
  </div>
  </body>
  </html>`;
  };
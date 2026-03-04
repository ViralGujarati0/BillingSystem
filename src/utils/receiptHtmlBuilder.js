export const buildReceiptHtml = (data) => {
    if (!data) return "";
  
    const rows = (data.items || [])
      .map(
        (it, i) => `
  <tr>
  <td>${i + 1}</td>
  <td>${it.name}</td>
  <td>${it.qty}</td>
  <td>₹${it.mrp}</td>
  <td>₹${it.rate}</td>
  <td>₹${it.amount}</td>
  </tr>`
      )
      .join("");
  
    return `
  <!DOCTYPE html>
  <html>
  <head>
  <meta charset="utf-8">
  <style>
  
  body {
   font-family: sans-serif;
   padding:16px;
   font-size:12px;
  }
  
  table {
   width:100%;
   border-collapse:collapse;
  }
  
  th,td{
   border:1px solid #ddd;
   padding:6px;
  }
  
  .total{
   font-weight:bold;
   margin-top:10px;
  }
  
  .words{
   margin-top:6px;
   font-style:italic;
  }
  
  </style>
  </head>
  
  <body>
  
  <h2>${data.shopName}</h2>
  <p>${data.shopAddress}</p>
  
  <p>Customer: ${data.customerName}</p>
  <p>Bill No: ${data.billNo}</p>
  <p>Date: ${data.date}</p>
  <p>Payment: ${data.paymentType}</p>
  
  <table>
  
  <tr>
  <th>No</th>
  <th>Product</th>
  <th>Qty</th>
  <th>MRP</th>
  <th>Rate</th>
  <th>Amt</th>
  </tr>
  
  ${rows}
  
  </table>
  
  <p class="total">Grand Total: ₹${data.grandTotal}</p>
  
  <p class="words">${data.totalInWords}</p>
  
  <p>Total Items: ${data.totalQty}</p>
  
  </body>
  </html>
  `;
  };
import { EducatorReceiptData } from '../types/eventRegistration';
import { ASSETS } from '../constants/assets';

/**
 * Generates clean, standalone, self-contained HTML for an official YARA receipt.
 * This completely isolates the receipt from any surrounding web page, headers, footers, or modal elements.
 */
export function generateStandaloneReceiptHtml(receipt: EducatorReceiptData): string {
  const isVerified = receipt.payment_status === 'verified' || receipt.approval_status === 'approved';
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YARA Receipt - ${receipt.receipt_number}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background-color: #ffffff;
      padding: 24px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .receipt-box {
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .receipt-box {
        border: none;
        box-shadow: none;
        padding: 12px;
        max-width: 100%;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .logo-container {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-box {
      width: 44px;
      height: 44px;
      background-color: #312e81;
      color: #ffffff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 20px;
      overflow: hidden;
    }
    .logo-box img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .org-name {
      font-size: 13px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
    }
    .sub-org {
      font-size: 10px;
      font-weight: 700;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .org-location {
      font-size: 11px;
      color: #64748b;
      margin-top: 4px;
    }
    .receipt-meta {
      text-align: right;
    }
    .badge-official {
      display: inline-block;
      padding: 4px 10px;
      background-color: #0f172a;
      color: #ffffff;
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-radius: 6px;
    }
    .receipt-num {
      font-family: monospace;
      font-size: 13px;
      font-weight: 900;
      color: #0f172a;
      margin-top: 4px;
    }
    .receipt-date {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .event-banner {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
      color: #ffffff;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .banner-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .badge-stage {
      font-size: 9px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #fbbf24;
      background: rgba(251, 191, 36, 0.2);
      border: 1px solid rgba(251, 191, 36, 0.3);
      padding: 2px 8px;
      border-radius: 4px;
    }
    .badge-status {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      padding: 2px 10px;
      border-radius: 9999px;
      background: ${isVerified ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'};
      color: ${isVerified ? '#6ee7b7' : '#fcd34d'};
      border: 1px solid ${isVerified ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'};
    }
    .event-title {
      font-size: 16px;
      font-weight: 900;
      color: #ffffff;
      margin-bottom: 4px;
    }
    .event-sub {
      font-size: 11px;
      color: #cbd5e1;
    }
    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 20px;
      font-size: 12px;
    }
    .label {
      font-size: 10px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .val-strong {
      font-weight: 900;
      color: #0f172a;
      font-size: 13px;
    }
    .val-text {
      color: #475569;
      font-weight: 500;
    }
    .code-pill {
      display: inline-block;
      padding: 3px 8px;
      background: #ffffff;
      border: 1px solid #c7d2fe;
      color: #312e81;
      font-family: monospace;
      font-weight: 900;
      border-radius: 6px;
      font-size: 12px;
      letter-spacing: 0.05em;
      margin-top: 2px;
    }
    .table-container {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      margin-bottom: 8px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
      font-size: 12px;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 14px;
      text-align: left;
    }
    th.right, td.right {
      text-align: right;
    }
    th.center, td.center {
      text-align: center;
    }
    td {
      padding: 12px 14px;
      border-top: 1px solid #f1f5f9;
      color: #334155;
    }
    .item-desc {
      font-weight: 700;
      color: #0f172a;
    }
    .item-sub {
      font-size: 10px;
      color: #64748b;
    }
    .type-pill {
      font-size: 9px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f1f5f9;
      color: #334155;
    }
    .total-row {
      background-color: #f8fafc;
      border-top: 2px solid #e2e8f0;
      font-weight: 900;
    }
    .total-amount {
      font-size: 15px;
      color: #047857;
      font-weight: 900;
    }
    .verification-card {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background-color: #fffbeb;
      border: 1px solid #fde68a;
      border-radius: 12px;
      padding: 14px;
      margin-bottom: 20px;
      font-size: 11px;
    }
    .status-approved {
      color: #065f46;
      font-weight: 700;
    }
    .footer-grid {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 20px;
      border-top: 1px solid #e2e8f0;
      padding-top: 20px;
      align-items: center;
    }
    .seal-wrap {
      display: flex;
      align-items: center;
    }
    .seal-circle {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      border: 2px dashed #3730a3;
      padding: 3px;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: rotate(-5deg);
    }
    .seal-inner {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eef2ff;
      border: 1px solid #4338ca;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 6.5px;
      font-weight: 800;
      color: #312e81;
      text-transform: uppercase;
      line-height: 1.1;
      text-align: center;
    }
    .seal-verified {
      font-size: 8px;
      font-weight: 900;
      color: #1e1b4b;
      margin: 2px 0;
    }
    .endorsement {
      text-align: right;
    }
    .secretariat-sig {
      font-family: Georgia, serif;
      font-style: italic;
      font-size: 15px;
      font-weight: 700;
      color: #1e293b;
    }
    .sig-line {
      width: 180px;
      margin-left: auto;
      border-top: 1px solid #94a3b8;
      padding-top: 4px;
      margin-top: 4px;
      font-size: 9px;
      font-weight: 700;
      color: #334155;
      text-transform: uppercase;
    }
    .disclaimer {
      font-family: monospace;
      font-size: 8.5px;
      color: #94a3b8;
      margin-top: 8px;
      line-height: 1.3;
    }
  </style>
</head>
<body>
  <div class="receipt-box" id="isolated-receipt">
    <!-- Header -->
    <div class="header">
      <div class="logo-container">
        <div class="logo-box">
          ${ASSETS.LOGO ? `<img src="${ASSETS.LOGO}" alt="YARA">` : 'Y'}
        </div>
        <div>
          <div class="org-name">Young Africans Robotics Association</div>
          <div class="sub-org">Academic & Educator Development Division</div>
          <div class="org-location">Harare • Bulawayo • Sub-Saharan Regional STEM Network</div>
        </div>
      </div>

      <div class="receipt-meta">
        <span class="badge-official">Official Receipt</span>
        <div class="receipt-num">No: ${receipt.receipt_number}</div>
        <div class="receipt-date">Date: <strong>${receipt.issue_date}</strong></div>
      </div>
    </div>

    <!-- Event Banner -->
    <div class="event-banner">
      <div class="banner-top">
        <span class="badge-stage">Live Virtual Training Stage</span>
        <span class="badge-status">${isVerified ? '✓ Payment Verified & Approved' : 'Payment Submitted'}</span>
      </div>
      <div class="event-title">${receipt.event_title}</div>
      <div class="event-sub">Course: 5-Day Practical AI Pedagogy, Classroom Automation & Capstone Certification</div>
    </div>

    <!-- Attendee Details -->
    <div class="details-grid">
      <div>
        <div class="label">Educator / Attendee</div>
        <div class="val-strong">${receipt.attendee_name}</div>
        <div class="val-text">${receipt.role_title || 'Educator / Teacher'}</div>
      </div>
      <div>
        <div class="label">Institution / School</div>
        <div class="val-strong">${receipt.school_institution}</div>
        <div class="val-text">${receipt.province || 'Zimbabwe'}</div>
      </div>
      <div>
        <div class="label">Contact Details</div>
        <div class="val-text">${receipt.email}</div>
        ${receipt.phone ? `<div class="val-text">${receipt.phone}</div>` : ''}
      </div>
      <div>
        <div class="label">Assigned Registration Code</div>
        <div class="code-pill">${receipt.registration_code}</div>
      </div>
    </div>

    <!-- Table Breakdown -->
    <div class="table-container">
      <div class="section-title">Payment Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Item Description</th>
            <th class="center">Type</th>
            <th class="right">Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div class="item-desc">AI for Educators Bootcamp Registration Fee</div>
              <div class="item-sub">Live 5-day interactive training sessions & prompt repository</div>
            </td>
            <td class="center"><span class="type-pill">Standard</span></td>
            <td class="right" style="font-weight: 700;">$${receipt.amount_paid.toFixed(2)}</td>
          </tr>
          ${receipt.continuous_support_opt_in ? `
          <tr>
            <td>
              <div class="item-desc" style="color: #581c87;">Continuous Support & Termly Prompt Drops</div>
              <div class="item-sub">Quarterly masterclasses, ongoing curriculum drops & educator mentorship</div>
            </td>
            <td class="center"><span class="type-pill" style="background: #f3e8ff; color: #6b21a8;">Termly</span></td>
            <td class="right" style="font-weight: 700; color: #581c87;">$${(receipt.support_amount || 15).toFixed(2)}</td>
          </tr>
          ` : ''}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2" class="right" style="text-transform: uppercase; font-size: 11px; font-weight: 900;">Total Amount Paid:</td>
            <td class="right total-amount">$${receipt.total_amount.toFixed(2)} USD</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Verification Info -->
    <div class="verification-card">
      <div>
        <div class="label" style="color: #92400e;">Payment Reference / Txn ID</div>
        <div style="font-family: monospace; font-weight: 900; font-size: 12px; color: #0f172a;">${receipt.payment_reference}</div>
        <div style="font-size: 10px; color: #b45309; margin-top: 2px;">Method: <strong>${receipt.payment_method}</strong></div>
      </div>
      <div>
        <div class="label" style="color: #92400e;">Verification Status</div>
        <div class="status-approved">✓ Approved & Verified by Administration</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">Officer: <strong>${receipt.approved_by_name || 'YARA Executive Secretariat'}</strong></div>
      </div>
    </div>

    <!-- Footer Stamp & Endorsement -->
    <div class="footer-grid">
      <div class="seal-wrap">
        <div class="seal-circle">
          <div class="seal-inner">
            <span>★ YARA SECRETARIAT ★</span>
            <span class="seal-verified">VERIFIED</span>
            <span>ACADEMIC 2026</span>
          </div>
        </div>
      </div>

      <div class="endorsement">
        <div class="secretariat-sig">Executive Academic Secretariat</div>
        <div class="sig-line">YARA Directorate of Education & Outreach</div>
        <div class="disclaimer">
          Receipt generated automatically upon administrative payment verification. Valid for YARA institutional audit and educational proof of enrollment.
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Triggers an isolated print dialog that strictly prints the receipt with zero surrounding page clutter.
 */
export function printReceiptOnly(receipt: EducatorReceiptData): void {
  const htmlContent = generateStandaloneReceiptHtml(receipt);
  
  // Create an invisible iframe to isolate the print job completely from the host page
  let iframe = document.getElementById('yara-receipt-print-frame') as HTMLIFrameElement | null;
  if (iframe) {
    iframe.remove();
  }
  
  iframe = document.createElement('iframe');
  iframe.id = 'yara-receipt-print-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  
  document.body.appendChild(iframe);
  
  const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!frameDoc) {
    // Fallback: Use standard window.print with targeted body classes
    document.body.classList.add('printing-receipt-active');
    window.print();
    setTimeout(() => {
      document.body.classList.remove('printing-receipt-active');
    }, 1000);
    return;
  }
  
  frameDoc.open();
  frameDoc.write(htmlContent);
  frameDoc.close();
  
  // Allow iframe styles and images to complete rendering before printing
  setTimeout(() => {
    try {
      iframe?.contentWindow?.focus();
      iframe?.contentWindow?.print();
    } catch (e) {
      console.warn('Iframe print failed, falling back to window print', e);
      document.body.classList.add('printing-receipt-active');
      window.print();
      setTimeout(() => {
        document.body.classList.remove('printing-receipt-active');
      }, 1000);
    }
  }, 250);
}

/**
 * Directly downloads the standalone receipt HTML file that can be kept offline,
 * emailed, or opened in any browser/PDF viewer with 0 external clutter.
 */
export function downloadReceiptAsHtmlFile(receipt: EducatorReceiptData): void {
  const htmlContent = generateStandaloneReceiptHtml(receipt);
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `YARA_Receipt_${receipt.receipt_number.replace(/[^a-zA-Z0-9_-]/g, '_')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

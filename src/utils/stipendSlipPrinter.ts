import jsPDF from 'jspdf';
import { StipendSlip } from '../types/stipends';
import { YARA_LOGO_BASE64 } from '../constants/yaraLogoBase64';

/**
 * Format currency nicely
 */
function fmt(amount: number | string): string {
  return Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/**
 * Clean printable HTML document for official corporate NPO stipend disbursement payslip
 */
export function generateStipendSlipHtml(slip: StipendSlip): string {
  const gross = Number(slip.gross_amount) || (Number(slip.base_stipend) + Number(slip.allowance_amount) + Number(slip.travel_subsistence_ts));
  const deductions = Number(slip.withholding_deductions) || 0;
  const net = Number(slip.net_amount_received) || (gross - deductions);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YARA Confidential Payslip - ${slip.id}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background-color: #f1f5f9;
      padding: 32px 16px;
      line-height: 1.45;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .payslip-wrapper {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08);
      overflow: hidden;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .payslip-wrapper {
        border: 1px solid #94a3b8;
        box-shadow: none;
        border-radius: 0;
        max-width: 100%;
      }
      @page {
        size: A4 portrait;
        margin: 10mm;
      }
    }
    /* Top Corporate Header */
    .corp-header {
      background: linear-gradient(135deg, #09152e 0%, #112347 100%);
      color: #ffffff;
      padding: 24px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #2563eb;
    }
    .org-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .logo-badge {
      width: 54px;
      height: 54px;
      background: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      border: 2px solid #2563eb;
      padding: 2px;
    }
    .logo-badge img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 50%;
    }
    .org-details h1 {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: #ffffff;
    }
    .org-details p {
      font-size: 11px;
      color: #93c5fd;
      font-weight: 500;
    }
    .doc-type-box {
      text-align: right;
    }
    .doc-title {
      font-size: 18px;
      font-weight: 900;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #ffffff;
    }
    .doc-subtitle {
      font-size: 11px;
      color: #cbd5e1;
      font-weight: 600;
    }
    .confidential-tag {
      display: inline-block;
      margin-top: 4px;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #fca5a5;
      font-size: 9px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 2px 8px;
      border-radius: 4px;
    }

    /* Content Body */
    .slip-body {
      padding: 28px 32px;
    }

    /* Employee & Pay Details Two-Column Bar */
    .employee-panel {
      display: grid;
      grid-template-columns: 1fr 1fr;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      background: #f8fafc;
      margin-bottom: 24px;
      overflow: hidden;
    }
    .panel-col {
      padding: 16px 20px;
    }
    .panel-col:first-child {
      border-right: 1px solid #e2e8f0;
    }
    .panel-col h3 {
      font-size: 10px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    .data-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 6px;
      font-size: 11.5px;
    }
    .data-label {
      color: #64748b;
      font-weight: 500;
    }
    .data-val {
      color: #0f172a;
      font-weight: 700;
      text-align: right;
    }

    /* Corporate Dual-Column Earnings & Deductions Table */
    .accounting-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      margin-bottom: 20px;
      overflow: hidden;
    }
    .acc-col {
      display: flex;
      flex-direction: column;
    }
    .acc-col:first-child {
      border-right: 1px solid #cbd5e1;
    }
    .acc-header {
      background: #f1f5f9;
      padding: 10px 16px;
      border-bottom: 1px solid #cbd5e1;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #1e293b;
      display: flex;
      justify-content: space-between;
    }
    .acc-table {
      width: 100%;
      border-collapse: collapse;
      flex: 1;
    }
    .acc-table tr {
      border-bottom: 1px solid #f1f5f9;
    }
    .acc-table td {
      padding: 9px 16px;
      font-size: 11.5px;
      color: #334155;
    }
    .acc-table td.amount {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
    }
    .acc-subtotal {
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }

    /* Net Pay Highlight Bar */
    .net-pay-banner {
      background: linear-gradient(135deg, #1e1b4b 0%, #312e81 100%);
      color: #ffffff;
      border-radius: 6px;
      padding: 18px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(49, 46, 129, 0.15);
    }
    .net-pay-title {
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: #c7d2fe;
    }
    .net-pay-inwords {
      font-size: 10.5px;
      color: #a5b4fc;
      margin-top: 2px;
      font-style: italic;
    }
    .net-pay-figure {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.02em;
      color: #38bdf8;
    }

    /* Additional Info & NPO Notes */
    .info-footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .notes-box {
      background: #fafaf9;
      border: 1px solid #e7e5e4;
      border-radius: 6px;
      padding: 12px 16px;
      font-size: 10.5px;
      color: #44403c;
    }
    .notes-box strong {
      color: #1c1917;
      display: block;
      margin-bottom: 3px;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.05em;
    }
    .audit-seal-card {
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 12px;
      text-align: center;
      background: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
    .seal-stamp {
      border: 2px solid #2563eb;
      color: #1d4ed8;
      font-weight: 900;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 4px;
    }
    .seal-text {
      font-size: 9px;
      color: #64748b;
      font-weight: 600;
    }

    /* Sign-off & Legal Line */
    .signatures-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
      margin-bottom: 16px;
    }
    .sig-line {
      border-top: 1px solid #475569;
      margin-top: 36px;
      padding-top: 4px;
      display: flex;
      justify-content: space-between;
      font-size: 9.5px;
      color: #64748b;
      font-weight: 600;
    }
    .legal-disclaimer {
      font-size: 9px;
      color: #94a3b8;
      text-align: center;
      line-height: 1.4;
      border-top: 1px solid #f1f5f9;
      padding-top: 12px;
    }
  </style>
</head>
<body>
  <div class="payslip-wrapper">
    <!-- Corporate Header -->
    <div class="corp-header">
      <div class="org-brand">
        <div class="logo-badge">
          <img src="${YARA_LOGO_BASE64}" alt="YARA Official Logo" />
        </div>
        <div class="org-details">
          <h1>Young Africans Robotics Association</h1>
          <p>Non-Profit Organisation • Trust Reg #YARA-NPO-2026-AFR</p>
          <p style="color: #cbd5e1; font-size: 10px; margin-top: 1px;">Harare &amp; Chinhoyi Science Hubs • Directorate of Treasury &amp; Fiscal Compliance</p>
        </div>
      </div>
      <div class="doc-type-box">
        <div class="doc-title">Stipend Slip</div>
        <div class="doc-subtitle">Disbursement Slip #${slip.id}</div>
        <span class="confidential-tag">Private &amp; Confidential</span>
      </div>
    </div>

    <!-- Body -->
    <div class="slip-body">
      <!-- Personnel & Pay Advice Details -->
      <div class="employee-panel">
        <div class="panel-col">
          <h3>Payee / Beneficiary Details</h3>
          <div class="data-row">
            <span class="data-label">Full Name:</span>
            <span class="data-val">${slip.recipient_name}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Staff / Member ID:</span>
            <span class="data-val">${slip.member_id || 'YARA-MEMBER'}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Corporate Designation:</span>
            <span class="data-val" style="text-transform: capitalize;">${slip.recipient_role}</span>
          </div>
          ${slip.recipient_email ? `
          <div class="data-row">
            <span class="data-label">Email Address:</span>
            <span class="data-val">${slip.recipient_email}</span>
          </div>` : ''}
          ${slip.recipient_phone ? `
          <div class="data-row">
            <span class="data-label">Contact Mobile:</span>
            <span class="data-val">${slip.recipient_phone}</span>
          </div>` : ''}
        </div>

        <div class="panel-col">
          <h3>Payment &amp; Audit Reference</h3>
          <div class="data-row">
            <span class="data-label">Disbursement Date:</span>
            <span class="data-val">${slip.disbursement_date}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Payment Channel:</span>
            <span class="data-val" style="text-transform: capitalize;">${slip.payment_method.replace('_', ' ')}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Transaction Reference:</span>
            <span class="data-val" style="font-family: monospace;">${slip.payment_reference}</span>
          </div>
          <div class="data-row">
            <span class="data-label">NPO Cost Allocation:</span>
            <span class="data-val">${slip.budget_category.replace(/_/g, ' ').toUpperCase()}</span>
          </div>
          <div class="data-row">
            <span class="data-label">Payment Status:</span>
            <span class="data-val" style="color: #059669; text-transform: uppercase;">VERIFIED &amp; COMPLETED</span>
          </div>
        </div>
      </div>

      <!-- Accounting Breakdown: Earnings vs Deductions Grid -->
      <div class="accounting-grid">
        <!-- Earnings Column -->
        <div class="acc-col">
          <div class="acc-header">
            <span>Disbursement Earnings &amp; Allowances</span>
            <span>Amount (${slip.currency})</span>
          </div>
          <table class="acc-table">
            <tbody>
              <tr>
                <td>
                  <strong>Basic Honorarium / Base Stipend</strong>
                  <div style="font-size: 10px; color: #64748b;">Instructional modules, session defense &amp; technical duties</div>
                </td>
                <td class="amount">$${fmt(slip.base_stipend)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Session Prep &amp; Staging Allowance</strong>
                  <div style="font-size: 10px; color: #64748b;">Breadboard hardware prep, lesson plans &amp; student follow-up</div>
                </td>
                <td class="amount">$${fmt(slip.allowance_amount)}</td>
              </tr>
              <tr>
                <td>
                  <strong>Travel &amp; Subsistence (T &amp; S)</strong>
                  <div style="font-size: 10px; color: #64748b;">Provincial transit fares, regional transit &amp; meal per diem</div>
                </td>
                <td class="amount">$${fmt(slip.travel_subsistence_ts)}</td>
              </tr>
            </tbody>
          </table>
          <div class="acc-subtotal">
            <span>GROSS EARNINGS</span>
            <span style="color: #2563eb;">$${fmt(gross)}</span>
          </div>
        </div>

        <!-- Deductions Column -->
        <div class="acc-col">
          <div class="acc-header">
            <span>Withholdings &amp; Deductions</span>
            <span>Amount (${slip.currency})</span>
          </div>
          <table class="acc-table">
            <tbody>
              ${deductions > 0 ? `
              <tr>
                <td>
                  <strong>Statutory Admin Withholding</strong>
                  <div style="font-size: 10px; color: #64748b;">Institutional deduction / compliance fee</div>
                </td>
                <td class="amount" style="color: #dc2626;">-$${fmt(deductions)}</td>
              </tr>` : `
              <tr>
                <td colspan="2" style="color: #94a3b8; font-style: italic; padding: 24px 16px; text-align: center;">
                  No statutory withholdings or deductions applicable for this NPO disbursement period.
                </td>
              </tr>`}
            </tbody>
          </table>
          <div class="acc-subtotal">
            <span>TOTAL DEDUCTIONS</span>
            <span style="color: #dc2626;">$${fmt(deductions)}</span>
          </div>
        </div>
      </div>

      <!-- Net Pay Highlight Banner -->
      <div class="net-pay-banner">
        <div>
          <div class="net-pay-title">Net Stipend Received &amp; Reconciled</div>
          <div class="net-pay-inwords">Paid via ${slip.payment_method.replace('_', ' ').toUpperCase()} • Final Amount Deposited</div>
        </div>
        <div class="net-pay-figure">$${fmt(net)} ${slip.currency}</div>
      </div>

      <!-- Additional Memorandum & Audit Seal -->
      <div class="info-footer-grid">
        <div class="notes-box">
          <strong>Disbursement Memorandum / Scope of Work:</strong>
          ${slip.notes || 'Official compensation for technical robotics instruction, mentoring, chapter management, and youth engineering development under YARA statutory NPO programs.'}
        </div>
        <div class="audit-seal-card">
          <div class="seal-stamp">YARA TREASURY SEAL</div>
          <div class="seal-text">Authorized: ${slip.approved_by_admin}</div>
          <div class="seal-text" style="color: #059669; font-weight: 700; margin-top: 2px;">Electronically Audited</div>
        </div>
      </div>

      <!-- Formal Signature Sign-off -->
      <div class="signatures-row">
        <div>
          <div class="sig-line">
            <span>Authorized Officer (YARA Directorate of Finance)</span>
            <span>Date: ${slip.disbursement_date}</span>
          </div>
        </div>
        <div>
          <div class="sig-line">
            <span>Payee Acknowledgement / Electronic Hash</span>
            <span>Ref: ${slip.id}</span>
          </div>
        </div>
      </div>

      <!-- Corporate Legal Disclaimer -->
      <div class="legal-disclaimer">
        This is an official computer-generated stipend slip issued by the Young Africans Robotics Association (YARA). As an accredited non-profit trust, all stipends, allowances, and T&amp;S travel grants adhere to international donor audit standards and statutory transparency guidelines. Retain this payslip for tax filings and proof of remuneration. For inquiries: finance@yara.org.
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a high-quality, corporate enterprise PDF stipend payslip directly in the browser
 */
export function downloadStipendSlipPdf(slip: StipendSlip): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const gross = Number(slip.gross_amount) || (Number(slip.base_stipend) + Number(slip.allowance_amount) + Number(slip.travel_subsistence_ts));
  const deductions = Number(slip.withholding_deductions) || 0;
  const net = Number(slip.net_amount_received) || (gross - deductions);

  // 1. Top Corporate Navy Banner
  doc.setFillColor(9, 21, 46); // deep corporate midnight navy
  doc.rect(0, 0, 210, 38, 'F');

  // Accent Blue Border
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 38, 210, 1.5, 'F');

  // Logo Icon / Official Circular Badge
  try {
    doc.addImage(YARA_LOGO_BASE64, 'PNG', 14, 7, 24, 24);
  } catch (imgErr) {
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(14, 8, 12, 12, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Y', 17.5, 17);
  }

  // Organization Title (Left Block - Clean, Non-overlapping sizing)
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('YOUNG AFRICANS ROBOTICS ASSOCIATION', 42, 14);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(147, 197, 253);
  doc.text('Non-Profit Organisation • Trust Reg #YARA-NPO-2026-AFR', 42, 19.5);
  doc.setTextColor(203, 213, 225);
  doc.setFontSize(7);
  doc.text('Directorate of Treasury & Financial Accountability • Harare Hub', 42, 25);

  // Document Title (Right Block - STIPEND SLIP)
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('STIPEND SLIP', 196, 14, { align: 'right' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(`Slip Reference: ${slip.id}`, 196, 19.5, { align: 'right' });

  // Confidential tag
  doc.setFillColor(239, 68, 68);
  doc.roundedRect(162, 23, 34, 5.5, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PRIVATE & CONFIDENTIAL', 179, 27, { align: 'center' });

  // 2. Payee and Payment Details Two-Column Box
  const panelY = 44;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, panelY, 182, 34, 2, 2, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, panelY, 182, 34, 2, 2, 'D');

  // Divider line
  doc.line(105, panelY, 105, panelY + 34);

  // Left column: Payee Info
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('PAYEE / BENEFICIARY INFORMATION', 18, panelY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Name:', 18, panelY + 12);
  doc.text('Designation:', 18, panelY + 17);
  doc.text('Member ID:', 18, panelY + 22);
  doc.text('Email:', 18, panelY + 27);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(slip.recipient_name, 45, panelY + 12);
  doc.text(slip.recipient_role.toUpperCase(), 45, panelY + 17);
  doc.text(slip.member_id || 'YARA-MEMBER', 45, panelY + 22);
  doc.setFont('helvetica', 'normal');
  doc.text(slip.recipient_email || 'Verified Member', 45, panelY + 27);

  // Right column: Pay Advice Details
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('DISBURSEMENT & AUDIT DETAILS', 110, panelY + 6);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Date of Payment:', 110, panelY + 12);
  doc.text('Payment Channel:', 110, panelY + 17);
  doc.text('Transaction Ref:', 110, panelY + 22);
  doc.text('Cost Allocation:', 110, panelY + 27);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(slip.disbursement_date, 142, panelY + 12);
  doc.text(slip.payment_method.replace('_', ' ').toUpperCase(), 142, panelY + 17);
  doc.setFont('courier', 'bold');
  doc.text(slip.payment_reference, 142, panelY + 22);
  doc.setFont('helvetica', 'bold');
  doc.text(slip.budget_category.replace(/_/g, ' ').toUpperCase(), 142, panelY + 27);

  // 3. Accounting Table (Dual-column: Earnings & Deductions)
  let y = 84;
  
  // Header: Earnings vs Deductions
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 105, 8, 'F');
  doc.rect(119, y, 77, 8, 'F');

  doc.setDrawColor(203, 213, 225);
  doc.rect(14, y, 105, 8, 'D');
  doc.rect(119, y, 77, 8, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('EARNINGS & ALLOWANCES', 18, y + 5.5);
  doc.text(`AMOUNT (${slip.currency})`, 115, y + 5.5, { align: 'right' });

  doc.text('WITHHOLDINGS / DEDUCTIONS', 123, y + 5.5);
  doc.text(`AMOUNT`, 192, y + 5.5, { align: 'right' });

  // Rows
  const earnings = [
    { name: 'Basic Honorarium / Base Stipend', sub: 'Instructional & technical milestones', amount: fmt(slip.base_stipend) },
    { name: 'Session Prep & Lab Allowance', sub: 'Kit staging & student follow-up', amount: fmt(slip.allowance_amount) },
    { name: 'Travel & Subsistence (T & S)', sub: 'Transit fares, regional travel & meals', amount: fmt(slip.travel_subsistence_ts) },
  ];

  y += 8;
  const startRowY = y;
  let currentEarningsY = y;

  earnings.forEach((e) => {
    currentEarningsY += 9;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(e.name, 18, currentEarningsY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(e.sub, 18, currentEarningsY + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`$${e.amount}`, 115, currentEarningsY + 1.5, { align: 'right' });

    doc.setDrawColor(241, 245, 249);
    doc.line(14, currentEarningsY + 5.5, 119, currentEarningsY + 5.5);
  });

  // Deductions side
  let currentDeductY = startRowY + 9;
  if (deductions > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Statutory / Admin Withholding', 123, currentDeductY);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Compliance withholding fee', 123, currentDeductY + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(220, 38, 38);
    doc.text(`-$${fmt(deductions)}`, 192, currentDeductY + 1.5, { align: 'right' });
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No deductions applied for this period.', 123, currentDeductY + 5);
  }

  // Outer bounding box for table
  const tableHeight = 36;
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, startRowY, 105, tableHeight, 'D');
  doc.rect(119, startRowY, 77, tableHeight, 'D');

  // Subtotal Bars
  const subtotalY = startRowY + tableHeight;
  doc.setFillColor(248, 250, 252);
  doc.rect(14, subtotalY, 105, 8, 'F');
  doc.rect(119, subtotalY, 77, 8, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(14, subtotalY, 105, 8, 'D');
  doc.rect(119, subtotalY, 77, 8, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('GROSS EARNINGS:', 18, subtotalY + 5.5);
  doc.setTextColor(37, 99, 235);
  doc.text(`$${fmt(gross)}`, 115, subtotalY + 5.5, { align: 'right' });

  doc.setTextColor(15, 23, 42);
  doc.text('TOTAL DEDUCTIONS:', 123, subtotalY + 5.5);
  doc.setTextColor(220, 38, 38);
  doc.text(`$${fmt(deductions)}`, 192, subtotalY + 5.5, { align: 'right' });

  // 4. Net Pay Big Corporate Banner
  const netY = subtotalY + 14;
  doc.setFillColor(30, 27, 75); // rich royal indigo navy
  doc.roundedRect(14, netY, 182, 18, 2, 2, 'F');

  doc.setTextColor(199, 210, 254);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('NET STIPEND RECEIVED & RECONCILED', 20, netY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(165, 180, 252);
  doc.text(`Credited via ${slip.payment_method.replace('_', ' ').toUpperCase()} • Official YARA NPO Treasury Record`, 20, netY + 13);

  doc.setTextColor(56, 189, 248);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`$${fmt(net)} ${slip.currency}`, 190, netY + 12, { align: 'right' });

  // 5. Memorandum & Seal Section
  const memoY = netY + 24;
  doc.setFillColor(250, 250, 249);
  doc.roundedRect(14, memoY, 120, 22, 2, 2, 'F');
  doc.setDrawColor(231, 229, 228);
  doc.roundedRect(14, memoY, 120, 22, 2, 2, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(28, 25, 23);
  doc.text('DISBURSEMENT MEMORANDUM / REMARKS:', 18, memoY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(68, 64, 60);
  const memoText = slip.notes || 'Official compensation for technical robotics instruction, mentoring, chapter management, and youth engineering development under YARA statutory NPO programs.';
  const splitMemo = doc.splitTextToSize(memoText, 112);
  doc.text(splitMemo, 18, memoY + 10.5);

  // Seal card on right
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(138, memoY, 58, 22, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(138, memoY, 58, 22, 2, 2, 'D');

  doc.setDrawColor(37, 99, 235);
  doc.roundedRect(143, memoY + 3.5, 48, 7, 1, 1, 'D');
  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('YARA TREASURY SEAL', 167, memoY + 8, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(`Authorized: ${slip.approved_by_admin}`, 167, memoY + 14.5, { align: 'center' });
  doc.setTextColor(5, 150, 105);
  doc.setFont('helvetica', 'bold');
  doc.text('Electronically Verified', 167, memoY + 18.5, { align: 'center' });

  // 6. Sign-off Line
  const sigY = memoY + 32;
  doc.setDrawColor(71, 85, 105);
  doc.line(14, sigY + 12, 90, sigY + 12);
  doc.line(120, sigY + 12, 196, sigY + 12);

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Authorized Finance Signatory (YARA Treasury)', 14, sigY + 16);
  doc.text(`Date: ${slip.disbursement_date}`, 90, sigY + 16, { align: 'right' });

  doc.text('Payee Electronic Confirmation', 120, sigY + 16);
  doc.text(`Ref: ${slip.id}`, 196, sigY + 16, { align: 'right' });

  // 7. Footer Legal Disclaimer
  const footerY = 274;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, 196, footerY);

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  const disclaimer = 'This is an official computer-generated stipend slip issued by the Young Africans Robotics Association (YARA). As an accredited non-profit trust, all stipends, allowances, and T&S travel grants adhere to international donor audit standards and statutory transparency guidelines. Retain this payslip for tax filings and proof of remuneration. For inquiries: finance@yara.org.';
  const splitDisc = doc.splitTextToSize(disclaimer, 182);
  doc.text(splitDisc, 14, footerY + 4);

  doc.save(`YARA-Stipend-Slip-${slip.id}.pdf`);
}

/**
 * Print slip via browser print dialog in a clean dedicated window
 */
export function printStipendSlip(slip: StipendSlip): void {
  const html = generateStipendSlipHtml(slip);
  const win = window.open('', '_blank', 'width=880,height=960');
  if (win) {
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.focus();
      win.print();
    };
  }
}

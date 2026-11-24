import jsPDF from 'jspdf';
import { StipendSlip } from '../types/stipends';

/**
 * Clean printable HTML document for official NPO stipend disbursement slip
 */
export function generateStipendSlipHtml(slip: StipendSlip): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>YARA Official Stipend Disbursement Slip - ${slip.id}</title>
  <style>
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background-color: #f8fafc;
      padding: 24px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .slip-box {
      max-width: 720px;
      margin: 0 auto;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 16px;
      padding: 36px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .slip-box {
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
    .org-title {
      font-size: 15px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #0f172a;
    }
    .org-sub {
      font-size: 11px;
      font-weight: 700;
      color: #2563eb;
    }
    .motto {
      font-size: 10px;
      font-style: italic;
      color: #64748b;
      margin-top: 2px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      background: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 9999px;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .slip-title {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin-bottom: 4px;
    }
    .ref-meta {
      font-size: 11px;
      color: #64748b;
      margin-bottom: 20px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 24px;
    }
    .info-card {
      background: #f8fafc;
      border: 1px solid #f1f5f9;
      border-radius: 12px;
      padding: 14px;
    }
    .info-label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #64748b;
      margin-bottom: 4px;
    }
    .info-val {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
    }
    .info-val-sub {
      font-size: 11px;
      color: #475569;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      text-align: left;
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #475569;
      background: #f1f5f9;
      padding: 10px 14px;
      border-top: 1px solid #e2e8f0;
      border-bottom: 1px solid #e2e8f0;
    }
    td {
      padding: 12px 14px;
      font-size: 12px;
      border-bottom: 1px solid #f1f5f9;
      color: #334155;
    }
    .amount-col {
      text-align: right;
      font-weight: 700;
      color: #0f172a;
    }
    .total-row td {
      border-top: 2px solid #e2e8f0;
      border-bottom: 2px solid #0f172a;
      font-weight: 900;
      font-size: 14px;
      background: #faf5ff;
      color: #6b21a8;
    }
    .audit-footer {
      border-top: 1px dashed #cbd5e1;
      padding-top: 16px;
      font-size: 10px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .seal-box {
      border: 2px solid #3b82f6;
      border-radius: 8px;
      padding: 6px 12px;
      color: #1d4ed8;
      font-weight: 900;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body>
  <div class="slip-box">
    <div class="header">
      <div>
        <div class="org-title">Young Africans Robotics Association</div>
        <div class="org-sub">YARA Non-Profit Organization (NPO / Trust Reg)</div>
        <div class="motto">"Innovate Local, Build Global" • STEM &amp; Autonomous Robotics Education</div>
      </div>
      <div>
        <span class="badge">Disbursed &amp; Verified</span>
      </div>
    </div>

    <div class="slip-title">Official Stipend &amp; Allowance Disbursement Slip</div>
    <div class="ref-meta">Slip Reference: <strong>${slip.id}</strong> • Transaction Ref: <strong>${slip.payment_reference}</strong> • Date: <strong>${slip.disbursement_date}</strong></div>

    <div class="grid-2">
      <div class="info-card">
        <div class="info-label">Recipient Details</div>
        <div class="info-val">${slip.recipient_name}</div>
        <div class="info-val-sub">Role: <strong style="text-transform: capitalize;">${slip.recipient_role}</strong> ${slip.member_id ? `• Member ID: ${slip.member_id}` : ''}</div>
        ${slip.recipient_email ? `<div class="info-val-sub">Email: ${slip.recipient_email}</div>` : ''}
      </div>

      <div class="info-card">
        <div class="info-label">Disbursement Method &amp; Allocation</div>
        <div class="info-val" style="text-transform: capitalize;">${slip.payment_method.replace('_', ' ')}</div>
        <div class="info-val-sub">NPO Budget Allocation: <strong>${slip.budget_category.replace(/_/g, ' ').toUpperCase()}</strong></div>
        <div class="info-val-sub">Authorized By: <strong>${slip.approved_by_admin}</strong></div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Disbursement Component / Item Description</th>
          <th style="text-align: center;">Category</th>
          <th class="amount-col">Amount (${slip.currency})</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>Core Honorarium / Base Stipend</strong>
            <div style="font-size: 10px; color: #64748b;">Direct instructional, technical or operational duties completed</div>
          </td>
          <td style="text-align: center; font-size: 11px; color: #64748b;">Stipend</td>
          <td class="amount-col">$${Number(slip.base_stipend).toFixed(2)}</td>
        </tr>
        <tr>
          <td>
            <strong>Allowances (Prep, Materials &amp; Session Support)</strong>
            <div style="font-size: 10px; color: #64748b;">Equipment setup, student mentoring prep, and hardware logistics allowance</div>
          </td>
          <td style="text-align: center; font-size: 11px; color: #64748b;">Allowance</td>
          <td class="amount-col">$${Number(slip.allowance_amount).toFixed(2)}</td>
        </tr>
        <tr>
          <td>
            <strong>Travel &amp; Subsistence (T &amp; S)</strong>
            <div style="font-size: 10px; color: #64748b;">Travel reimbursements, regional venue transit, meals, and local subsistence</div>
          </td>
          <td style="text-align: center; font-size: 11px; color: #64748b;">T &amp; S</td>
          <td class="amount-col">$${Number(slip.travel_subsistence_ts).toFixed(2)}</td>
        </tr>
        ${slip.withholding_deductions > 0 ? `
        <tr>
          <td>
            <strong>Statutory / Administrative Withholding</strong>
          </td>
          <td style="text-align: center; font-size: 11px; color: #64748b;">Deduction</td>
          <td class="amount-col" style="color: #dc2626;">-$${Number(slip.withholding_deductions).toFixed(2)}</td>
        </tr>` : ''}
        <tr class="total-row">
          <td colspan="2">NET AMOUNT RECEIVED &amp; CONFIRMED</td>
          <td class="amount-col" style="color: #6b21a8; font-size: 16px;">$${Number(slip.net_amount_received).toFixed(2)} ${slip.currency}</td>
        </tr>
      </tbody>
    </table>

    ${slip.notes ? `
    <div style="margin-bottom: 20px; padding: 12px; background: #fdf4ff; border-left: 3px solid #a855f7; border-radius: 4px; font-size: 11px; color: #581c87;">
      <strong>Purpose &amp; Performance Notes:</strong> ${slip.notes}
    </div>` : ''}

    <div class="audit-footer">
      <div>
        <div>This is an official computer-generated NPO stipend payment record.</div>
        <div>Complies with YARA Fiscal Transparency, Audit Standards &amp; Grant Reporting Protocols.</div>
      </div>
      <div class="seal-box">
        YARA TREASURY SEAL
      </div>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Downloads a high-quality PDF stipend slip directly in the browser
 */
export function downloadStipendSlipPdf(slip: StipendSlip): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Colors
  const darkNavy = '#0f172a';
  const blue = '#2563eb';
  const slate = '#64748b';
  const emerald = '#059669';

  // Header banner
  doc.setFillColor(15, 23, 42); // dark navy
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('YOUNG AFRICANS ROBOTICS ASSOCIATION (YARA)', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(191, 219, 254);
  doc.text('Non-Profit Organization (NPO) • "Innovate Local, Build Global"', 14, 19);
  doc.text('Official Stipend, Allowance & T&S Disbursement Slip', 14, 25);

  // Status Badge
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(150, 8, 46, 12, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('DISBURSED & VERIFIED', 153, 15.5);

  // Reference Meta
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Slip Reference: ${slip.id}`, 14, 42);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Payment Reference: ${slip.payment_reference}  |  Date: ${slip.disbursement_date}  |  Method: ${slip.payment_method.toUpperCase()}`, 14, 48);

  // Recipient Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 54, 88, 30, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, 54, 88, 30, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('RECIPIENT INFORMATION', 18, 60);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(slip.recipient_name, 18, 67);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Designation: ${slip.recipient_role.toUpperCase()}`, 18, 73);
  if (slip.recipient_email) {
    doc.text(`Email: ${slip.recipient_email}`, 18, 78);
  }

  // Authorization Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(108, 54, 88, 30, 3, 3, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(108, 54, 88, 30, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('NPO ALLOCATION & AUDIT', 112, 60);

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text(`Category: ${slip.budget_category.replace(/_/g, ' ').toUpperCase()}`, 112, 67);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Authorized by: ${slip.approved_by_admin}`, 112, 73);
  doc.text(`Status: Completed & Reconciled`, 112, 78);

  // Financial Breakdown Table
  let y = 96;
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('ITEM / DISBURSEMENT COMPONENT', 18, y + 5.5);
  doc.text('CATEGORY', 120, y + 5.5);
  doc.text(`AMOUNT (${slip.currency})`, 160, y + 5.5);

  y += 8;
  const items = [
    { label: 'Core Base Stipend / Honorarium', category: 'Stipend', amount: Number(slip.base_stipend).toFixed(2) },
    { label: 'Allowances (Materials, Prep & Session Support)', category: 'Allowance', amount: Number(slip.allowance_amount).toFixed(2) },
    { label: 'Travel & Subsistence (T & S)', category: 'T & S', amount: Number(slip.travel_subsistence_ts).toFixed(2) },
  ];

  if (slip.withholding_deductions > 0) {
    items.push({ label: 'Statutory / Admin Withholdings', category: 'Deduction', amount: `-${Number(slip.withholding_deductions).toFixed(2)}` });
  }

  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    y += 10;
    doc.setTextColor(15, 23, 42);
    doc.text(item.label, 18, y);
    doc.setTextColor(100, 116, 139);
    doc.text(item.category, 120, y);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`$${item.amount}`, 160, y);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(241, 245, 249);
    doc.line(14, y + 3, 196, y + 3);
  });

  // Net Amount Box
  y += 14;
  doc.setFillColor(250, 245, 255);
  doc.roundedRect(14, y, 182, 16, 3, 3, 'F');
  doc.setDrawColor(233, 213, 255);
  doc.roundedRect(14, y, 182, 16, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(107, 33, 168);
  doc.text('TOTAL NET AMOUNT RECEIVED & CONFIRMED:', 18, y + 10);
  doc.setFontSize(13);
  doc.text(`$${Number(slip.net_amount_received).toFixed(2)} ${slip.currency}`, 148, y + 10);

  // Notes
  if (slip.notes) {
    y += 24;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('MEMORANDUM / PURPOSE NOTES:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(51, 65, 85);
    const splitNotes = doc.splitTextToSize(slip.notes, 182);
    doc.text(splitNotes, 14, y + 6);
  }

  // Footer & Seal
  const footerY = 265;
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(14, footerY, 196, footerY);

  doc.setLineDashPattern([], 0);
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Young Africans Robotics Association (YARA) Treasury Directorate', 14, footerY + 6);
  doc.text('Certified authentic disbursement record. For tax and grant auditing inquiries: finance@yara.org', 14, footerY + 11);

  // Seal box
  doc.setDrawColor(59, 130, 246);
  doc.roundedRect(145, footerY + 3, 51, 14, 2, 2, 'D');
  doc.setTextColor(29, 78, 216);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('YARA OFFICIAL TREASURY SEAL', 147, footerY + 9);
  doc.setFontSize(7);
  doc.text('VERIFIED & RECONCILED', 152, footerY + 13.5);

  doc.save(`YARA-Stipend-Slip-${slip.id}.pdf`);
}

/**
 * Print slip via browser print dialog in a new clean window
 */
export function printStipendSlip(slip: StipendSlip): void {
  const html = generateStipendSlipHtml(slip);
  const win = window.open('', '_blank', 'width=800,height=900');
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


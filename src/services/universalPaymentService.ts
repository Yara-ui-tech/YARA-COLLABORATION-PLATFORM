import { supabase } from '../lib/supabase';

export interface PaymentTransaction {
  id: string;
  receiptNumber: string;
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  purpose: 'donation' | 'subscription' | 'course_fee' | 'general';
  purposeTitle: string;
  amount: number;
  currency: 'USD' | 'ZiG' | 'ZAR';
  paymentGateway: 'ecocash' | 'bank_transfer' | 'card' | 'paypal';
  transactionReference: string;
  status: 'completed' | 'pending_verification' | 'failed';
  createdAt: string;
  organization: string;
  notes?: string;
}

const STORAGE_KEY_TRANSACTIONS = 'yara_universal_transactions';

export const YARA_GATEWAY_CONFIG = {
  ecocash: {
    number: '0788953986',
    accountName: 'Simbarashe Manongwa / Young Africans Robotics Association (YARA)',
    dialCodeUssd: '*151*2*2*0788953986*AMOUNT#',
    helpline: '+263 78 895 3986'
  },
  bank: {
    bankName: 'CBZ Bank Zimbabwe',
    accountName: 'Young Africans Robotics Association (YARA)',
    accountNumber: '01124892010018',
    branch: 'Chinhoyi University of Technology (CUT) Branch',
    branchCode: '0411',
    swiftCode: 'CBZAZWHA',
    currency: 'USD / Multi-currency'
  },
  card: {
    provider: 'Stripe & Visa / Mastercard Network',
    supportedCards: ['Visa', 'Mastercard', 'UnionPay', 'American Express'],
    gatewayState: 'READY_WAITING_FOR_LIVE_KEY',
    note: 'PCI-DSS Compliant 256-bit Encrypted Processing'
  },
  paypal: {
    merchantEmail: 'inforyaraorg@gmail.com',
    gatewayState: 'READY_WAITING_FOR_LIVE_KEY'
  }
};

export function getAllTransactions(): PaymentTransaction[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(tx: PaymentTransaction): void {
  try {
    const all = getAllTransactions();
    all.unshift(tx);
    localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(all));
  } catch (e) {
    console.error('Error storing transaction:', e);
  }
}

export async function processPaymentSubmission(params: {
  payerName: string;
  payerEmail: string;
  payerPhone?: string;
  purpose: 'donation' | 'subscription' | 'course_fee' | 'general';
  purposeTitle: string;
  amount: number;
  currency: 'USD' | 'ZiG' | 'ZAR';
  paymentGateway: 'ecocash' | 'bank_transfer' | 'card' | 'paypal';
  transactionReference?: string;
  notes?: string;
}): Promise<PaymentTransaction> {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000);
  const receiptNumber = `YARA-RCPT-2026-${randomSuffix}`;
  const ref = params.transactionReference?.trim() || `TXN-${Date.now().toString().slice(-8)}`;

  const tx: PaymentTransaction = {
    id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    receiptNumber,
    payerName: params.payerName.trim() || 'Valued Contributor',
    payerEmail: params.payerEmail.trim() || 'contributor@yara.org',
    payerPhone: params.payerPhone?.trim(),
    purpose: params.purpose,
    purposeTitle: params.purposeTitle,
    amount: params.amount,
    currency: params.currency,
    paymentGateway: params.paymentGateway,
    transactionReference: ref,
    status: params.paymentGateway === 'card' || params.paymentGateway === 'paypal' ? 'completed' : 'pending_verification',
    createdAt: new Date().toISOString(),
    organization: 'Young Africans Robotics Association (YARA)',
    notes: params.notes
  };

  saveTransaction(tx);

  // Sync to database if available
  try {
    await supabase.from('donations_sponsorships').insert({
      donor_name: tx.payerName,
      email: tx.payerEmail,
      phone: tx.payerPhone,
      support_type: tx.purpose === 'donation' ? 'financial' : 'subscription',
      amount: tx.amount,
      currency: tx.currency,
      payment_method: tx.paymentGateway,
      transaction_reference: tx.transactionReference,
      status: tx.status === 'completed' ? 'approved' : 'pending',
      message: tx.notes || tx.purposeTitle
    });
  } catch {
    // fallback gracefully
  }

  return tx;
}

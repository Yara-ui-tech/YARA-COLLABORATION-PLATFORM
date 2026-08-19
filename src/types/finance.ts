export interface Investment {
  id: string;
  source_name: string;
  amount: number;
  currency: string;
  investment_type: 'grant' | 'angel' | 'sponsor' | 'government' | 'donation';
  purpose: string;
  date_received: string;
  status: 'received' | 'pledged' | 'allocated';
  notes?: string;
  created_at?: string;
}

export interface MentorPayout {
  id: string;
  mentor_id: string;
  mentor_name: string;
  mentor_email?: string;
  amount: number;
  currency: string;
  sessions_completed: number;
  payment_method: 'bank_transfer' | 'mobile_money' | 'paypal' | 'crypto' | 'cash';
  payment_reference?: string;
  status: 'completed' | 'pending' | 'processing';
  payout_date: string;
  notes?: string;
  created_at?: string;
}

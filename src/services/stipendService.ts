import { supabase } from '../lib/supabase';
import { StipendSlip, NpoBudgetPercentages, DEFAULT_NPO_BUDGET_PERCENTAGES } from '../types/stipends';

const STORAGE_KEY = 'yara_stipend_slips_registry';
const SETTINGS_KEY = 'yara_npo_budget_percentages';

export const stipendService = {
  /**
   * Fetch all stipend disbursement slips (for admin auditing and record keeping)
   */
  getAllStipends: async (): Promise<StipendSlip[]> => {
    let localSlips: StipendSlip[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) localSlips = JSON.parse(raw);
    } catch {}

    try {
      const { data, error } = await supabase
        .from('stipend_slips')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        return data as StipendSlip[];
      }
    } catch (e) {
      console.warn('Note reading from stipend_slips table:', e);
    }

    return localSlips;
  },

  /**
   * Fetch slips for a specific recipient (individual mentor, trainer, coach, employee)
   */
  getStipendsForRecipient: async (recipientId: string): Promise<StipendSlip[]> => {
    const all = await stipendService.getAllStipends();
    return all.filter(s => s.recipient_id === recipientId);
  },

  /**
   * Record and disburse a new stipend slip
   */
  createStipendSlip: async (
    slipData: Omit<StipendSlip, 'id' | 'created_at'>
  ): Promise<StipendSlip> => {
    const generatedId = `STP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const newSlip: StipendSlip = {
      ...slipData,
      id: generatedId,
      created_at: new Date().toISOString()
    };

    // 1. Save locally immediately
    const existing = await stipendService.getAllStipends();
    const updated = [newSlip, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Persist in Supabase stipend_slips table
    try {
      await supabase.from('stipend_slips').insert({
        id: newSlip.id,
        recipient_id: newSlip.recipient_id,
        recipient_name: newSlip.recipient_name,
        recipient_email: newSlip.recipient_email,
        recipient_phone: newSlip.recipient_phone,
        recipient_role: newSlip.recipient_role,
        member_id: newSlip.member_id,
        currency: newSlip.currency,
        base_stipend: newSlip.base_stipend,
        allowance_amount: newSlip.allowance_amount,
        travel_subsistence_ts: newSlip.travel_subsistence_ts,
        gross_amount: newSlip.gross_amount,
        withholding_deductions: newSlip.withholding_deductions,
        net_amount_received: newSlip.net_amount_received,
        budget_category: newSlip.budget_category,
        payment_method: newSlip.payment_method,
        payment_reference: newSlip.payment_reference,
        disbursement_date: newSlip.disbursement_date,
        status: newSlip.status,
        approved_by_admin: newSlip.approved_by_admin,
        notes: newSlip.notes,
        created_at: newSlip.created_at
      });
    } catch (e) {
      console.warn('Note writing to stipend_slips table:', e);
    }

    // 3. Also record in mentor_payouts if recipient is a mentor for backwards compatibility
    if (newSlip.recipient_role === 'mentor') {
      try {
        await supabase.from('mentor_payouts').insert({
          mentor_id: newSlip.recipient_id,
          mentor_name: newSlip.recipient_name,
          mentor_email: newSlip.recipient_email,
          amount: newSlip.net_amount_received,
          currency: newSlip.currency,
          sessions_completed: 1,
          payment_method: newSlip.payment_method,
          payment_reference: newSlip.payment_reference,
          status: newSlip.status === 'completed' ? 'completed' : 'processing',
          payout_date: newSlip.disbursement_date,
          notes: newSlip.notes
        });
      } catch {}
    }

    // 4. Dispatch event so recipient UI & admin UI immediately refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yara_stipend_disbursed', { detail: newSlip }));
    }

    return newSlip;
  },

  /**
   * Load NPO Budget Percentages configuration
   */
  getBudgetPercentages: async (): Promise<NpoBudgetPercentages> => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}

    try {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'npo_budget_percentages')
        .single();

      if (data?.value) {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.value));
        return data.value as NpoBudgetPercentages;
      }
    } catch {}

    return DEFAULT_NPO_BUDGET_PERCENTAGES;
  },

  /**
   * Update NPO Budget Percentages configuration
   */
  saveBudgetPercentages: async (percentages: NpoBudgetPercentages): Promise<void> => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(percentages));

    try {
      await supabase.from('system_settings').upsert({
        key: 'npo_budget_percentages',
        value: percentages,
        updated_at: new Date().toISOString()
      });
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yara_budget_percentages_updated', { detail: percentages }));
    }
  }
};


import { supabase } from '../lib/supabase';
import { StipendSlip, NpoBudgetPercentages, DEFAULT_NPO_BUDGET_PERCENTAGES } from '../types/stipends';

const STORAGE_KEY = 'yara_stipend_slips_registry';
const SETTINGS_KEY = 'yara_npo_budget_percentages';

export const isValidUuid = (val?: string | null): boolean => {
  return Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));
};

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

      if (!error && data) {
        // Merge Supabase slips with local slips so custom offline slips are also preserved
        const serverSlips = data as StipendSlip[];
        const serverIds = new Set(serverSlips.map(s => s.id));
        const merged = [...serverSlips, ...localSlips.filter(l => !serverIds.has(l.id))];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (e) {
      console.warn('Note reading from stipend_slips table:', e);
    }

    return localSlips;
  },

  /**
   * Fetch slips for a specific recipient (individual mentor, trainer, coach, employee)
   * Matches by UUID, email, or display name to guarantee target users receive their slips
   */
  getStipendsForRecipient: async (recipientId: string): Promise<StipendSlip[]> => {
    const all = await stipendService.getAllStipends();
    return all.filter(s => s.recipient_id === recipientId);
  },

  /**
   * Universal targeted user slip fetcher (matches by ID, email, or display name)
   */
  getStipendsForUser: async (userId?: string, email?: string, displayName?: string): Promise<StipendSlip[]> => {
    const all = await stipendService.getAllStipends();
    const uId = userId?.toLowerCase().trim();
    const uEmail = email?.toLowerCase().trim();
    const uName = displayName?.toLowerCase().trim();

    return all.filter(s => {
      const matchId = Boolean(uId && s.recipient_id && s.recipient_id.toLowerCase().trim() === uId);
      const matchEmail = Boolean(uEmail && s.recipient_email && s.recipient_email.toLowerCase().trim() === uEmail);
      const matchName = Boolean(uName && s.recipient_name && s.recipient_name.toLowerCase().trim() === uName);
      return matchId || matchEmail || matchName;
    });
  },

  /**
   * Record and disburse a new stipend slip
   */
  createStipendSlip: async (
    slipData: Omit<StipendSlip, 'id' | 'created_at'>
  ): Promise<StipendSlip> => {
    const generatedId = `STP-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Clean recipient UUID so postgres foreign key / uuid type doesn't reject it
    let cleanRecipientId: string | null = isValidUuid(slipData.recipient_id) ? slipData.recipient_id : null;
    
    // If not a valid UUID, attempt looking up profile by email or display name
    if (!cleanRecipientId && slipData.recipient_email) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', slipData.recipient_email.trim())
          .maybeSingle();
        if (prof?.id && isValidUuid(prof.id)) {
          cleanRecipientId = prof.id;
        }
      } catch {}
    }
    if (!cleanRecipientId && slipData.recipient_name) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .ilike('display_name', slipData.recipient_name.trim())
          .maybeSingle();
        if (prof?.id && isValidUuid(prof.id)) {
          cleanRecipientId = prof.id;
        }
      } catch {}
    }

    const newSlip: StipendSlip = {
      ...slipData,
      id: generatedId,
      recipient_id: cleanRecipientId || slipData.recipient_id,
      created_at: new Date().toISOString()
    };

    // 1. Save locally immediately
    const existing = await stipendService.getAllStipends();
    const updated = [newSlip, ...existing.filter(s => s.id !== newSlip.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // 2. Persist in Supabase stipend_slips table
    try {
      await supabase.from('stipend_slips').insert({
        id: newSlip.id,
        recipient_id: cleanRecipientId, // Must be valid UUID or null
        recipient_name: newSlip.recipient_name,
        recipient_email: newSlip.recipient_email || null,
        recipient_phone: newSlip.recipient_phone || null,
        recipient_role: newSlip.recipient_role,
        member_id: newSlip.member_id || null,
        currency: newSlip.currency || 'USD',
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
        reason_for_stipend: newSlip.reason_for_stipend || 'Outreach & Technical Training Workshop',
        location: newSlip.location || 'Harare & Chinhoyi Operational Hubs',
        number_of_days: Number(newSlip.number_of_days) || 1,
        activity_category: newSlip.activity_category || 'outreach',
        project_code: newSlip.project_code || null,
        funding_source: newSlip.funding_source || 'NPO Direct Program Allocation',
        recorded_by_officer: newSlip.recorded_by_officer || 'Appointed Finance Officer',
        created_at: newSlip.created_at
      });
    } catch (e) {
      console.warn('Note writing to stipend_slips table:', e);
    }

    // 3. Update recipient's profile commission & amount_paid in database
    if (cleanRecipientId) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('amount_paid, total_commission')
          .eq('id', cleanRecipientId)
          .maybeSingle();

        if (prof) {
          const prevPaid = Number(prof.amount_paid) || 0;
          const net = Number(newSlip.net_amount_received) || 0;
          const updatedPaid = prevPaid + net;
          const prevTotal = Number(prof.total_commission) || 0;
          const updatedTotal = Math.max(prevTotal, updatedPaid);

          await supabase
            .from('profiles')
            .update({
              amount_paid: updatedPaid,
              total_commission: updatedTotal
            })
            .eq('id', cleanRecipientId);
        }
      } catch (profErr) {
        console.warn('Failed to sync profile commission totals:', profErr);
      }
    }

    // 4. Also record in mentor_payouts if recipient is a mentor for backwards compatibility
    if (newSlip.recipient_role === 'mentor' && cleanRecipientId) {
      try {
        await supabase.from('mentor_payouts').insert({
          mentor_id: cleanRecipientId,
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

    // 5. Dispatch event so recipient UI & admin UI immediately refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yara_stipend_disbursed', { detail: newSlip }));
    }

    return newSlip;
  },

  /**
   * Update or edit an existing stipend slip (all fields editable by admin)
   */
  updateStipendSlip: async (updatedSlip: StipendSlip): Promise<StipendSlip> => {
    // 1. Update local cache
    const existing = await stipendService.getAllStipends();
    const updated = existing.map(s => s.id === updatedSlip.id ? updatedSlip : s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Clean recipient UUID
    let cleanRecipientId: string | null = isValidUuid(updatedSlip.recipient_id) ? updatedSlip.recipient_id : null;
    if (!cleanRecipientId && updatedSlip.recipient_email) {
      try {
        const { data: prof } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', updatedSlip.recipient_email.trim())
          .maybeSingle();
        if (prof?.id && isValidUuid(prof.id)) {
          cleanRecipientId = prof.id;
        }
      } catch {}
    }

    // 2. Update Supabase
    try {
      await supabase
        .from('stipend_slips')
        .upsert({
          ...updatedSlip,
          recipient_id: cleanRecipientId
        });
    } catch (e) {
      console.warn('Note updating stipend_slips in DB:', e);
    }

    // 3. Update recipient's profile commission & amount_paid in database if present
    if (cleanRecipientId) {
      try {
        const { data: allUserSlips } = await supabase
          .from('stipend_slips')
          .select('net_amount_received, status')
          .eq('recipient_id', cleanRecipientId);

        if (allUserSlips) {
          const totalPaid = allUserSlips
            .filter(s => s.status === 'completed')
            .reduce((sum, s) => sum + (Number(s.net_amount_received) || 0), 0);

          const { data: prof } = await supabase
            .from('profiles')
            .select('total_commission')
            .eq('id', cleanRecipientId)
            .maybeSingle();

          const prevTotal = Number(prof?.total_commission) || 0;
          await supabase
            .from('profiles')
            .update({
              amount_paid: totalPaid,
              total_commission: Math.max(prevTotal, totalPaid)
            })
            .eq('id', cleanRecipientId);
        }
      } catch {}
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yara_stipend_disbursed', { detail: updatedSlip }));
    }

    return updatedSlip;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yara_stipend_disbursed', { detail: updatedSlip }));
    }

    return updatedSlip;
  },

  /**
   * Delete a stipend slip
   */
  deleteStipendSlip: async (slipId: string): Promise<boolean> => {
    const existing = await stipendService.getAllStipends();
    const updated = existing.filter(s => s.id !== slipId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    try {
      await supabase
        .from('stipend_slips')
        .delete()
        .eq('id', slipId);
    } catch {}

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yara_stipend_disbursed', { detail: { id: slipId, deleted: true } }));
    }

    return true;
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


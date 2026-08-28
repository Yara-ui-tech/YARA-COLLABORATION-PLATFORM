import { supabase } from '../lib/supabase';
import { 
  EventRegistration, 
  EventPaymentStatus, 
  EventApprovalStatus, 
  EventTimelineStatus, 
  EventAccessResult,
  EventMeetingConfig,
  AI_FOR_EDUCATORS_EVENT 
} from '../types/eventRegistration';

export { AI_FOR_EDUCATORS_EVENT };
export type { EventMeetingConfig };

const STORAGE_KEY = 'yara_event_registrations_store';
const MEETING_CONFIG_KEY = 'yara_event_meeting_configs_store';

export const CANONICAL_AI_BOOTCAMP_ID = AI_FOR_EDUCATORS_EVENT.id; // 'ai-for-educators-2026'

/**
 * Normalizes all event ID variations to standard aliases
 */
export function getCanonicalEventAliases(eventId: string = CANONICAL_AI_BOOTCAMP_ID): string[] {
  const clean = (eventId || '').trim().toLowerCase();
  if (
    clean === 'ai-for-educators-2026' || 
    clean === 'ai_educators_bootcamp_2026' || 
    clean === 'ai_for_educators' || 
    clean === 'ai-for-educators' ||
    clean.includes('ai-for-educators') ||
    clean.includes('ai_educators')
  ) {
    return ['ai-for-educators-2026', 'ai_educators_bootcamp_2026', 'ai-for-educators', 'ai_for_educators'];
  }
  return [eventId || CANONICAL_AI_BOOTCAMP_ID];
}

export function generateRegistrationCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `YARA-AI-${rand}`;
}

export const DEFAULT_MEETING_CONFIG: EventMeetingConfig = {
  event_id: AI_FOR_EDUCATORS_EVENT.id,
  meeting_title: 'AI for Educators Online Bootcamp — Google Meet Live Hall',
  meeting_url: 'https://meet.google.com/new',
  meeting_code: 'yara-ai-educators-2026',
  passcode: 'YARA2026',
  platform: 'google_meet',
  daily_schedule_time: '17:00 – 19:30 CAT (Daily: 31 Aug – 4 Sep 2026)',
  instructions: 'Please ensure your microphone is muted upon entry. Enable camera during interactive practical exercises and discussions.',
  updated_at: new Date().toISOString(),
  updated_by_name: 'YARA Academic Secretariat'
};

// In-memory cache for fastest instant UI rendering
let meetingConfigMemoryCache: Record<string, EventMeetingConfig> = {};

/**
 * Formats/sanitizes a meeting URL (e.g. ensures protocol)
 */
function sanitizeMeetingUrl(url: string): string {
  let clean = (url || '').trim();
  if (!clean) return 'https://meet.google.com/new';
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `https://${clean}`;
  }
  return clean;
}

/**
 * Cache meeting config across all matching aliases and localStorage
 */
function cacheMeetingConfig(config: EventMeetingConfig): void {
  const aliases = getCanonicalEventAliases(config.event_id);
  aliases.forEach(alias => {
    const aliasedConfig = { ...config, event_id: alias };
    meetingConfigMemoryCache[alias] = aliasedConfig;
    try {
      localStorage.setItem(`${MEETING_CONFIG_KEY}_${alias}`, JSON.stringify(aliasedConfig));
    } catch {
      // ignore
    }
  });
}

/**
 * Gets the cached meeting configuration synchronously for instant component render
 */
export function getEventMeetingConfig(eventId: string = AI_FOR_EDUCATORS_EVENT.id): EventMeetingConfig {
  const aliases = getCanonicalEventAliases(eventId);
  
  // 1. Check in-memory cache
  for (const alias of aliases) {
    if (meetingConfigMemoryCache[alias]) {
      return meetingConfigMemoryCache[alias];
    }
  }

  // 2. Check localStorage
  for (const alias of aliases) {
    try {
      const raw = localStorage.getItem(`${MEETING_CONFIG_KEY}_${alias}`);
      if (raw) {
        const parsed = JSON.parse(raw) as EventMeetingConfig;
        if (parsed && parsed.meeting_url) {
          meetingConfigMemoryCache[alias] = parsed;
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not read meeting config:', err);
    }
  }

  return { ...DEFAULT_MEETING_CONFIG, event_id: eventId };
}

/**
 * Asynchronously fetches the latest meeting configuration from Supabase
 * and synchronizes local caches and stores for all users
 */
export async function fetchEventMeetingConfig(eventId: string = AI_FOR_EDUCATORS_EVENT.id): Promise<EventMeetingConfig> {
  const aliases = getCanonicalEventAliases(eventId);

  try {
    const { data, error } = await supabase
      .from('event_meetings')
      .select('*')
      .in('event_id', aliases)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data && data.meeting_url) {
      const liveConfig: EventMeetingConfig = {
        event_id: eventId,
        meeting_title: data.meeting_title || DEFAULT_MEETING_CONFIG.meeting_title,
        meeting_url: sanitizeMeetingUrl(data.meeting_url),
        meeting_code: data.meeting_code || undefined,
        passcode: data.passcode || undefined,
        platform: data.platform || 'google_meet',
        daily_schedule_time: data.daily_schedule_time || DEFAULT_MEETING_CONFIG.daily_schedule_time,
        instructions: data.instructions || DEFAULT_MEETING_CONFIG.instructions,
        updated_at: data.updated_at || new Date().toISOString(),
        updated_by_name: data.updated_by_name || 'YARA Academic Secretariat'
      };

      cacheMeetingConfig(liveConfig);
      return liveConfig;
    }
  } catch (err) {
    console.warn('Supabase fetch meeting config notice (using local cache):', err);
  }

  return getEventMeetingConfig(eventId);
}

/**
 * Updates meeting configuration (admin action) with database persistence and real-time broadcast
 */
export async function updateEventMeetingConfig(
  eventId: string,
  updates: Partial<EventMeetingConfig>,
  adminName?: string
): Promise<EventMeetingConfig> {
  const current = getEventMeetingConfig(eventId);
  const aliases = getCanonicalEventAliases(eventId);
  const now = new Date().toISOString();

  const formattedUrl = sanitizeMeetingUrl(updates.meeting_url || current.meeting_url);

  const updated: EventMeetingConfig = {
    ...current,
    ...updates,
    meeting_url: formattedUrl,
    event_id: eventId,
    updated_at: now,
    updated_by_name: adminName || current.updated_by_name || 'Administrator'
  };

  // 1. Update memory cache and localStorage across all aliases immediately
  cacheMeetingConfig(updated);

  // 2. Dispatch local custom event and BroadcastChannel for cross-tab sync
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('yara_meeting_config_updated', { detail: updated }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('yara_meeting_broadcast');
        bc.postMessage({ type: 'MEETING_UPDATED', config: updated });
        bc.close();
      }
    }
  } catch {
    // ignore
  }

  // 3. Persist to Supabase database for all event aliases
  try {
    for (const alias of aliases) {
      const payload = {
        event_id: alias,
        meeting_title: updated.meeting_title,
        meeting_url: updated.meeting_url,
        meeting_code: updated.meeting_code || null,
        passcode: updated.passcode || null,
        platform: updated.platform,
        daily_schedule_time: updated.daily_schedule_time,
        instructions: updated.instructions,
        updated_at: now,
        updated_by_name: updated.updated_by_name
      };

      // Try upsert with onConflict on event_id
      const { error: upsertErr } = await supabase
        .from('event_meetings')
        .upsert(payload, { onConflict: 'event_id' });

      // Fallback: If upsert has any conflict/RLS quirks, do an explicit update
      if (upsertErr) {
        await supabase
          .from('event_meetings')
          .update(payload)
          .eq('event_id', alias);
      }
    }
  } catch (err) {
    console.warn('Supabase meeting sync error:', err);
  }

  // 4. Also broadcast over Supabase Realtime channel if available
  try {
    const channel = supabase.channel('event_meetings_broadcast');
    channel.send({
      type: 'broadcast',
      event: 'meeting_config_changed',
      payload: updated
    });
  } catch {
    // ignore
  }

  return updated;
}

/**
 * Subscribes to live meeting configuration updates (Supabase Realtime, BroadcastChannel, Window events)
 */
export function subscribeToEventMeetingConfig(
  eventId: string = AI_FOR_EDUCATORS_EVENT.id,
  onUpdate: (config: EventMeetingConfig) => void
): () => void {
  const aliases = getCanonicalEventAliases(eventId);

  // 1. Supabase Realtime postgres_changes subscription
  const supabaseChannel = supabase
    .channel(`event_meetings_live_${eventId}_${Math.random().toString(36).substring(2, 7)}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'event_meetings'
      },
      (payload: any) => {
        if (payload && payload.new) {
          const row = payload.new;
          if (aliases.includes(row.event_id) || !row.event_id) {
            const newCfg: EventMeetingConfig = {
              event_id: eventId,
              meeting_title: row.meeting_title || DEFAULT_MEETING_CONFIG.meeting_title,
              meeting_url: sanitizeMeetingUrl(row.meeting_url),
              meeting_code: row.meeting_code || undefined,
              passcode: row.passcode || undefined,
              platform: row.platform || 'google_meet',
              daily_schedule_time: row.daily_schedule_time || DEFAULT_MEETING_CONFIG.daily_schedule_time,
              instructions: row.instructions || DEFAULT_MEETING_CONFIG.instructions,
              updated_at: row.updated_at || new Date().toISOString(),
              updated_by_name: row.updated_by_name || 'YARA Academic Secretariat'
            };
            cacheMeetingConfig(newCfg);
            onUpdate(newCfg);
          }
        }
      }
    )
    .on('broadcast', { event: 'meeting_config_changed' }, (payload: any) => {
      if (payload && payload.payload) {
        const row = payload.payload;
        if (aliases.includes(row.event_id)) {
          cacheMeetingConfig(row);
          onUpdate(row);
        }
      }
    })
    .subscribe();

  // 2. Window Custom Event listener
  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<EventMeetingConfig>;
    if (customEvent.detail && aliases.includes(customEvent.detail.event_id)) {
      onUpdate(customEvent.detail);
    }
  };
  window.addEventListener('yara_meeting_config_updated', handleCustomEvent);

  // 3. Window Storage Event listener (cross-tab sync)
  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key && aliases.some(alias => e.key === `${MEETING_CONFIG_KEY}_${alias}`) && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue) as EventMeetingConfig;
        if (parsed && parsed.meeting_url) {
          cacheMeetingConfig(parsed);
          onUpdate(parsed);
        }
      } catch {
        // ignore
      }
    }
  };
  window.addEventListener('storage', handleStorageEvent);

  // 4. BroadcastChannel listener
  let bc: BroadcastChannel | null = null;
  try {
    if ('BroadcastChannel' in window) {
      bc = new BroadcastChannel('yara_meeting_broadcast');
      bc.onmessage = (event) => {
        if (event.data?.type === 'MEETING_UPDATED' && event.data?.config) {
          const cfg = event.data.config as EventMeetingConfig;
          if (aliases.includes(cfg.event_id)) {
            cacheMeetingConfig(cfg);
            onUpdate(cfg);
          }
        }
      };
    }
  } catch {
    // ignore
  }

  // Return cleanup function
  return () => {
    try {
      supabase.removeChannel(supabaseChannel);
    } catch {
      // ignore
    }
    window.removeEventListener('yara_meeting_config_updated', handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
    if (bc) {
      try {
        bc.close();
      } catch {
        // ignore
      }
    }
  };
}

function getLocalRegistrations(): EventRegistration[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as EventRegistration[];
    // Ensure all registrations have a registration_code
    let changed = false;
    list.forEach(r => {
      if (!r.registration_code) {
        r.registration_code = generateRegistrationCode();
        changed = true;
      }
    });
    if (changed) {
      saveLocalRegistrations(list);
    }
    return list;
  } catch {
    return [];
  }
}

function saveLocalRegistrations(records: EventRegistration[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

/**
 * Calculates current event status based on start/end dates:
 * - Before 31 Aug 2026: UPCOMING
 * - 31 Aug to 4 Sep 2026: LIVE
 * - After 4 Sep 2026: CLOSED
 */
export function getEventTimelineStatus(
  startDateStr: string = AI_FOR_EDUCATORS_EVENT.startDate,
  endDateStr: string = AI_FOR_EDUCATORS_EVENT.endDate
): EventTimelineStatus {
  // Allow manual simulation override from localStorage for demonstration/testing
  const override = localStorage.getItem('yara_event_status_override');
  if (override === 'upcoming' || override === 'live' || override === 'closed') {
    return override;
  }

  const now = new Date();
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  if (now < start) {
    return 'upcoming';
  } else if (now >= start && now <= end) {
    return 'live';
  } else {
    return 'closed';
  }
}

export function setEventTimelineOverride(status: 'auto' | 'upcoming' | 'live' | 'closed'): void {
  if (status === 'auto') {
    localStorage.removeItem('yara_event_status_override');
  } else {
    localStorage.setItem('yara_event_status_override', status);
  }
}

/**
 * Fetches all event registrations (for admin)
 */
export async function getAllEventRegistrations(eventId?: string): Promise<EventRegistration[]> {
  const localList = getLocalRegistrations();
  
  try {
    let query = supabase
      .from('event_registrations')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (eventId) {
      query = query.eq('event_id', eventId);
    }
    
    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      // Merge with local to ensure offline resilience
      const mergedMap = new Map<string, EventRegistration>();
      data.forEach((item: any) => {
        const itemRecord = item as EventRegistration;
        if (!itemRecord.registration_code) {
          itemRecord.registration_code = generateRegistrationCode();
        }
        mergedMap.set(itemRecord.id, itemRecord);
      });
      localList.forEach(item => {
        if (!mergedMap.has(item.id)) {
          mergedMap.set(item.id, item);
        }
      });
      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      saveLocalRegistrations(combined);
      return combined;
    }
  } catch (err) {
    console.warn('Supabase fetch event registrations fallback to local:', err);
  }
  
  if (eventId) {
    return localList.filter(r => r.event_id === eventId);
  }
  return localList;
}

export const getEventRegistrations = getAllEventRegistrations;

/**
 * Deletes an event registration
 */
export async function deleteEventRegistration(registrationId: string): Promise<boolean> {
  const list = getLocalRegistrations();
  const filtered = list.filter(r => r.id !== registrationId);
  saveLocalRegistrations(filtered);

  try {
    const { error } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', registrationId);
    if (error) {
      console.warn('Supabase delete registration error:', error);
    }
    return true;
  } catch {
    return true;
  }
}

/**
 * Gets a user's registration by registration code
 */
export async function getEventRegistrationByCode(
  code: string,
  eventId: string = AI_FOR_EDUCATORS_EVENT.id
): Promise<EventRegistration | null> {
  const cleanCode = code.trim().toUpperCase();
  if (!cleanCode) return null;

  const localList = getLocalRegistrations();

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .ilike('registration_code', cleanCode)
      .maybeSingle();
    if (!error && data) {
      return data as EventRegistration;
    }
  } catch (err) {
    console.warn('Supabase code query error:', err);
  }

  // Check local list
  const found = localList.find(r => 
    r.event_id === eventId && (
      (r.registration_code && r.registration_code.toUpperCase() === cleanCode) ||
      r.id.toUpperCase() === cleanCode ||
      r.id.toUpperCase().endsWith(cleanCode)
    )
  );

  return found || null;
}

/**
 * Finds event registration by identifier (Registration Code, Email, or User ID)
 */
export async function findEventRegistration(
  eventId: string,
  identifier: string
): Promise<EventRegistration | null> {
  const clean = identifier.trim();
  if (!clean) return null;

  // 1. If contains @ -> search email
  if (clean.includes('@')) {
    return getUserEventRegistration(eventId, null, clean);
  }

  // 2. Try searching by registration code
  const byCode = await getEventRegistrationByCode(clean, eventId);
  if (byCode) return byCode;

  // 3. Try userId / id
  return getUserEventRegistration(eventId, clean, null);
}

/**
 * Gets a user's registration for a specific event by user_id or email
 */
export async function getUserEventRegistration(
  eventId: string,
  userId?: string | null,
  userEmail?: string | null
): Promise<EventRegistration | null> {
  const localList = getLocalRegistrations();
  
  // Try Supabase first
  try {
    if (userId) {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .maybeSingle();
      if (!error && data) {
        return data as EventRegistration;
      }
    }
    
    if (userEmail) {
      const { data, error } = await supabase
        .from('event_registrations')
        .select('*')
        .eq('event_id', eventId)
        .ilike('email', userEmail.trim())
        .maybeSingle();
      if (!error && data) {
        return data as EventRegistration;
      }
    }
  } catch (err) {
    console.warn('Supabase find registration fallback:', err);
  }

  // Check local cache
  if (userId) {
    const found = localList.find(r => r.event_id === eventId && r.user_id === userId);
    if (found) return found;
  }
  if (userEmail) {
    const found = localList.find(
      r => r.event_id === eventId && r.email.toLowerCase() === userEmail.toLowerCase().trim()
    );
    if (found) return found;
  }

  return null;
}

/**
 * Submits a new registration for the event
 */
export async function registerForEvent(payload: {
  event_id: string;
  event_title: string;
  user_id?: string;
  full_name: string;
  email: string;
  phone: string;
  school_institution: string;
  role_title: string;
  province: string;
  registration_fee?: number;
  continuous_support_opt_in?: boolean;
  payment_method?: 'ecocash' | 'innbucks' | 'card_stripe' | 'bank_transfer' | 'manual_admin' | 'zipit';
  payment_reference?: string;
  proof_of_payment_url?: string;
}): Promise<EventRegistration> {
  const isPaidDirectly = Boolean(payload.payment_reference || payload.proof_of_payment_url);
  const regCode = generateRegistrationCode();
  
  const record: EventRegistration = {
    id: 'evt_reg_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 6),
    registration_code: regCode,
    event_id: payload.event_id,
    event_title: payload.event_title,
    user_id: payload.user_id,
    full_name: payload.full_name.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    school_institution: payload.school_institution.trim() || 'Independent Educator',
    role_title: payload.role_title.trim() || 'Educator',
    province: payload.province || 'Harare',
    registration_fee: payload.registration_fee || 10,
    currency: 'USD',
    continuous_support_opt_in: Boolean(payload.continuous_support_opt_in),
    payment_status: isPaidDirectly ? 'submitted' : 'pending',
    payment_method: payload.payment_method,
    payment_reference: payload.payment_reference?.trim(),
    proof_of_payment_url: payload.proof_of_payment_url,
    paid_at: isPaidDirectly ? new Date().toISOString() : undefined,
    approval_status: 'pending',
    has_entered_event: false,
    entry_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const list = getLocalRegistrations();
  const existingIdx = list.findIndex(r => r.event_id === record.event_id && (
    (record.user_id && r.user_id === record.user_id) ||
    r.email.toLowerCase() === record.email.toLowerCase()
  ));

  if (existingIdx >= 0) {
    list[existingIdx] = { ...list[existingIdx], ...record, id: list[existingIdx].id };
    saveLocalRegistrations(list);
  } else {
    list.unshift(record);
    saveLocalRegistrations(list);
  }

  // Sync with Supabase
  try {
    await supabase.from('event_registrations').insert({
      id: record.id,
      event_id: record.event_id,
      event_title: record.event_title,
      user_id: record.user_id || null,
      full_name: record.full_name,
      email: record.email,
      phone: record.phone,
      school_institution: record.school_institution,
      role_title: record.role_title,
      province: record.province,
      registration_fee: record.registration_fee,
      currency: record.currency,
      continuous_support_opt_in: record.continuous_support_opt_in,
      payment_status: record.payment_status,
      payment_method: record.payment_method || null,
      payment_reference: record.payment_reference || null,
      proof_of_payment_url: record.proof_of_payment_url || null,
      approval_status: record.approval_status
    });
  } catch (err) {
    console.warn('Supabase insert event registration notice:', err);
  }

  return record;
}

/**
 * Submits payment proof / reference for an existing registration
 */
export async function submitRegistrationPayment(
  registrationId: string,
  paymentMethod: 'ecocash' | 'innbucks' | 'card_stripe' | 'bank_transfer' | 'manual_admin' | 'zipit',
  paymentReference: string,
  proofUrl?: string
): Promise<EventRegistration | null> {
  const list = getLocalRegistrations();
  const idx = list.findIndex(r => r.id === registrationId);
  if (idx < 0) return null;

  const updated: EventRegistration = {
    ...list[idx],
    payment_status: 'submitted',
    payment_method: paymentMethod,
    payment_reference: paymentReference.trim(),
    proof_of_payment_url: proofUrl || list[idx].proof_of_payment_url,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  list[idx] = updated;
  saveLocalRegistrations(list);

  try {
    await supabase.from('event_registrations').update({
      payment_status: 'submitted',
      payment_method: paymentMethod,
      payment_reference: paymentReference.trim(),
      proof_of_payment_url: proofUrl || null,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', registrationId);
  } catch (err) {
    console.warn('Supabase update payment notice:', err);
  }

  return updated;
}

/**
 * Admin action: Unified status update (payment status, approval status, admin notes)
 */
export async function updateRegistrationStatus(
  registrationId: string,
  updates: {
    payment_status?: EventPaymentStatus;
    approval_status?: EventApprovalStatus;
    admin_notes?: string;
    rejection_reason?: string;
  }
): Promise<EventRegistration | null> {
  const list = getLocalRegistrations();
  const idx = list.findIndex(r => r.id === registrationId);
  if (idx < 0) return null;

  const current = list[idx];
  const newPayment = updates.payment_status || current.payment_status;
  const newApproval = updates.approval_status || current.approval_status;

  const updated: EventRegistration = {
    ...current,
    payment_status: newPayment,
    approval_status: newApproval,
    admin_notes: updates.admin_notes !== undefined ? updates.admin_notes : current.admin_notes,
    rejection_reason: updates.rejection_reason !== undefined ? updates.rejection_reason : current.rejection_reason,
    paid_at: newPayment === 'verified' && !current.paid_at ? new Date().toISOString() : current.paid_at,
    approved_at: newApproval === 'approved' && !current.approved_at ? new Date().toISOString() : current.approved_at,
    updated_at: new Date().toISOString()
  };

  list[idx] = updated;
  saveLocalRegistrations(list);

  try {
    await supabase.from('event_registrations').update({
      payment_status: updated.payment_status,
      approval_status: updated.approval_status,
      admin_notes: updated.admin_notes,
      rejection_reason: updated.rejection_reason,
      paid_at: updated.paid_at,
      approved_at: updated.approved_at,
      updated_at: updated.updated_at
    }).eq('id', registrationId);
  } catch (err) {
    console.warn('Supabase update registration status error:', err);
  }

  return updated;
}

/**
 * Admin action: Verify or reject payment
 */
export async function updatePaymentVerification(
  registrationId: string,
  newPaymentStatus: EventPaymentStatus,
  adminNotes?: string
): Promise<EventRegistration | null> {
  const list = getLocalRegistrations();
  const idx = list.findIndex(r => r.id === registrationId);
  if (idx < 0) return null;

  const updated: EventRegistration = {
    ...list[idx],
    payment_status: newPaymentStatus,
    admin_notes: adminNotes !== undefined ? adminNotes : list[idx].admin_notes,
    updated_at: new Date().toISOString()
  };

  list[idx] = updated;
  saveLocalRegistrations(list);

  try {
    await supabase.from('event_registrations').update({
      payment_status: newPaymentStatus,
      admin_notes: updated.admin_notes,
      updated_at: new Date().toISOString()
    }).eq('id', registrationId);
  } catch (err) {
    console.warn('Supabase update payment verification error:', err);
  }

  return updated;
}

/**
 * Admin action: Approve or reject participant
 */
export async function updateParticipantApproval(
  registrationId: string,
  newApprovalStatus: EventApprovalStatus,
  adminProfile?: { id: string; name: string } | null,
  rejectionReason?: string
): Promise<EventRegistration | null> {
  const list = getLocalRegistrations();
  const idx = list.findIndex(r => r.id === registrationId);
  if (idx < 0) return null;

  const updated: EventRegistration = {
    ...list[idx],
    approval_status: newApprovalStatus,
    approved_by: newApprovalStatus === 'approved' ? (adminProfile?.id || 'admin') : undefined,
    approved_by_name: newApprovalStatus === 'approved' ? (adminProfile?.name || 'YARA Executive Admin') : undefined,
    approved_at: newApprovalStatus === 'approved' ? new Date().toISOString() : undefined,
    rejection_reason: newApprovalStatus === 'rejected' ? rejectionReason : undefined,
    updated_at: new Date().toISOString()
  };

  list[idx] = updated;
  saveLocalRegistrations(list);

  try {
    await supabase.from('event_registrations').update({
      approval_status: newApprovalStatus,
      approved_by: updated.approved_by,
      approved_by_name: updated.approved_by_name,
      approved_at: updated.approved_at,
      rejection_reason: updated.rejection_reason || null,
      updated_at: new Date().toISOString()
    }).eq('id', registrationId);
  } catch (err) {
    console.warn('Supabase update approval status error:', err);
  }

  return updated;
}

/**
 * Admin action: Instant 1-click verify & approve
 */
export async function instantApproveParticipant(
  registrationId: string,
  adminProfile?: { id: string; name: string } | null
): Promise<EventRegistration | null> {
  const list = getLocalRegistrations();
  const idx = list.findIndex(r => r.id === registrationId);
  if (idx < 0) return null;

  const updated: EventRegistration = {
    ...list[idx],
    payment_status: 'verified',
    approval_status: 'approved',
    approved_by: adminProfile?.id || 'admin',
    approved_by_name: adminProfile?.name || 'YARA Executive Admin',
    approved_at: new Date().toISOString(),
    paid_at: list[idx].paid_at || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  list[idx] = updated;
  saveLocalRegistrations(list);

  try {
    await supabase.from('event_registrations').update({
      payment_status: 'verified',
      approval_status: 'approved',
      approved_by: updated.approved_by,
      approved_by_name: updated.approved_by_name,
      approved_at: updated.approved_at,
      updated_at: new Date().toISOString()
    }).eq('id', registrationId);
  } catch (err) {
    console.warn('Supabase instant approve error:', err);
  }

  return updated;
}

/**
 * Records when an authorized participant enters the live room
 */
export async function recordEventEntry(registrationId: string): Promise<void> {
  const list = getLocalRegistrations();
  const idx = list.findIndex(r => r.id === registrationId);
  if (idx >= 0) {
    list[idx] = {
      ...list[idx],
      has_entered_event: true,
      last_entered_at: new Date().toISOString(),
      entry_count: (list[idx].entry_count || 0) + 1,
      updated_at: new Date().toISOString()
    };
    saveLocalRegistrations(list);
  }

  try {
    await supabase.from('event_registrations').update({
      has_entered_event: true,
      last_entered_at: new Date().toISOString(),
      entry_count: (list[idx]?.entry_count || 1)
    }).eq('id', registrationId);
  } catch {
    // ignore
  }
}

/**
 * Gets a user's registration by email specifically
 */
export async function getEventRegistrationByEmail(
  eventId: string,
  email: string
): Promise<EventRegistration | null> {
  return getUserEventRegistration(eventId, null, email);
}

/**
 * Evaluates whether a user can access the event.
 * Requirement:
 * BOTH conditions must be satisfied:
 * 1. payment_status === "verified"
 * 2. approval_status === "approved"
 */
export async function checkEventAccess(
  param1: EventRegistration | string | null | undefined,
  emailOrUserIdOrCode?: string | null,
  userId?: string | null
): Promise<EventAccessResult> {
  let registration: EventRegistration | null = null;

  if (param1 && typeof param1 === 'object') {
    registration = param1 as EventRegistration;
  } else if (typeof param1 === 'string') {
    const eventId = param1;
    const identifier = emailOrUserIdOrCode || userId;
    if (identifier) {
      registration = await findEventRegistration(eventId, identifier);
    }
  }

  const timeline_status = getEventTimelineStatus();

  if (!registration) {
    return {
      is_granted: false,
      canEnter: false,
      reason: 'unregistered',
      statusType: 'not_registered',
      message: 'You have not registered for this event. Please register and complete your US$10 payment to secure your seat.',
      registration: null,
      timeline_status
    };
  }

  if (registration.approval_status === 'rejected' || registration.payment_status === 'rejected') {
    return {
      is_granted: false,
      canEnter: false,
      reason: 'rejected',
      statusType: 'rejected',
      message: 'Your registration has not been approved. Please contact YARA for assistance.',
      registration,
      timeline_status
    };
  }

  if (registration.payment_status === 'pending') {
    return {
      is_granted: false,
      canEnter: false,
      reason: 'unpaid',
      statusType: 'payment_required',
      message: 'Registration payment required. Please complete your US$10 registration payment before entering the event.',
      registration,
      timeline_status
    };
  }

  if (registration.payment_status === 'submitted') {
    return {
      is_granted: false,
      canEnter: false,
      reason: 'payment_submitted',
      statusType: 'payment_submitted',
      message: 'Your payment has been submitted and is awaiting verification by the YARA admin team.',
      registration,
      timeline_status
    };
  }

  if (registration.payment_status === 'verified' && registration.approval_status === 'pending') {
    return {
      is_granted: false,
      canEnter: false,
      reason: 'payment_verified',
      statusType: 'awaiting_approval',
      message: 'Your payment ($10.00) is verified, and your registration is awaiting final administrator approval.',
      registration,
      timeline_status
    };
  }

  if (registration.payment_status === 'verified' && registration.approval_status === 'approved') {
    return {
      is_granted: true,
      canEnter: true,
      reason: 'approved',
      statusType: 'approved',
      message: 'Your registration is verified and approved. You may enter the live event!',
      registration,
      timeline_status
    };
  }

  return {
    is_granted: false,
    canEnter: false,
    reason: 'payment_verified',
    statusType: 'awaiting_approval',
    message: 'Your registration has been received and is awaiting admin approval.',
    registration,
    timeline_status
  };
}

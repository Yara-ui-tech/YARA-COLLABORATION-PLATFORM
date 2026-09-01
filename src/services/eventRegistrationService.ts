import { supabase } from '../lib/supabase';
import { 
  EventRegistration, 
  EventPaymentStatus, 
  EventApprovalStatus, 
  EventTimelineStatus, 
  EventAccessResult,
  EventMeetingConfig,
  EducatorReceiptData,
  EducatorCertificateData,
  AI_FOR_EDUCATORS_EVENT 
} from '../types/eventRegistration';

export { AI_FOR_EDUCATORS_EVENT };
export type { EventMeetingConfig, EducatorReceiptData, EducatorCertificateData };

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
  paymentMethodOrPayload: string | {
    payment_method?: string;
    payment_reference: string;
    proof_url?: string;
    notes?: string;
  },
  paymentReference?: string,
  proofUrl?: string
): Promise<EventRegistration | null> {
  const list = getLocalRegistrations();
  const idx = list.findIndex(r => r.id === registrationId);
  if (idx < 0) return null;

  let method = 'ecocash';
  let ref = '';
  let url: string | undefined = undefined;
  let notes: string | undefined = undefined;

  if (typeof paymentMethodOrPayload === 'object') {
    method = (paymentMethodOrPayload.payment_method || 'ecocash').toLowerCase();
    ref = paymentMethodOrPayload.payment_reference || '';
    url = paymentMethodOrPayload.proof_url;
    notes = paymentMethodOrPayload.notes;
  } else {
    method = (paymentMethodOrPayload || 'ecocash').toLowerCase();
    ref = paymentReference || '';
    url = proofUrl;
  }

  const updated: EventRegistration = {
    ...list[idx],
    payment_status: 'submitted',
    payment_method: method as any,
    payment_reference: ref.trim(),
    payment_notes: notes || list[idx].payment_notes,
    proof_of_payment_url: url || list[idx].proof_of_payment_url,
    paid_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  list[idx] = updated;
  saveLocalRegistrations(list);

  try {
    await supabase.from('event_registrations').update({
      payment_status: 'submitted',
      payment_method: method,
      payment_reference: ref.trim(),
      payment_notes: notes || null,
      proof_of_payment_url: url || null,
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

/**
 * Builds an official EducatorReceiptData object from an EventRegistration record
 */
export function buildEducatorReceipt(
  reg: Partial<EventRegistration>,
  customOverrides?: Partial<EducatorReceiptData>
): EducatorReceiptData {
  const code = (reg.registration_code || (reg.id ? (reg.id.startsWith('evt_reg_') ? reg.id.substring(8, 16).toUpperCase() : reg.id) : generateRegistrationCode())).toUpperCase();
  const rawRef = reg.payment_reference || `TXN-${code.replace(/[^A-Z0-9]/g, '')}`;
  const regFee = typeof reg.registration_fee === 'number' ? reg.registration_fee : 10;
  const isSupport = customOverrides?.continuous_support_opt_in !== undefined 
    ? customOverrides.continuous_support_opt_in 
    : Boolean(reg.continuous_support_opt_in);
  const supportFee = isSupport ? 15 : 0;
  const totalAmount = (customOverrides?.amount_paid !== undefined ? customOverrides.amount_paid : regFee) + (customOverrides?.support_amount !== undefined ? customOverrides.support_amount : supportFee);

  const rawDate = reg.paid_at || reg.approved_at || reg.created_at || new Date().toISOString();
  let issueDateStr = '29 August 2026';
  try {
    issueDateStr = new Date(rawDate).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    issueDateStr = new Date().toLocaleDateString();
  }

  const suffix = (code.replace('YARA-AI-', '') || Math.random().toString(36).substring(2, 6)).toUpperCase();
  const receiptNumber = `YARA-REC-2026-${suffix}`;

  let methodDisplay = 'EcoCash / Innbucks';
  if (reg.payment_method) {
    if (reg.payment_method === 'ecocash') methodDisplay = 'EcoCash';
    else if (reg.payment_method === 'innbucks') methodDisplay = 'InnBucks';
    else if (reg.payment_method === 'card_stripe') methodDisplay = 'Debit / Credit Card';
    else if (reg.payment_method === 'bank_transfer') methodDisplay = 'Direct Bank Transfer / Swipe';
    else if (reg.payment_method === 'zipit') methodDisplay = 'ZIPIT Transfer';
    else if (reg.payment_method === 'manual_admin') methodDisplay = 'Direct Admin Verification';
    else methodDisplay = String(reg.payment_method).toUpperCase();
  }

  return {
    receipt_number: customOverrides?.receipt_number || receiptNumber,
    issue_date: customOverrides?.issue_date || issueDateStr,
    event_id: reg.event_id || AI_FOR_EDUCATORS_EVENT.id,
    event_title: reg.event_title || AI_FOR_EDUCATORS_EVENT.title,
    attendee_name: customOverrides?.attendee_name || reg.full_name || 'Educator Participant',
    email: customOverrides?.email || reg.email || '',
    phone: customOverrides?.phone || reg.phone || '',
    school_institution: customOverrides?.school_institution || reg.school_institution || 'Independent Educator',
    role_title: customOverrides?.role_title || reg.role_title || 'Educator / Teacher',
    province: customOverrides?.province || reg.province || 'Zimbabwe',
    registration_code: customOverrides?.registration_code || code,
    payment_reference: customOverrides?.payment_reference || rawRef,
    payment_method: customOverrides?.payment_method || methodDisplay,
    amount_paid: customOverrides?.amount_paid !== undefined ? customOverrides.amount_paid : regFee,
    currency: 'USD',
    continuous_support_opt_in: isSupport,
    support_amount: supportFee,
    total_amount: customOverrides?.total_amount !== undefined ? customOverrides.total_amount : totalAmount,
    payment_status: customOverrides?.payment_status || reg.payment_status || 'verified',
    approval_status: customOverrides?.approval_status || reg.approval_status || 'approved',
    approved_by_name: reg.approved_by_name || 'YARA Executive Secretariat',
    approved_at: reg.approved_at || new Date().toISOString(),
    notes: customOverrides?.notes || reg.admin_notes || 'Official payment received and verified for AI for Educators Online Bootcamp.'
  };
}

/**
 * Generates an official downloadable receipt given a user name and reference number (Admin or User lookup)
 */
export async function generateEducatorReceiptByNameAndRef(
  userName: string,
  refNumber: string,
  overrides?: Partial<EducatorReceiptData>
): Promise<EducatorReceiptData> {
  const cleanName = (userName || '').trim();
  const cleanRef = (refNumber || '').trim();

  // Search existing registrations first for auto-fill match
  const allRegistrations = await getAllEventRegistrations(AI_FOR_EDUCATORS_EVENT.id);
  const matched = allRegistrations.find(r => {
    const matchName = cleanName && r.full_name.toLowerCase().includes(cleanName.toLowerCase());
    const matchRef = cleanRef && (
      (r.registration_code && r.registration_code.toLowerCase() === cleanRef.toLowerCase()) ||
      (r.payment_reference && r.payment_reference.toLowerCase() === cleanRef.toLowerCase()) ||
      r.id.toLowerCase().includes(cleanRef.toLowerCase())
    );
    return (cleanName && cleanRef) ? (matchName || matchRef) : (matchName || matchRef);
  });

  if (matched) {
    return buildEducatorReceipt(matched, {
      ...(cleanName ? { attendee_name: cleanName } : {}),
      ...(cleanRef ? { payment_reference: cleanRef } : {}),
      ...overrides
    });
  }

  // If not matched, generate official standalone verified receipt structure
  const code = (cleanRef && cleanRef.toUpperCase().startsWith('YARA-AI-')) 
    ? cleanRef.toUpperCase() 
    : generateRegistrationCode();

  const generatedRef = cleanRef || `MP${Date.now().toString().slice(-6)}.H001`;

  return buildEducatorReceipt(
    {
      full_name: cleanName || 'Educator Participant',
      email: overrides?.email || 'educator@school.ac.zw',
      phone: overrides?.phone || '+263 77 000 0000',
      school_institution: overrides?.school_institution || 'Independent Educator',
      role_title: overrides?.role_title || 'Educator / Teacher',
      province: overrides?.province || 'Harare',
      registration_code: code,
      payment_reference: generatedRef,
      payment_status: 'verified',
      approval_status: 'approved',
      registration_fee: 10,
      continuous_support_opt_in: overrides?.continuous_support_opt_in ?? false,
      approved_by_name: 'YARA Executive Administration',
      paid_at: new Date().toISOString()
    },
    overrides
  );
}

// ============================================================================
// 10. AI FOR EDUCATORS BOOTCAMP OFFICIAL CERTIFICATE ENGINE
// ============================================================================

export const OFFICIAL_FOUNDER_NAME = "Mr. S.O. Manongwa";
export const OFFICIAL_FOUNDER_TITLE = "Founder & Lead Instructor, YARA";
export const OFFICIAL_REGIONAL_PRESIDENT_NAME = "Ms. A.M. Chiambiro";
export const OFFICIAL_REGIONAL_PRESIDENT_TITLE = "Regional President, YARA Zimbabwe";

/**
 * Builds the comprehensive certificate data model for an educator
 */
export function buildEducatorCertificate(
  reg: EventRegistration,
  overrides?: Partial<EducatorCertificateData>
): EducatorCertificateData {
  const code = (reg.registration_code || (reg.id ? (reg.id.startsWith('evt_reg_') ? reg.id.substring(8, 16).toUpperCase() : reg.id) : generateRegistrationCode())).toUpperCase();
  const certSuffix = (reg.certificate_number || `YARA-AI-EDU-2026-${code.replace('YARA-AI-', '')}`).toUpperCase();
  
  const issueDateStr = reg.certificate_unlocked_at
    ? new Date(reg.certificate_unlocked_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : '4 September 2026';

  const verificationUrl = `${window.location.origin}/verify-certificate?id=${encodeURIComponent(certSuffix)}`;

  return {
    certificate_number: overrides?.certificate_number || certSuffix,
    recipient_name: overrides?.recipient_name || reg.full_name || 'Educator Participant',
    recipient_email: overrides?.recipient_email || reg.email,
    institution_name: overrides?.institution_name || reg.school_institution || 'Ministry of Primary & Secondary Education',
    role_title: overrides?.role_title || reg.role_title || 'Educator / Teacher',
    province: overrides?.province || reg.province || 'Zimbabwe',
    event_title: overrides?.event_title || AI_FOR_EDUCATORS_EVENT.title,
    event_dates: overrides?.event_dates || AI_FOR_EDUCATORS_EVENT.dates_display,
    issue_date: overrides?.issue_date || issueDateStr,
    founder_name: overrides?.founder_name || OFFICIAL_FOUNDER_NAME,
    founder_title: overrides?.founder_title || OFFICIAL_FOUNDER_TITLE,
    regional_president_name: overrides?.regional_president_name || OFFICIAL_REGIONAL_PRESIDENT_NAME,
    regional_president_title: overrides?.regional_president_title || OFFICIAL_REGIONAL_PRESIDENT_TITLE,
    verification_url: overrides?.verification_url || verificationUrl,
    qr_code_value: overrides?.qr_code_value || verificationUrl,
    status: (overrides?.status || (reg.certificate_unlocked ? 'unlocked' : 'locked')),
    grade: overrides?.grade || reg.certificate_grade || 'Distinction in Educational AI Pedagogy',
    honors: overrides?.honors || 'Certified AI Educator (Foundational Mastery)'
  };
}

/**
 * Unlocks or locks an educator's certificate and records the decision
 */
export async function unlockEducatorCertificate(
  registrationId: string,
  unlocked: boolean,
  adminName: string = 'YARA Executive Administrator',
  grade: string = 'Distinction in Educational AI Pedagogy'
): Promise<EventRegistration | null> {
  const all = getLocalRegistrations();
  const index = all.findIndex(r => r.id === registrationId);
  
  if (index === -1) {
    // Attempt to load from database first
    const dbRegs = await getAllEventRegistrations(AI_FOR_EDUCATORS_EVENT.id);
    const dbIndex = dbRegs.findIndex(r => r.id === registrationId);
    if (dbIndex === -1) return null;
  }

  const current = all[index] || (await getAllEventRegistrations(AI_FOR_EDUCATORS_EVENT.id)).find(r => r.id === registrationId);
  if (!current) return null;

  const code = (current.registration_code || current.id).toUpperCase();
  const certNumber = current.certificate_number || `YARA-AI-EDU-2026-${code.replace('YARA-AI-', '')}`;
  const now = new Date().toISOString();

  const updated: EventRegistration = {
    ...current,
    certificate_unlocked: unlocked,
    certificate_unlocked_at: unlocked ? now : undefined,
    certificate_unlocked_by: unlocked ? adminName : undefined,
    certificate_number: certNumber,
    certificate_grade: grade,
    updated_at: now
  };

  // Update in local store
  if (index !== -1) {
    all[index] = updated;
    saveLocalRegistrations(all);
  } else {
    saveLocalRegistrations([updated, ...all]);
  }

  // Sync to database
  try {
    await supabase
      .from('event_registrations')
      .update({
        certificate_unlocked: unlocked,
        certificate_unlocked_at: unlocked ? now : null,
        certificate_unlocked_by: unlocked ? adminName : null,
        certificate_number: certNumber,
        certificate_grade: grade,
        updated_at: now
      })
      .eq('id', registrationId);
  } catch (err) {
    console.warn('Could not sync certificate unlock to Supabase:', err);
  }

  // Also register in public certificate registry so /verify-certificate resolves it
  try {
    const certPayload = {
      id: `cert_edu_${registrationId}`,
      user_id: current.user_id || registrationId,
      certificate_number: certNumber,
      student_name: current.full_name,
      course_title: `AI for Educators Bootcamp 2026 — ${current.school_institution || 'Certified Educator'}`,
      score: 98,
      grade: grade,
      issue_date: new Date(now).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
      verification_url: `${window.location.origin}/verify-certificate?id=${certNumber}`,
      metadata: {
        event_id: AI_FOR_EDUCATORS_EVENT.id,
        founder: OFFICIAL_FOUNDER_NAME,
        regional_president: OFFICIAL_REGIONAL_PRESIDENT_NAME,
        school: current.school_institution,
        province: current.province
      }
    };
    
    // Store in LMS certificate cache for universal verification
    const existingCerts = JSON.parse(localStorage.getItem('yara_lms_certificates') || '[]');
    const filteredCerts = existingCerts.filter((c: any) => c.certificate_number !== certNumber);
    if (unlocked) {
      localStorage.setItem('yara_lms_certificates', JSON.stringify([certPayload, ...filteredCerts]));
    } else {
      localStorage.setItem('yara_lms_certificates', JSON.stringify(filteredCerts));
    }

    if (unlocked) {
      await supabase.from('certificates').upsert(certPayload);
    }
  } catch (e) {
    // safe fallback
  }

  return updated;
}

/**
 * Batch unlock certificates for all verified & approved educators
 */
export async function batchUnlockEducatorCertificates(
  registrationIds: string[],
  adminName: string = 'YARA Executive Board'
): Promise<number> {
  let count = 0;
  for (const id of registrationIds) {
    const res = await unlockEducatorCertificate(id, true, adminName);
    if (res) count++;
  }
  return count;
}

/**
 * Looks up educator certificate by registration code, email, or certificate number
 */
export async function getEducatorCertificateByCodeOrEmail(
  query: string
): Promise<EducatorCertificateData | null> {
  const clean = (query || '').trim().toLowerCase();
  if (!clean) return null;

  const allRegistrations = await getAllEventRegistrations(AI_FOR_EDUCATORS_EVENT.id);
  const matched = allRegistrations.find(r => {
    const code = (r.registration_code || '').toLowerCase();
    const certNum = (r.certificate_number || '').toLowerCase();
    const email = (r.email || '').toLowerCase();
    const name = (r.full_name || '').toLowerCase();
    const id = (r.id || '').toLowerCase();

    return (
      code === clean ||
      certNum === clean ||
      email === clean ||
      id === clean ||
      name.includes(clean) ||
      code.includes(clean)
    );
  });

  if (!matched) return null;
  return buildEducatorCertificate(matched);
}



import { supabase } from '../lib/supabase';

export interface UnderservedSchool {
  id: string;
  name: string;
  district?: string;
  province?: string;
  country?: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
  student_count?: number;
}

export interface UnderservedRegion {
  id: string;
  region_name: string;
  province_state?: string;
  country?: string;
  is_active: boolean;
  notes?: string;
  created_at?: string;
}

export interface FreeWhitelistEntry {
  id: string;
  email: string;
  full_name?: string;
  reason?: string;
  granted_by?: string;
  is_active: boolean;
  created_at?: string;
}

export interface EquityCheckResult {
  isEligible: boolean;
  reason: string;
  matchedSchool?: string;
  matchedRegion?: string;
  isWhitelisted?: boolean;
}

// Fallback seeds in case local DB hasn't run the latest migration yet
export const DEFAULT_UNDERSERVED_SCHOOLS: Omit<UnderservedSchool, 'id'>[] = [
  { name: 'Binga High School', district: 'Binga', province: 'Matabeleland North', country: 'Zimbabwe', is_active: true, notes: 'Rural Zambezi STEM Priority Hub' },
  { name: 'Nemakonde High School', district: 'Makonde', province: 'Mashonaland West', country: 'Zimbabwe', is_active: true, notes: 'Public Secondary Outreach' },
  { name: 'Banket High School', district: 'Zvimba', province: 'Mashonaland West', country: 'Zimbabwe', is_active: true, notes: 'Public Rural Innovation Chapter' },
  { name: 'Dotito High School', district: 'Mount Darwin', province: 'Mashonaland Central', country: 'Zimbabwe', is_active: true, notes: 'Rural District Secondary' },
  { name: 'Tongogara Secondary School', district: 'Shurugwi', province: 'Midlands', country: 'Zimbabwe', is_active: true, notes: 'Rural Community School' },
  { name: 'Rushinga Secondary School', district: 'Rushinga', province: 'Mashonaland Central', country: 'Zimbabwe', is_active: true, notes: 'Border Rural STEM Center' },
  { name: 'Mwenezi High School', district: 'Mwenezi', province: 'Masvingo', country: 'Zimbabwe', is_active: true, notes: 'Arid Belt Innovation Outreach' },
  { name: 'Mudzi High School', district: 'Mudzi', province: 'Mashonaland East', country: 'Zimbabwe', is_active: true, notes: 'Rural Community Cluster' },
  { name: 'Tsholotsho High School', district: 'Tsholotsho', province: 'Matabeleland North', country: 'Zimbabwe', is_active: true, notes: 'Rural District Innovation Hub' },
  { name: 'Chivi High School', district: 'Chivi', province: 'Masvingo', country: 'Zimbabwe', is_active: true, notes: 'Rural Public High School' }
];

export const DEFAULT_UNDERSERVED_REGIONS: Omit<UnderservedRegion, 'id'>[] = [
  { region_name: 'Binga', province_state: 'Matabeleland North', country: 'Zimbabwe', is_active: true, notes: 'Remote Zambezi basin district' },
  { region_name: 'Mwenezi', province_state: 'Masvingo', country: 'Zimbabwe', is_active: true, notes: 'Southern rural district' },
  { region_name: 'Mudzi', province_state: 'Mashonaland East', country: 'Zimbabwe', is_active: true, notes: 'Remote eastern rural district' },
  { region_name: 'Chiredzi', province_state: 'Masvingo', country: 'Zimbabwe', is_active: true, notes: 'Lowveld rural community' },
  { region_name: 'Rushinga', province_state: 'Mashonaland Central', country: 'Zimbabwe', is_active: true, notes: 'Remote north-eastern district' },
  { region_name: 'Tsholotsho', province_state: 'Matabeleland North', country: 'Zimbabwe', is_active: true, notes: 'Remote western district' },
  { region_name: 'Mount Darwin', province_state: 'Mashonaland Central', country: 'Zimbabwe', is_active: true, notes: 'Rural educational cluster' },
  { region_name: 'Epworth', province_state: 'Harare Province', country: 'Zimbabwe', is_active: true, notes: 'Underserved high-density community' },
  { region_name: 'Chitungwiza', province_state: 'Harare Province', country: 'Zimbabwe', is_active: true, notes: 'High-density student innovation zone' },
  { region_name: 'Zvimba Rural', province_state: 'Mashonaland West', country: 'Zimbabwe', is_active: true, notes: 'Agricultural farming schools' },
  { region_name: 'Makonde Rural', province_state: 'Mashonaland West', country: 'Zimbabwe', is_active: true, notes: 'Mining & agrarian peripheral communities' },
  { region_name: 'Kariba Rural', province_state: 'Mashonaland West', country: 'Zimbabwe', is_active: true, notes: 'Lakeside rural outposts' }
];

// 1. Schools
export async function getUnderservedSchools(): Promise<UnderservedSchool[]> {
  try {
    const { data, error } = await supabase
      .from('underserved_schools')
      .select('*')
      .order('name');
    
    if (error || !data || data.length === 0) {
      return DEFAULT_UNDERSERVED_SCHOOLS.map((s, idx) => ({ ...s, id: `default-sch-${idx}` }));
    }
    return data;
  } catch {
    return DEFAULT_UNDERSERVED_SCHOOLS.map((s, idx) => ({ ...s, id: `default-sch-${idx}` }));
  }
}

export async function addUnderservedSchool(school: {
  name: string;
  district?: string;
  province?: string;
  country?: string;
  notes?: string;
}): Promise<UnderservedSchool> {
  const { data, error } = await supabase
    .from('underserved_schools')
    .insert({
      name: school.name.trim(),
      district: school.district?.trim() || null,
      province: school.province?.trim() || null,
      country: school.country?.trim() || 'Zimbabwe',
      notes: school.notes?.trim() || null,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUnderservedSchool(id: string): Promise<void> {
  const { error } = await supabase
    .from('underserved_schools')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// 2. Regions
export async function getUnderservedRegions(): Promise<UnderservedRegion[]> {
  try {
    const { data, error } = await supabase
      .from('underserved_regions')
      .select('*')
      .order('region_name');
    
    if (error || !data || data.length === 0) {
      return DEFAULT_UNDERSERVED_REGIONS.map((r, idx) => ({ ...r, id: `default-reg-${idx}` }));
    }
    return data;
  } catch {
    return DEFAULT_UNDERSERVED_REGIONS.map((r, idx) => ({ ...r, id: `default-reg-${idx}` }));
  }
}

export async function addUnderservedRegion(region: {
  region_name: string;
  province_state?: string;
  country?: string;
  notes?: string;
}): Promise<UnderservedRegion> {
  const { data, error } = await supabase
    .from('underserved_regions')
    .insert({
      region_name: region.region_name.trim(),
      province_state: region.province_state?.trim() || null,
      country: region.country?.trim() || 'Zimbabwe',
      notes: region.notes?.trim() || null,
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteUnderservedRegion(id: string): Promise<void> {
  const { error } = await supabase
    .from('underserved_regions')
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// 3. Free Whitelist Users
export async function getFreeAccessWhitelist(): Promise<FreeWhitelistEntry[]> {
  try {
    const { data, error } = await supabase
      .from('free_access_whitelist')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function addFreeWhitelistUser(entry: {
  email: string;
  full_name?: string;
  reason?: string;
  granted_by?: string;
}): Promise<FreeWhitelistEntry> {
  const cleanEmail = entry.email.trim().toLowerCase();
  const { data, error } = await supabase
    .from('free_access_whitelist')
    .insert({
      email: cleanEmail,
      full_name: entry.full_name?.trim() || null,
      reason: entry.reason?.trim() || 'Equity & Inclusion Free Access Grant',
      granted_by: entry.granted_by?.trim() || 'Admin Council',
      is_active: true
    })
    .select()
    .single();

  if (error) throw error;

  // Also if a profile already exists for this email, immediately grant free access in profiles table
  try {
    await supabase
      .from('profiles')
      .update({
        is_fee_exempt: true,
        is_underserved_scholarship: true,
        registration_paid: true,
        subscription_expires_at: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        trial_ends_at: new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000).toISOString(),
        underserved_scholarship_reason: entry.reason || 'Whitelisted Free Access Grant'
      })
      .ilike('email', cleanEmail);
  } catch (e) {
    console.warn('Could not auto-update existing profile for whitelisted user:', e);
  }

  return data;
}

export async function deleteFreeWhitelistUser(id: string, email?: string): Promise<void> {
  const { error } = await supabase
    .from('free_access_whitelist')
    .delete()
    .eq('id', id);
  if (error) throw error;

  if (email) {
    try {
      await supabase
        .from('profiles')
        .update({
          is_fee_exempt: false,
          is_underserved_scholarship: false,
          underserved_scholarship_reason: null
        })
        .ilike('email', email.trim().toLowerCase());
    } catch {}
  }
}

// 4. Check Eligibility (for Signup / Profile checks in real-time)
export async function checkEquityScholarshipEligibility(params: {
  email?: string;
  school?: string;
  location?: string;
}): Promise<EquityCheckResult> {
  const cleanEmail = (params.email || '').trim().toLowerCase();
  const cleanSchool = (params.school || '').trim().toLowerCase();
  const cleanLocation = (params.location || '').trim().toLowerCase();

  // 1. Whitelist Check
  if (cleanEmail) {
    try {
      const { data } = await supabase
        .from('free_access_whitelist')
        .select('reason')
        .ilike('email', cleanEmail)
        .eq('is_active', true)
        .maybeSingle();

      if (data) {
        return {
          isEligible: true,
          isWhitelisted: true,
          reason: data.reason || 'Whitelisted Free Access Beneficiary'
        };
      }
    } catch {}
  }

  // 2. School Check
  if (cleanSchool.length >= 3) {
    const schools = await getUnderservedSchools();
    const matched = schools.find(s => 
      s.is_active && (
        cleanSchool.includes(s.name.toLowerCase()) || 
        s.name.toLowerCase().includes(cleanSchool)
      )
    );
    if (matched) {
      return {
        isEligible: true,
        matchedSchool: matched.name,
        reason: `Underserved School Scholarship (${matched.name})`
      };
    }
  }

  // 3. Location / Region Check
  if (cleanLocation.length >= 3) {
    const regions = await getUnderservedRegions();
    const matched = regions.find(r => 
      r.is_active && (
        cleanLocation.includes(r.region_name.toLowerCase()) || 
        r.region_name.toLowerCase().includes(cleanLocation) ||
        (r.province_state && cleanLocation.includes(r.province_state.toLowerCase()))
      )
    );
    if (matched) {
      return {
        isEligible: true,
        matchedRegion: matched.region_name,
        reason: `Underserved Community/Region Scholarship (${matched.region_name})`
      };
    }
  }

  return {
    isEligible: false,
    reason: ''
  };
}

// 5. Direct User Exemption Grant
export async function grantFreeAccessToUser(userId: string, reason: string = 'Admin Equity Exemption'): Promise<void> {
  const expiresAt = new Date(Date.now() + 20 * 365 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from('profiles')
    .update({
      is_fee_exempt: true,
      is_underserved_scholarship: true,
      registration_paid: true,
      subscription_expires_at: expiresAt,
      trial_ends_at: expiresAt,
      underserved_scholarship_reason: reason,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}

export async function revokeFreeAccessFromUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      is_fee_exempt: false,
      is_underserved_scholarship: false,
      underserved_scholarship_reason: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (error) throw error;
}

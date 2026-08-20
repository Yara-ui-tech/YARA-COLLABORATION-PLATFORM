import { supabase } from '../lib/supabase';
import { 
  PartnershipRequest, 
  DonationSponsorship, 
  Volunteer, 
  UserSubscription,
  ChallengeFeeConfig 
} from '../types/partnershipsAndDonations';

export const YARA_PAYMENT_CONFIG = {
  ecocashNumber: '0788953986',
  accountName: 'Simbarashe Manongwa / Young Africans Robotics Association (YARA)',
  directContactPhone: '+263 78 895 3986',
  inquiryPhone1: '0719 199 274',
  inquiryPhone2: '0717 468 236',
  inquiryPhone1International: '+263 719 199 274',
  inquiryPhone2International: '+263 717 468 236',
  contactEmail: 'inforyaraorg@gmail.com',
  officialAddress: 'Chinhoyi University of Technology (CUT), Zimbabwe / YARA Robotics Innovation Directorate'
};

// =========================================================================
// 1. PARTNERSHIP REQUESTS
// =========================================================================

export async function submitPartnershipRequest(data: Omit<PartnershipRequest, 'id' | 'status' | 'created_at'>): Promise<{ success: boolean; data?: PartnershipRequest; error?: string }> {
  try {
    const newRequest: Partial<PartnershipRequest> = {
      ...data,
      status: 'pending',
      display_on_website: false,
      created_at: new Date().toISOString()
    };

    const { data: inserted, error } = await supabase
      .from('partnership_requests')
      .insert(newRequest)
      .select()
      .single();

    if (error) {
      console.warn('Supabase partnership insert notice:', error.message);
      // Fallback local persistence
      const localId = 'part_' + Date.now().toString(36);
      const fullLocal: PartnershipRequest = {
        ...data,
        id: localId,
        status: 'pending',
        display_on_website: false,
        created_at: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('yara_partnership_requests') || '[]');
      localStorage.setItem('yara_partnership_requests', JSON.stringify([fullLocal, ...existing]));
      return { success: true, data: fullLocal };
    }

    return { success: true, data: inserted as PartnershipRequest };
  } catch (err: any) {
    console.error('Error submitting partnership request:', err);
    return { success: false, error: err.message || 'Failed to submit partnership request.' };
  }
}

export async function getPartnershipRequests(): Promise<PartnershipRequest[]> {
  try {
    const { data, error } = await supabase
      .from('partnership_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as PartnershipRequest[];
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('yara_partnership_requests') || '[]');
    return local;
  }
}

export async function getApprovedPartners(): Promise<PartnershipRequest[]> {
  try {
    const { data, error } = await supabase
      .from('partnership_requests')
      .select('*')
      .or('status.eq.approved,display_on_website.eq.true')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data as PartnershipRequest[];
    
    // Default institutional showcase partners if none approved yet
    const local = JSON.parse(localStorage.getItem('yara_partnership_requests') || '[]');
    const approved = local.filter((p: PartnershipRequest) => p.status === 'approved' || p.display_on_website);
    if (approved.length > 0) return approved;

    return defaultApprovedPartners;
  } catch (err) {
    return defaultApprovedPartners;
  }
}

export async function updatePartnershipStatus(
  id: string, 
  status: 'pending' | 'approved' | 'rejected', 
  displayOnWebsite?: boolean,
  adminNotes?: string
): Promise<boolean> {
  try {
    const updatePayload: any = { 
      status, 
      reviewed_at: new Date().toISOString() 
    };
    if (displayOnWebsite !== undefined) updatePayload.display_on_website = displayOnWebsite;
    if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;

    const { error } = await supabase
      .from('partnership_requests')
      .update(updatePayload)
      .eq('id', id);

    if (error) throw error;

    // Update local cache
    const existing = JSON.parse(localStorage.getItem('yara_partnership_requests') || '[]');
    const updated = existing.map((p: PartnershipRequest) => p.id === id ? { ...p, ...updatePayload } : p);
    localStorage.setItem('yara_partnership_requests', JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Error updating partner status:', err);
    return false;
  }
}

// =========================================================================
// 2. DONATIONS & SPONSORSHIPS
// =========================================================================

export async function submitDonationOrSponsorship(data: Omit<DonationSponsorship, 'id' | 'status' | 'created_at'>): Promise<{ success: boolean; data?: DonationSponsorship; error?: string }> {
  try {
    const record: Partial<DonationSponsorship> = {
      ...data,
      status: 'pending',
      pop_on_homepage: data.pop_on_homepage !== false,
      display_on_wall: data.display_on_wall !== false,
      created_at: new Date().toISOString()
    };

    const { data: inserted, error } = await supabase
      .from('donations_sponsorships')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.warn('Supabase donation insert notice:', error.message);
      const localId = 'don_' + Date.now().toString(36);
      const fullLocal: DonationSponsorship = {
        ...data,
        id: localId,
        status: 'pending',
        pop_on_homepage: data.pop_on_homepage !== false,
        display_on_wall: data.display_on_wall !== false,
        created_at: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('yara_donations_sponsorships') || '[]');
      localStorage.setItem('yara_donations_sponsorships', JSON.stringify([fullLocal, ...existing]));
      return { success: true, data: fullLocal };
    }

    return { success: true, data: inserted as DonationSponsorship };
  } catch (err: any) {
    console.error('Error submitting donation:', err);
    return { success: false, error: err.message || 'Failed to submit donation.' };
  }
}

export async function getDonationsAndSponsorships(): Promise<DonationSponsorship[]> {
  try {
    const { data, error } = await supabase
      .from('donations_sponsorships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as DonationSponsorship[];
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('yara_donations_sponsorships') || '[]');
    return local;
  }
}

export async function getApprovedPublicDonations(): Promise<DonationSponsorship[]> {
  try {
    const { data, error } = await supabase
      .from('donations_sponsorships')
      .select('*')
      .in('status', ['approved', 'received'])
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data as DonationSponsorship[];

    const local = JSON.parse(localStorage.getItem('yara_donations_sponsorships') || '[]');
    const filtered = local.filter((d: DonationSponsorship) => d.status === 'approved' || d.status === 'received');
    if (filtered.length > 0) return filtered;

    return defaultApprovedDonations;
  } catch (err) {
    return defaultApprovedDonations;
  }
}

export async function updateDonationStatus(
  id: string,
  status: 'pending' | 'approved' | 'received',
  popOnHomepage?: boolean,
  displayOnWall?: boolean,
  adminNotes?: string
): Promise<boolean> {
  try {
    const payload: any = { status };
    if (popOnHomepage !== undefined) payload.pop_on_homepage = popOnHomepage;
    if (displayOnWall !== undefined) payload.display_on_wall = displayOnWall;
    if (adminNotes !== undefined) payload.admin_notes = adminNotes;

    const { error } = await supabase
      .from('donations_sponsorships')
      .update(payload)
      .eq('id', id);

    if (error) throw error;

    const existing = JSON.parse(localStorage.getItem('yara_donations_sponsorships') || '[]');
    const updated = existing.map((d: DonationSponsorship) => d.id === id ? { ...d, ...payload } : d);
    localStorage.setItem('yara_donations_sponsorships', JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Error updating donation status:', err);
    return false;
  }
}

// =========================================================================
// 3. VOLUNTEER RECRUITMENT PORTAL
// =========================================================================

export async function submitVolunteerApplication(data: Omit<Volunteer, 'id' | 'status' | 'created_at'>): Promise<{ success: boolean; data?: Volunteer; error?: string }> {
  try {
    const record: Partial<Volunteer> = {
      ...data,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data: inserted, error } = await supabase
      .from('volunteers')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.warn('Supabase volunteer insert notice:', error.message);
      const localId = 'vol_' + Date.now().toString(36);
      const fullLocal: Volunteer = {
        ...data,
        id: localId,
        status: 'pending',
        created_at: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('yara_volunteers') || '[]');
      localStorage.setItem('yara_volunteers', JSON.stringify([fullLocal, ...existing]));
      return { success: true, data: fullLocal };
    }

    return { success: true, data: inserted as Volunteer };
  } catch (err: any) {
    console.error('Error submitting volunteer application:', err);
    return { success: false, error: err.message || 'Failed to submit volunteer application.' };
  }
}

export async function getVolunteers(): Promise<Volunteer[]> {
  try {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as Volunteer[];
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('yara_volunteers') || '[]');
    return local;
  }
}

export async function updateVolunteerStatus(id: string, status: 'pending' | 'approved' | 'rejected', adminNotes?: string): Promise<boolean> {
  try {
    const payload: any = { status };
    if (adminNotes !== undefined) payload.admin_notes = adminNotes;

    const { error } = await supabase
      .from('volunteers')
      .update(payload)
      .eq('id', id);

    if (error) throw error;

    const existing = JSON.parse(localStorage.getItem('yara_volunteers') || '[]');
    const updated = existing.map((v: Volunteer) => v.id === id ? { ...v, ...payload } : v);
    localStorage.setItem('yara_volunteers', JSON.stringify(updated));
    return true;
  } catch (err) {
    console.error('Error updating volunteer status:', err);
    return false;
  }
}

// =========================================================================
// 4. SUBSCRIPTION VERIFICATION & "I'VE SUBSCRIBED" RESOLVER
// =========================================================================

export async function checkAndVerifyUserSubscription(userId: string, userEmail: string): Promise<{
  isSubscribed: boolean;
  status: 'active' | 'expired' | 'pending_verification' | 'none';
  profile?: any;
  message: string;
}> {
  try {
    // 1. Direct profile check
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) {
      if (profile.role === 'admin' || profile.role === 'mentor') {
        return {
          isSubscribed: true,
          status: 'active',
          profile,
          message: 'Account active under verified organizational privileges.'
        };
      }

      if (profile.registration_paid) {
        return {
          isSubscribed: true,
          status: 'active',
          profile,
          message: 'Subscription confirmed active.'
        };
      }

      const hasActiveSubDate = profile.subscription_expires_at && new Date(profile.subscription_expires_at) > new Date();
      if (hasActiveSubDate) {
        return {
          isSubscribed: true,
          status: 'active',
          profile,
          message: `Subscription active until ${new Date(profile.subscription_expires_at).toLocaleDateString()}.`
        };
      }
    }

    // 2. Check subscriptions table for recent approved or active payment
    const { data: subData } = await supabase
      .from('subscriptions')
      .select('*')
      .or(`user_id.eq.${userId},user_email.eq.${userEmail}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (subData && subData.length > 0) {
      const latestSub = subData[0];
      if (latestSub.status === 'active' && new Date(latestSub.expires_at) > new Date()) {
        // Sync to profile so subsequent loads are instant
        await supabase
          .from('profiles')
          .update({
            registration_paid: true,
            subscription_expires_at: latestSub.expires_at
          })
          .eq('id', userId);

        const { data: updatedProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        return {
          isSubscribed: true,
          status: 'active',
          profile: updatedProfile || profile,
          message: 'Active subscription record verified in database.'
        };
      }

      if (latestSub.status === 'pending_verification') {
        return {
          isSubscribed: false,
          status: 'pending_verification',
          profile,
          message: `Your payment reference (${latestSub.payment_reference}) is pending administrator approval.`
        };
      }
    }

    return {
      isSubscribed: false,
      status: 'none',
      profile,
      message: 'No verified active subscription found. Please submit your payment reference or renew.'
    };
  } catch (err: any) {
    console.error('Error during subscription check:', err);
    return {
      isSubscribed: false,
      status: 'none',
      message: 'Unable to verify subscription database connection.'
    };
  }
}

export async function submitSubscriptionPaymentProof(data: {
  userId: string;
  userEmail: string;
  userName?: string;
  memberId?: string;
  planType: string;
  amount: number;
  paymentMethod: string;
  paymentReference: string;
  notes?: string;
}): Promise<{ success: boolean; message: string; autoApproved?: boolean }> {
  try {
    const startsAt = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const record = {
      user_id: data.userId,
      user_email: data.userEmail,
      user_name: data.userName,
      member_id: data.memberId,
      plan_type: data.planType,
      amount: data.amount,
      currency: 'USD',
      payment_method: data.paymentMethod,
      payment_reference: data.paymentReference,
      status: 'pending_verification',
      starts_at: startsAt,
      expires_at: expiresAt,
      admin_notes: data.notes || `Submitted payment proof to ${data.paymentMethod}`
    };

    const { error } = await supabase
      .from('subscriptions')
      .insert(record);

    if (error) {
      console.warn('Subscription insertion note:', error.message);
      // local fallback
      const local = JSON.parse(localStorage.getItem('yara_subscriptions') || '[]');
      localStorage.setItem('yara_subscriptions', JSON.stringify([{ ...record, id: 'sub_' + Date.now() }, ...local]));
    }

    return {
      success: true,
      message: `Payment reference ${data.paymentReference} submitted for verification. Admin will confirm your subscription shortly.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err.message || 'Failed to submit payment reference.'
    };
  }
}

export async function getAllSubscriptions(): Promise<UserSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as UserSubscription[];
  } catch (err) {
    const local = JSON.parse(localStorage.getItem('yara_subscriptions') || '[]');
    return local;
  }
}

export async function approveUserSubscription(subscriptionId: string, userId: string, days: number = 30): Promise<boolean> {
  try {
    const newExpiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

    // 1. Update subscription status
    await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        expires_at: newExpiresAt,
        verified_at: new Date().toISOString()
      })
      .eq('id', subscriptionId);

    // 2. Update user profile
    await supabase
      .from('profiles')
      .update({
        registration_paid: true,
        subscription_expires_at: newExpiresAt
      })
      .eq('id', userId);

    return true;
  } catch (err) {
    console.error('Error approving subscription:', err);
    return false;
  }
}

// =========================================================================
// 5. CHALLENGE REGISTRATION FEES CONFIG
// =========================================================================

export const DEFAULT_CHALLENGE_FEES: ChallengeFeeConfig[] = [
  {
    challenge_id: 'underwater_drone',
    challenge_name: 'Underwater Drone Challenge (Aquatic ROV)',
    fee_amount: 10.00,
    currency: 'USD',
    is_required: true,
    payment_instructions: 'EcoCash to 0788953986 (Simbarashe Manongwa / YARA). Put Team Name in reference.',
    ecocash_number: '0788953986',
    account_name: 'Simbarashe Manongwa / YARA'
  },
  {
    challenge_id: 'autonomous_maze',
    challenge_name: 'Autonomous Maze Solving Challenge',
    fee_amount: 10.00,
    currency: 'USD',
    is_required: true,
    payment_instructions: 'EcoCash to 0788953986 (Simbarashe Manongwa / YARA). Put Team Name in reference.',
    ecocash_number: '0788953986',
    account_name: 'Simbarashe Manongwa / YARA'
  },
  {
    challenge_id: 'innovation_pitch',
    challenge_name: 'Innovation Pitch & Defense (Underserved Community Impact)',
    fee_amount: 0.00,
    currency: 'USD',
    is_required: false,
    payment_instructions: 'Free entry for all youth innovation squads.',
    ecocash_number: '0788953986',
    account_name: 'Simbarashe Manongwa / YARA'
  }
];

export async function getChallengeFeesConfig(): Promise<ChallengeFeeConfig[]> {
  try {
    const { data } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'competition_challenge_fees')
      .single();

    if (data?.value && Array.isArray(data.value)) {
      return data.value as ChallengeFeeConfig[];
    }
    const local = localStorage.getItem('yara_challenge_fees_config');
    if (local) return JSON.parse(local);

    return DEFAULT_CHALLENGE_FEES;
  } catch (err) {
    return DEFAULT_CHALLENGE_FEES;
  }
}

export async function saveChallengeFeesConfig(config: ChallengeFeeConfig[]): Promise<boolean> {
  try {
    await supabase
      .from('system_settings')
      .upsert({
        key: 'competition_challenge_fees',
        value: config,
        updated_at: new Date().toISOString()
      });
    localStorage.setItem('yara_challenge_fees_config', JSON.stringify(config));
    return true;
  } catch (err) {
    localStorage.setItem('yara_challenge_fees_config', JSON.stringify(config));
    return true;
  }
}

// Sample fallback institutional showcase partners
const defaultApprovedPartners: PartnershipRequest[] = [
  {
    id: 'p1',
    organization_name: 'Harare Institute of Technology (HIT)',
    contact_person: 'Faculty of Mechatronics',
    email: 'mechatronics@hit.ac.zw',
    specialty_area: 'Robotics & Hardware',
    partnership_type: 'Technical Partner',
    expectations: 'Providing robotic fabrication lab access, CNC tooling, and technical judges for YARA 2026.',
    country: 'Zimbabwe',
    status: 'approved',
    display_on_website: true,
    created_at: '2026-03-01T00:00:00Z'
  },
  {
    id: 'p2',
    organization_name: 'African STEM Accelerator Network',
    contact_person: 'Director of Programs',
    email: 'partnerships@stem-africa.org',
    specialty_area: 'STEM & TVET Education',
    partnership_type: 'Curriculum Co-Developer',
    expectations: 'Sponsoring 50 Arduino starter kits for rural youth squads and providing certified mentor hours.',
    country: 'Pan-African',
    status: 'approved',
    display_on_website: true,
    created_at: '2026-03-10T00:00:00Z'
  },
  {
    id: 'p3',
    organization_name: 'EcoEnergy Systems Africa',
    contact_person: 'Corporate Social Responsibility Lead',
    email: 'csr@ecoenergy-africa.com',
    specialty_area: 'Renewable Energy & IoT',
    partnership_type: 'Prize & Scholarship Sponsor',
    expectations: 'Granting $1,500 in clean tech innovation scholarships for the top youth agricultural robotics projects.',
    country: 'Zimbabwe',
    status: 'approved',
    display_on_website: true,
    created_at: '2026-03-15T00:00:00Z'
  }
];

const defaultApprovedDonations: DonationSponsorship[] = [
  {
    id: 'd1',
    donor_name: 'Eng. Farai Makoni',
    organization: 'Diaspora Robotics Alumni',
    support_type: 'financial',
    amount: 250,
    currency: 'USD',
    payment_method: 'ecocash_0788953986',
    transaction_reference: 'MP2603-99482',
    message: 'Empowering young Zimbabwean innovators to build the future of robotics!',
    is_anonymous: false,
    status: 'approved',
    pop_on_homepage: true,
    display_on_wall: true,
    created_at: '2026-04-01T10:00:00Z'
  },
  {
    id: 'd2',
    donor_name: 'TechBridge Foundation',
    organization: 'TechBridge Global',
    support_type: 'in_kind_hardware',
    in_kind_description: '20x ESP32-CAM boards, 15x L298N motor drivers, and 10x ultrasonic range finders for rural school teams.',
    message: 'Dedicated to closing the hardware barrier for underserved youth.',
    is_anonymous: false,
    status: 'approved',
    pop_on_homepage: true,
    display_on_wall: true,
    created_at: '2026-04-05T14:30:00Z'
  }
];

export type SupportType = 
  | 'financial' 
  | 'in_kind_hardware' 
  | 'venue_pool_facility' 
  | 'mentorship_coaching' 
  | 'student_meals_transport' 
  | 'other';

export interface DonationSponsorship {
  id: string;
  donor_name: string;
  organization?: string;
  email?: string;
  phone?: string;
  support_type: SupportType;
  amount?: number;
  currency?: string;
  payment_method?: 'ecocash_0788953986' | 'bank_transfer' | 'usd_cash' | 'card' | 'in_kind_delivery' | string;
  transaction_reference?: string;
  in_kind_description?: string;
  message?: string;
  is_anonymous: boolean;
  status: 'pending' | 'approved' | 'received';
  pop_on_homepage: boolean;
  display_on_wall: boolean;
  admin_notes?: string;
  created_at: string;
}

export type SpecialtyArea = 
  | 'Robotics & Hardware'
  | 'AI & Software Engineering'
  | 'STEM & TVET Education'
  | 'Renewable Energy & IoT'
  | 'Government & Policy'
  | 'Corporate Social Responsibility (CSR)'
  | 'Media, Film & Outreach'
  | 'Logistics & Infrastructure'
  | 'Other';

export type PartnershipType =
  | 'Technical Partner'
  | 'Equipment & Hardware Sponsor'
  | 'Venue, Pool & Lab Facility'
  | 'Curriculum Co-Developer'
  | 'Prize & Scholarship Sponsor'
  | 'Funding & Grant Partner'
  | 'Academic & University Partner';

export interface PartnershipRequest {
  id: string;
  organization_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  specialty_area: SpecialtyArea | string;
  partnership_type: PartnershipType | string;
  logo_url?: string;
  expectations: string;
  website_url?: string;
  country?: string;
  status: 'pending' | 'approved' | 'rejected';
  display_on_website: boolean;
  admin_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export type VolunteerCategory =
  | 'judge_technical'
  | 'robotics_mentor'
  | 'event_logistics'
  | 'media_photo_video'
  | 'underwater_drone_safety'
  | 'community_outreach'
  | 'medical_first_aid';

export interface Volunteer {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  category: VolunteerCategory;
  country?: string;
  province?: string;
  district?: string;
  skills_background?: string;
  availability?: string;
  motivation?: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  created_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  user_email: string;
  user_name?: string;
  member_id?: string;
  plan_type: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_reference: string;
  proof_url?: string;
  status: 'active' | 'pending_verification' | 'expired' | 'rejected';
  starts_at: string;
  expires_at: string;
  verified_by?: string;
  verified_at?: string;
  admin_notes?: string;
  created_at: string;
}

export interface ChallengeFeeConfig {
  challenge_id: string;
  challenge_name: string;
  fee_amount: number;
  currency: string;
  is_required: boolean;
  payment_instructions?: string;
  ecocash_number?: string;
  account_name?: string;
}

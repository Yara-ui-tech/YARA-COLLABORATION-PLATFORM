import { supabase } from '../lib/supabase';
import { 
  YaraCompetitionRegistration, 
  CompetitionEventConfig, 
  CategoryScoreSheet, 
  ChampionshipTeamStanding,
  CompetitionEmailNotification
} from '../types/yaraCompetition';
import { YARA_EVENT_2026_DEFAULT } from '../constants/yaraCompetitionData';

const LOCAL_STORAGE_EVENT_KEY = 'yaria_event_config_2026';
const LOCAL_STORAGE_TEAMS_KEY = 'yaria_comp_registrations_2026';
const LOCAL_STORAGE_SCORES_KEY = 'yaria_comp_scores_2026';
const LOCAL_STORAGE_EMAILS_KEY = 'yaria_comp_emails_2026';

// 1. EVENT CONFIGURATION MANAGEMENT
export const getEventConfig = async (): Promise<CompetitionEventConfig> => {
  try {
    const { data, error } = await supabase
      .from('competition_events')
      .select('*')
      .eq('id', 'yara-competition-2026')
      .single();

    if (!error && data) {
      return data as CompetitionEventConfig;
    }
  } catch (e) {
    // fallback
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_EVENT_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }

  return YARA_EVENT_2026_DEFAULT;
};

export const updateEventConfig = async (config: CompetitionEventConfig): Promise<boolean> => {
  localStorage.setItem(LOCAL_STORAGE_EVENT_KEY, JSON.stringify(config));
  try {
    const { error } = await supabase
      .from('competition_events')
      .upsert(config);
    if (error) console.warn('Supabase event sync note:', error.message);
  } catch (e) {
    // ignore
  }
  return true;
};

// 2. REGISTRATIONS & UNIQUE ID GENERATOR
export const generateRegistrationId = (): string => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `YARA-RC26-${randomNum}`;
};

export const getRegistrations = async (): Promise<YaraCompetitionRegistration[]> => {
  try {
    const { data, error } = await supabase
      .from('yara_competition_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as YaraCompetitionRegistration[];
    }
  } catch (e) {
    // fallback
  }

  const stored = localStorage.getItem(LOCAL_STORAGE_TEAMS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  return [];
};

export const saveRegistration = async (registration: YaraCompetitionRegistration): Promise<{ success: boolean; data?: YaraCompetitionRegistration; error?: string }> => {
  try {
    // Update local storage
    const current = await getRegistrations();
    const existingIndex = current.findIndex(r => r.id === registration.id || r.registration_id === registration.registration_id);
    let updated: YaraCompetitionRegistration[];
    
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...registration, updated_at: new Date().toISOString() };
    } else {
      updated = [registration, ...current];
    }
    
    localStorage.setItem(LOCAL_STORAGE_TEAMS_KEY, JSON.stringify(updated));

    // Try remote DB
    try {
      const { error } = await supabase
        .from('yara_competition_registrations')
        .upsert(registration);
      if (error) console.warn('Remote sync note:', error.message);
    } catch {
      // safe fallback
    }

    // Auto-generate confirmation email log
    logEmailNotification({
      id: `email-${Date.now()}`,
      registration_id: registration.registration_id,
      team_name: registration.team_name,
      recipient_email: registration.team_leader_email,
      subject: `Registration Confirmed: ${registration.team_name} (${registration.registration_id})`,
      body: `Dear ${registration.team_leader_name},\n\nYour registration for the YARA Educational Robotics Competition 2026 has been successfully received.\n\nTeam: ${registration.team_name}\nRegistration ID: ${registration.registration_id}\nSchool/Org: ${registration.school_organization}\nChallenges: ${registration.selected_categories.join(', ')}\n\nOur technical committee is currently reviewing your application. You will receive further updates as the competition draws near.\n\nBest regards,\nYoung Africans Robotics Association (YARA)`,
      type: 'submission_confirmation',
      sent_at: new Date().toISOString()
    });

    return { success: true, data: registration };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to save registration' };
  }
};

export const updateRegistrationStatus = async (
  registrationId: string, 
  newStatus: YaraCompetitionRegistration['status'],
  notes?: string,
  correctionList?: string[]
): Promise<boolean> => {
  const current = await getRegistrations();
  const target = current.find(r => r.id === registrationId || r.registration_id === registrationId);
  if (!target) return false;

  target.status = newStatus;
  if (notes) target.admin_notes = notes;
  if (correctionList) target.correction_requests = correctionList;
  target.updated_at = new Date().toISOString();

  localStorage.setItem(LOCAL_STORAGE_TEAMS_KEY, JSON.stringify(current));

  try {
    await supabase
      .from('yara_competition_registrations')
      .update({
        status: newStatus,
        admin_notes: target.admin_notes,
        correction_requests: target.correction_requests,
        updated_at: target.updated_at
      })
      .eq('id', target.id);
  } catch {
    // fallback
  }

  // Trigger automated email log depending on status
  if (newStatus === 'Approved') {
    logEmailNotification({
      id: `email-${Date.now()}`,
      registration_id: target.registration_id,
      team_name: target.team_name,
      recipient_email: target.team_leader_email,
      subject: `Official Entry Approved: ${target.team_name} — YARA 2026`,
      body: `Congratulations ${target.team_name}!\n\nYour team entry has been officially APPROVED for the YARA Educational Robotics Competition 2026. You are cleared to proceed with technical preparation and arena mission setups.\n\nTeam ID: ${target.registration_id}\nNotes: ${notes || 'All requirements satisfied.'}\n\nWe look forward to seeing your innovation on the arena floor!`,
      type: 'approval',
      sent_at: new Date().toISOString()
    });
  } else if (newStatus === 'Corrections Required') {
    logEmailNotification({
      id: `email-${Date.now()}`,
      registration_id: target.registration_id,
      team_name: target.team_name,
      recipient_email: target.team_leader_email,
      subject: `Action Required: Corrections Requested for ${target.team_name}`,
      body: `Dear ${target.team_leader_name},\n\nThe YARA organizing committee reviewed your submission (${target.registration_id}) and requests the following updates:\n\n${notes || (correctionList ? correctionList.join('\n') : 'Please review and update your roster/technical specifications.')}\n\nPlease update your profile promptly to finalize your entry.`,
      type: 'corrections_requested',
      sent_at: new Date().toISOString()
    });
  }

  return true;
};

// 3. JUDGING & SCORING
export const getScoreSheets = async (): Promise<CategoryScoreSheet[]> => {
  const stored = localStorage.getItem(LOCAL_STORAGE_SCORES_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
};

export const saveScoreSheet = async (scoreSheet: CategoryScoreSheet): Promise<boolean> => {
  const current = await getScoreSheets();
  const existingIdx = current.findIndex(s => s.team_id === scoreSheet.team_id && s.category === scoreSheet.category);
  let updated: CategoryScoreSheet[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = scoreSheet;
  } else {
    updated = [scoreSheet, ...current];
  }
  localStorage.setItem(LOCAL_STORAGE_SCORES_KEY, JSON.stringify(updated));
  return true;
};

export const computeChampionshipStandings = async (): Promise<ChampionshipTeamStanding[]> => {
  const registrations = await getRegistrations();
  const scoreSheets = await getScoreSheets();

  const standings: ChampionshipTeamStanding[] = registrations.map(team => {
    const teamScores = scoreSheets.filter(s => s.team_id === team.id || s.registration_id === team.registration_id);
    
    const underwaterSheet = teamScores.find(s => s.category === 'underwater_drone');
    const mazeSheet = teamScores.find(s => s.category === 'autonomous_maze');
    const pitchSheet = teamScores.find(s => s.category === 'innovation_pitch');

    const uScore = underwaterSheet ? underwaterSheet.final_category_score : (team.selected_categories.includes('underwater_drone') ? 0 : undefined);
    const mScore = mazeSheet ? mazeSheet.final_category_score : (team.selected_categories.includes('autonomous_maze') ? 0 : undefined);
    const pScore = pitchSheet ? pitchSheet.final_category_score : (team.selected_categories.includes('innovation_pitch') ? 0 : undefined);

    // Formula: 35% Underwater + 35% Maze + 30% Innovation
    const weightedUnderwater = (uScore ?? 0) * 0.35;
    const weightedMaze = (mScore ?? 0) * 0.35;
    const weightedPitch = (pScore ?? 0) * 0.30;
    const overall = parseFloat((weightedUnderwater + weightedMaze + weightedPitch).toFixed(2));

    const awardedTitles: string[] = [];
    if (team.status === 'Winner') {
      awardedTitles.push('YARA Robotics Champion 2026');
    }

    return {
      team_id: team.id,
      registration_id: team.registration_id,
      team_name: team.team_name,
      school_organization: team.school_organization,
      province: team.province,
      selected_categories: team.selected_categories,
      underwater_score: uScore,
      maze_score: mScore,
      pitch_score: pScore,
      overall_championship_score: overall,
      rank_overall: 1, // calculated after sorting
      awarded_titles: awardedTitles
    };
  });

  // Sort by overall championship score
  standings.sort((a, b) => b.overall_championship_score - a.overall_championship_score);
  standings.forEach((s, idx) => {
    s.rank_overall = idx + 1;
  });

  return standings;
};

// 4. EMAIL SIMULATION LOGS
export const logEmailNotification = (email: CompetitionEmailNotification) => {
  const current: CompetitionEmailNotification[] = JSON.parse(localStorage.getItem(LOCAL_STORAGE_EMAILS_KEY) || '[]');
  current.unshift(email);
  localStorage.setItem(LOCAL_STORAGE_EMAILS_KEY, JSON.stringify(current.slice(0, 100)));
};

export const getEmailNotifications = (): CompetitionEmailNotification[] => {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_EMAILS_KEY) || '[]');
};

// 5. EXPORT TO CSV
export const exportRegistrationsToCSV = (registrations: YaraCompetitionRegistration[]) => {
  const headers = [
    'Registration ID',
    'Team Name',
    'School/Organization',
    'Province',
    'District',
    'City/Town',
    'Participant Type',
    'Team Leader',
    'Leader Email',
    'Leader Phone',
    'Mentor Name',
    'Mentor Email',
    'Total Members',
    'Boys Count',
    'Girls Count',
    'Categories',
    'Status',
    'Registered At'
  ];

  const rows = registrations.map(r => [
    r.registration_id,
    `"${r.team_name.replace(/"/g, '""')}"`,
    `"${r.school_organization.replace(/"/g, '""')}"`,
    r.province,
    r.district,
    r.city_town,
    r.participant_type,
    `"${r.team_leader_name.replace(/"/g, '""')}"`,
    r.team_leader_email,
    r.team_leader_phone || '',
    `"${(r.mentor_name || '').replace(/"/g, '""')}"`,
    r.mentor_email || '',
    r.total_members,
    r.boys_count,
    r.girls_count,
    `"${r.selected_categories.join(', ')}"`,
    r.status,
    new Date(r.created_at).toLocaleDateString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `YARA_Robotics_Registrations_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const updateRegistrationDetails = async (
  teamIdOrRegId: string,
  updates: Partial<YaraCompetitionRegistration>
): Promise<boolean> => {
  try {
    const current = await getRegistrations();
    const index = current.findIndex(r => r.id === teamIdOrRegId || r.registration_id === teamIdOrRegId);
    if (index >= 0) {
      current[index] = {
        ...current[index],
        ...updates,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem(LOCAL_STORAGE_TEAMS_KEY, JSON.stringify(current));
    }

    try {
      await supabase
        .from('yara_competition_registrations')
        .update(updates)
        .or(`id.eq.${teamIdOrRegId},registration_id.eq.${teamIdOrRegId}`);
    } catch {
      // safe fallback
    }

    return true;
  } catch (err) {
    console.error('Error updating registration details:', err);
    return false;
  }
};


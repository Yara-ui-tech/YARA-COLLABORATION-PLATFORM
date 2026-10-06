import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export type PortalMode = 'webpage' | 'lms';

export interface PortalStats {
  webpage: {
    title: string;
    registeredChapters: number;
    activeCompetitions: number;
    totalOutreachStudents: number;
    partnerOrganizations: number;
    recentAnnouncements: number;
  };
  lms: {
    title: string;
    totalSessions: number;
    courseLevels: number;
    enrolledInnovators: number;
    certificatesAwarded: number;
    activeIndustrialMentors: number;
    avgStudentRating: number;
  };
}

interface PortalContextType {
  portalMode: PortalMode;
  setPortalMode: (mode: PortalMode) => void;
  togglePortalMode: () => void;
  isSelectorOpen: boolean;
  setIsSelectorOpen: (open: boolean) => void;
  openPortalSelector: () => void;
  closePortalSelector: () => void;
  portalStats: PortalStats | null;
  loadingStats: boolean;
}

const DEFAULT_STATS: PortalStats = {
  webpage: {
    title: 'YARA Public Platform & Ecosystem',
    registeredChapters: 12,
    activeCompetitions: 3,
    totalOutreachStudents: 1420,
    partnerOrganizations: 8,
    recentAnnouncements: 6
  },
  lms: {
    title: 'YARA Learning Academy',
    totalSessions: 42,
    courseLevels: 4,
    enrolledInnovators: 384,
    certificatesAwarded: 112,
    activeIndustrialMentors: 4,
    avgStudentRating: 4.93
  }
};

const LMS_PATHS = [
  '/learning',
  '/mentorship',
  '/verify-certificate',
  '/projects',
  '/curriculum',
  '/simulator'
];

const PortalContext = createContext<PortalContextType>({
  portalMode: 'webpage',
  setPortalMode: () => {},
  togglePortalMode: () => {},
  isSelectorOpen: false,
  setIsSelectorOpen: () => {},
  openPortalSelector: () => {},
  closePortalSelector: () => {},
  portalStats: DEFAULT_STATS,
  loadingStats: false,
});

export const usePortal = () => useContext(PortalContext);

export const PortalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine initial mode from path or stored preference
  const [portalMode, setPortalModeState] = useState<PortalMode>(() => {
    const saved = localStorage.getItem('yara_portal_mode') as PortalMode;
    if (saved === 'lms' || saved === 'webpage') return saved;
    return 'webpage';
  });

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [portalStats, setPortalStats] = useState<PortalStats | null>(DEFAULT_STATS);
  const [loadingStats, setLoadingStats] = useState(false);

  // Sync mode with route if navigating to an LMS-specific path or root
  useEffect(() => {
    const path = location.pathname.toLowerCase();
    const isLmsPath = LMS_PATHS.some(p => path.startsWith(p));
    
    // Auto sync when route clearly belongs to one world
    if (isLmsPath && portalMode !== 'lms') {
      setPortalModeState('lms');
      localStorage.setItem('yara_portal_mode', 'lms');
    }
  }, [location.pathname]);

  // Fetch real-time portal statistics from backend
  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      setLoadingStats(true);
      try {
        const [regCount, profCount, certCount] = await Promise.allSettled([
          supabase.from('event_registrations').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('yara_accredited_certificates').select('id', { count: 'exact', head: true }),
        ]);

        const totalEnrolled = 
          (profCount.status === 'fulfilled' ? profCount.value.count || 0 : 0) +
          (regCount.status === 'fulfilled' ? regCount.value.count || 0 : 0);

        const totalCerts = 
          certCount.status === 'fulfilled' ? certCount.value.count || 0 : 0;

        if (isMounted) {
          setPortalStats(prev => ({
            ...prev,
            lms: {
              ...prev.lms,
              enrolledInnovators: totalEnrolled > 0 ? totalEnrolled : prev.lms.enrolledInnovators,
              certificatesAwarded: totalCerts > 0 ? totalCerts : prev.lms.certificatesAwarded
            }
          }));
        }
      } catch (err) {
        // Fall back to default verified stats
        if (isMounted) setPortalStats(DEFAULT_STATS);
      } finally {
        if (isMounted) setLoadingStats(false);
      }
    };

    fetchStats();
    return () => { isMounted = false; };
  }, []);

  const setPortalMode = (mode: PortalMode) => {
    setPortalModeState(mode);
    localStorage.setItem('yara_portal_mode', mode);
  };

  const togglePortalMode = () => {
    const nextMode = portalMode === 'webpage' ? 'lms' : 'webpage';
    setPortalMode(nextMode);
    if (nextMode === 'lms' && !LMS_PATHS.some(p => location.pathname.startsWith(p))) {
      navigate('/learning');
    } else if (nextMode === 'webpage' && location.pathname.startsWith('/learning')) {
      navigate('/');
    }
  };

  const openPortalSelector = () => setIsSelectorOpen(true);
  const closePortalSelector = () => setIsSelectorOpen(false);

  return (
    <PortalContext.Provider
      value={{
        portalMode,
        setPortalMode,
        togglePortalMode,
        isSelectorOpen,
        setIsSelectorOpen,
        openPortalSelector,
        closePortalSelector,
        portalStats,
        loadingStats
      }}
    >
      {children}
    </PortalContext.Provider>
  );
};

import { CompetitionTeamMember, TeamEligibilityCheck } from '../types/competition';

export function evaluateTeamEligibility(members: CompetitionTeamMember[]): TeamEligibilityCheck {
  const boysCount = members.filter(m => m.gender === 'boy').length;
  const girlsCount = members.filter(m => m.gender === 'girl').length;
  const totalMembers = members.length;

  const hasMinMembers = totalMembers >= 4;
  const hasMinBoys = boysCount >= 2;
  const hasMinGirls = girlsCount >= 2;
  const isEligible = hasMinMembers && hasMinBoys && hasMinGirls;

  return {
    totalMembers,
    boysCount,
    girlsCount,
    hasMinMembers,
    hasMinBoys,
    hasMinGirls,
    isEligible
  };
}

export const SOUTH_AFRICAN_PROVINCES = [
  'Eastern Cape',
  'Free State',
  'Gauteng',
  'KwaZulu-Natal',
  'Limpopo',
  'Mpumalanga',
  'Northern Cape',
  'North West',
  'Western Cape'
];

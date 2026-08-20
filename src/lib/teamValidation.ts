import { TeamMember, TeamCompositionStatus } from '../types/competition';

export function computeTeamCompositionStatus(members: TeamMember[]): TeamCompositionStatus {
  const validMembers = members.filter(m => m.name && m.name.trim().length > 0);
  const totalCount = validMembers.length;
  const boysCount = validMembers.filter(m => m.gender === 'boy').length;
  const girlsCount = validMembers.filter(m => m.gender === 'girl').length;
  
  const hasMinTotal = totalCount >= 4;
  const hasMinBoys = boysCount >= 2;
  const hasMinGirls = girlsCount >= 2;
  const hasCaptain = validMembers.some(m => m.is_captain);

  const reasons: string[] = [];

  if (!hasMinTotal) {
    reasons.push(`Minimum 4 team members required (currently ${totalCount}/4)`);
  }
  if (!hasMinBoys) {
    reasons.push(`Minimum 2 boys required (currently ${boysCount}/2)`);
  }
  if (!hasMinGirls) {
    reasons.push(`Minimum 2 girls required (currently ${girlsCount}/2)`);
  }
  if (!hasCaptain && totalCount > 0) {
    reasons.push('Please nominate one member as Team Captain');
  }

  const isEligible = hasMinTotal && hasMinBoys && hasMinGirls && hasCaptain;

  return {
    totalCount,
    boysCount,
    girlsCount,
    hasMinTotal,
    hasMinBoys,
    hasMinGirls,
    hasCaptain,
    isEligible,
    reasons
  };
}

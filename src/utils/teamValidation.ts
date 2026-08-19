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

export const AFRICAN_COUNTRIES = [
  'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 
  'Cameroon', 'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 
  'Democratic Republic of the Congo', 'Republic of the Congo', 'Djibouti', 'Egypt', 
  'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia', 'Gabon', 'Gambia', 
  'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya', 'Lesotho', 
  'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania', 
  'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 
  'Rwanda', 'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 
  'Somalia', 'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 
  'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'
];

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


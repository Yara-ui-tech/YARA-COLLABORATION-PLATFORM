import { CompetitionTeamMember, TeamEligibilityCheck } from '../types/competition';

export function evaluateTeamEligibility(members: CompetitionTeamMember[], requireGenderBalance: boolean = false): TeamEligibilityCheck {
  const boysCount = members.filter(m => m.gender === 'boy').length;
  const girlsCount = members.filter(m => m.gender === 'girl').length;
  const totalMembers = members.length;

  if (requireGenderBalance) {
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

  // Standard competitions (no mandatory gender quota, standard min 1 member check)
  const isEligible = totalMembers >= 1;
  return {
    totalMembers,
    boysCount,
    girlsCount,
    hasMinMembers: isEligible,
    hasMinBoys: true,
    hasMinGirls: true,
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

export const AFRICAN_PROVINCES: Record<string, string[]> = {
  'South Africa': [
    'Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape'
  ],
  'Nigeria': [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT - Abuja', 'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ],
  'Kenya': [
    'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo Marakwet', 'Embu', 'Garissa', 'Homa Bay', 'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii', 'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera', 'Marsabit', 'Meru', 'Migori', 'Mombasa', "Murang'a", 'Nairobi', 'Nakuru', 'Nandi', 'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita Taveta', 'Tana River', 'Tharaka Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
  ],
  'Ghana': [
    'Ahafo', 'Ashanti', 'Bono', 'Bono East', 'Central', 'Eastern', 'Greater Accra', 'North East', 'Northern', 'Oti', 'Savannah', 'Upper East', 'Upper West', 'Volta', 'Western', 'Western North'
  ],
  'Egypt': [
    'Alexandria', 'Aswan', 'Asyut', 'Beheira', 'Beni Suef', 'Cairo', 'Dakahlia', 'Damietta', 'Faiyum', 'Gharbia', 'Giza', 'Ismailia', 'Kafr El Sheikh', 'Luxor', 'Matrouh', 'Minya', 'Monufia', 'New Valley', 'North Sinai', 'Port Said', 'Qalyubia', 'Qena', 'Red Sea', 'Sharqia', 'Sohag', 'South Sinai', 'Suez'
  ],
  'Ethiopia': [
    'Addis Ababa', 'Afar', 'Amhara', 'Benishangul-Gumuz', 'Dire Dawa', 'Gambela', 'Harari', 'Oromia', 'Sidama', 'Somali', 'South West Ethiopia', 'Southern Nations, Nationalities, and Peoples', 'Tigray'
  ],
  'Tanzania': [
    'Arusha', 'Dar es Salaam', 'Dodoma', 'Geita', 'Iringa', 'Kagera', 'Katavi', 'Kigoma', 'Kilimanjaro', 'Lindi', 'Manyara', 'Mara', 'Mbeya', 'Morogoro', 'Mtwara', 'Mwanza', 'Njombe', 'Pemba North', 'Pemba South', 'Pwani', 'Rukwa', 'Ruvuma', 'Shinyanga', 'Simiyu', 'Singida', 'Songwe', 'Tabora', 'Tanga', 'Zanzibar Central/South', 'Zanzibar North', 'Zanzibar Urban/West'
  ],
  'Uganda': [
    'Central Region (Kampala, Mukono, Wakiso)', 'Eastern Region (Jinja, Mbale)', 'Northern Region (Gulu, Lira)', 'Western Region (Mbarara, Fort Portal)'
  ],
  'Zimbabwe': [
    'Bulawayo', 'Harare', 'Manicaland', 'Mashonaland Central', 'Mashonaland East', 'Mashonaland West', 'Masvingo', 'Matabeleland North', 'Matabeleland South', 'Midlands'
  ],
  'Zambia': [
    'Central', 'Copperbelt', 'Eastern', 'Luapula', 'Lusaka', 'Muchinga', 'Northern', 'North-Western', 'Southern', 'Western'
  ],
  'Rwanda': [
    'Kigali City', 'Northern Province', 'Southern Province', 'Eastern Province', 'Western Province'
  ],
  'Namibia': [
    'Erongo', 'Hardap', '//Karas', 'Kavango East', 'Kavango West', 'Khomas', 'Kunene', 'Ohangwena', 'Omaheke', 'Omusati', 'Oshana', 'Oshikoto', 'Otjozondjupa', 'Zambezi'
  ]
};

export const SOUTH_AFRICAN_PROVINCES = AFRICAN_PROVINCES['South Africa'];



export interface LocationProvince {
  name: string;
  districts: string[];
  cities: string[];
}

export const AFRICAN_COUNTRIES = [
  'Zimbabwe',
  'South Africa',
  'Botswana',
  'Zambia',
  'Mozambique',
  'Namibia',
  'Malawi',
  'Kenya',
  'Nigeria',
  'Ghana',
  'Rwanda',
  'Tanzania',
  'Uganda',
  'Ethiopia',
  'Other African Country',
  'International / Global'
];

export const ZIMBABWE_PROVINCES: Record<string, LocationProvince> = {
  'Harare Province': {
    name: 'Harare Province',
    districts: ['Harare Urban', 'Harare Rural', 'Chitungwiza', 'Epworth'],
    cities: ['Harare', 'Chitungwiza', 'Epworth', 'Ruwa', 'Borrowdale', 'Mbare', 'Highfield']
  },
  'Bulawayo Province': {
    name: 'Bulawayo Province',
    districts: ['Bulawayo Urban'],
    cities: ['Bulawayo', 'Cowdray Park', 'Nkulumane', 'Luveve', 'Pumula']
  },
  'Mashonaland West': {
    name: 'Mashonaland West',
    districts: ['Makonde', 'Zvimba', 'Hurungwe', 'Kariba', 'Kadoma', 'Sanyati', 'Mhondoro-Ngezi', 'Chegutu'],
    cities: ['Chinhoyi', 'Karoi', 'Kadoma', 'Chegutu', 'Kariba', 'Norton', 'Banket', 'Mhangura', 'Chirundu']
  },
  'Mashonaland East': {
    name: 'Mashonaland East',
    districts: ['Marondera', 'Goromonzi', 'Murehwa', 'Mutoko', 'Mudzi', 'Seke', 'Wedza', 'UMP (Uzumba Maramba Pfungwe)', 'Chikomba'],
    cities: ['Marondera', 'Ruwa', 'Murehwa', 'Mutoko', 'Chivhu', 'Wedza', 'Juru']
  },
  'Mashonaland Central': {
    name: 'Mashonaland Central',
    districts: ['Bindura', 'Mazowe', 'Shamva', 'Mount Darwin', 'Rushinga', 'Guruve', 'Mbire', 'Muzarabani'],
    cities: ['Bindura', 'Mvurwi', 'Glendale', 'Concession', 'Mount Darwin', 'Shamva', 'Guruve']
  },
  'Manicaland': {
    name: 'Manicaland',
    districts: ['Mutare', 'Makoni', 'Nyanga', 'Chipinge', 'Chimanimani', 'Buhera', 'Mutasa'],
    cities: ['Mutare', 'Rusape', 'Chipinge', 'Nyanga', 'Chimanimani', 'Murambinda', 'Penhalonga']
  },
  'Midlands': {
    name: 'Midlands',
    districts: ['Gweru', 'Kwekwe', 'Zvishavane', 'Shurugwi', 'Gokwe South', 'Gokwe North', 'Mberengwa', 'Chirumhanzu'],
    cities: ['Gweru', 'Kwekwe', 'Redcliff', 'Zvishavane', 'Shurugwi', 'Gokwe', 'Mvuma']
  },
  'Masvingo': {
    name: 'Masvingo',
    districts: ['Masvingo', 'Chiredzi', 'Mwenezi', 'Gutu', 'Zaka', 'Bikita', 'Chivi'],
    cities: ['Masvingo', 'Chiredzi', 'Triangle', 'Gutu (Mupandawana)', 'Mashava', 'Chivi']
  },
  'Matabeleland North': {
    name: 'Matabeleland North',
    districts: ['Binga', 'Hwange', 'Lupane', 'Tsholotsho', 'Nkayi', 'Umguza', 'Bubi'],
    cities: ['Victoria Falls', 'Hwange', 'Lupane', 'Binga', 'Tsholotsho', 'Dete']
  },
  'Matabeleland South': {
    name: 'Matabeleland South',
    districts: ['Gwanda', 'Beitbridge', 'Bulilima', 'Mangwe', 'Matobo', 'Insiza', 'Umzingwane'],
    cities: ['Gwanda', 'Beitbridge', 'Plumtree', 'Filabusi', 'Maphisa', 'Esigodini']
  }
};

export const ZIMBABWE_PROVINCES_LIST = Object.values(ZIMBABWE_PROVINCES);

export const POPULAR_ZIM_SCHOOLS = [
  // Mashonaland West
  'Nemakonde High School',
  'Chinhoyi High School',
  'Kutama College',
  'Sanyati Baptist High School',
  'Banket High School',
  'Lomagundi College',
  'Chinhoyi University of Technology (CUT)',
  'Karoi High School',
  'Chegutu High School',
  'Rimuka High School',
  // Harare
  'Prince Edward School',
  'St. George’s College',
  'Harare High School',
  'Queen Elizabeth School',
  'Churchill High School',
  'Mabelreign Girls High',
  'Allan Wilson School',
  'Oriel Boys High',
  'University of Zimbabwe (UZ)',
  'Harare Institute of Technology (HIT)',
  // Bulawayo
  'Milton High School',
  'Mzilikazi High School',
  'Gifford High School',
  'Townsend High School',
  'National University of Science & Technology (NUST)',
  // Manicaland
  'St. Augustine’s High School (Penhalonga)',
  'Mutare Boys High',
  'Hartzell High School',
  'Marist Brothers Nyanga',
  // Midlands
  'Gweru High School',
  'Thornhill High School',
  'Fletcher High School',
  'Midlands State University (MSU)',
  'Kwekwe High School',
  // Masvingo
  'Gokomere High School',
  'Serima High School',
  'Victoria High School',
  'Great Zimbabwe University (GZU)',
  // Mat North & South
  'Binga High School',
  'Hwange High School',
  'Tsholotsho High School',
  'Gwanda High School'
];

export const POPULAR_ZIMBABWE_SCHOOLS = POPULAR_ZIM_SCHOOLS;

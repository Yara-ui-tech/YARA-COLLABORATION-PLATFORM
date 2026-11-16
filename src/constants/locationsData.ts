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

export interface ZimbabweUniversityInfo {
  name: string;
  abbreviation: string;
  category: 'university' | 'polytechnic';
  province: string;
  city: string;
  code: string;
  isProvincialLead?: boolean;
  websiteUrl?: string;
  description: string;
}

export const ZIMBABWE_UNIVERSITIES: ZimbabweUniversityInfo[] = [
  // Harare
  {
    name: 'University of Zimbabwe (UZ)',
    abbreviation: 'UZ',
    category: 'university',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-UZ-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.uz.ac.zw',
    description: 'Premier university robotics & mechatronics hub in Harare hosting multidisciplinary AI labs, embedded computing, and provincial tech competitions.'
  },
  {
    name: 'Harare Institute of Technology (HIT)',
    abbreviation: 'HIT',
    category: 'university',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-HIT-01',
    isProvincialLead: false,
    websiteUrl: 'https://www.hit.ac.zw',
    description: 'Technology commercialization, mechatronics hardware, autonomous systems, and industrial robotics incubation center.'
  },
  {
    name: 'Catholic University of Zimbabwe (CUZ)',
    abbreviation: 'CUZ',
    category: 'university',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-CUZ-01',
    isProvincialLead: false,
    websiteUrl: 'https://cuz.ac.zw',
    description: 'Multi-campus computing and technology chapter advancing humanitarian innovation, ethical AI, and youth digital development.'
  },
  {
    name: 'Women’s University in Africa (WUA)',
    abbreviation: 'WUA',
    category: 'university',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-WUA-01',
    isProvincialLead: false,
    websiteUrl: 'https://www.wua.ac.zw',
    description: 'Leading Women in STEM chapter empowering female engineers in hardware electronics, data intelligence, and community innovation.'
  },
  {
    name: 'Arrupe Jesuit University (AJU)',
    abbreviation: 'AJU',
    category: 'university',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-AJU-01',
    isProvincialLead: false,
    websiteUrl: 'https://www.aju.ac.zw',
    description: 'Information technology and humanities center developing human-centered autonomous systems, ethical robotics, and education tech.'
  },
  {
    name: 'Zimbabwe Open University (ZOU)',
    abbreviation: 'ZOU',
    category: 'university',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-ZOU-01',
    isProvincialLead: false,
    websiteUrl: 'https://www.zou.ac.zw',
    description: 'Nationwide distance learning robotics network supporting student inventors and software teams across all 10 provinces.'
  },
  {
    name: 'Zimbabwe National Defence University (ZNDU)',
    abbreviation: 'ZNDU',
    category: 'university',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-ZNDU-01',
    isProvincialLead: false,
    websiteUrl: 'https://zndu.ac.zw',
    description: 'Advanced engineering, cyber-physical systems, autonomous robotics telemetry, and automation engineering hub.'
  },

  // Bulawayo
  {
    name: 'National University of Science and Technology (NUST)',
    abbreviation: 'NUST',
    category: 'university',
    province: 'Bulawayo',
    city: 'Bulawayo',
    code: 'YARA-NUST-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.nust.ac.zw',
    description: 'Bulawayo provincial lead institution specializing in mechatronics, industrial automation, CNC prototyping, and artificial intelligence.'
  },

  // Mashonaland West
  {
    name: 'Chinhoyi University of Technology (CUT)',
    abbreviation: 'CUT',
    category: 'university',
    province: 'Mashonaland West',
    city: 'Chinhoyi',
    code: 'YARA-CUT-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.cut.ac.zw',
    description: 'Mashonaland West provincial lead university hub spearheading smart agriculture robotics, mechatronics hardware, and youth mentoring.'
  },

  // Midlands
  {
    name: 'Midlands State University (MSU)',
    abbreviation: 'MSU',
    category: 'university',
    province: 'Midlands',
    city: 'Gweru',
    code: 'YARA-MSU-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.msu.ac.zw',
    description: 'Midlands provincial lead university driving robotics innovation across Gweru, Zvishavane mining campus, and regional schools.'
  },

  // Manicaland
  {
    name: 'Manicaland State University of Applied Sciences (MSUAS)',
    abbreviation: 'MSUAS',
    category: 'university',
    province: 'Manicaland',
    city: 'Mutare',
    code: 'YARA-MSUAS-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.msuas.ac.zw',
    description: 'Manicaland provincial lead university hub focused on applied mining automation, environmental telemetry, and youth tech bootcamps.'
  },
  {
    name: 'Africa University (AU)',
    abbreviation: 'AU',
    category: 'university',
    province: 'Manicaland',
    city: 'Mutare',
    code: 'YARA-AU-01',
    isProvincialLead: false,
    websiteUrl: 'https://www.africau.edu',
    description: 'Pan-African innovation chapter accelerating cross-border software engineering, IoT sensor networks, and humanitarian robotics.'
  },

  // Masvingo
  {
    name: 'Great Zimbabwe University (GZU)',
    abbreviation: 'GZU',
    category: 'university',
    province: 'Masvingo',
    city: 'Masvingo',
    code: 'YARA-GZU-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.gzu.ac.zw',
    description: 'Masvingo provincial lead university driving STEM education, clean energy electronics, and rural robotics development.'
  },
  {
    name: 'Reformed Church University (RCU)',
    abbreviation: 'RCU',
    category: 'university',
    province: 'Masvingo',
    city: 'Masvingo',
    code: 'YARA-RCU-01',
    isProvincialLead: false,
    websiteUrl: 'https://www.rcu.ac.zw',
    description: 'Inclusive assistive robotics and accessibility tech lab designing assistive hardware for students and communities.'
  },

  // Mashonaland Central
  {
    name: 'Bindura University of Science Education (BUSE)',
    abbreviation: 'BUSE',
    category: 'university',
    province: 'Mashonaland Central',
    city: 'Bindura',
    code: 'YARA-BUSE-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.buse.ac.zw',
    description: 'Mashonaland Central provincial lead dedicated to STEM teacher empowerment, micro-controller programming, and high school clubs.'
  },
  {
    name: 'Zimbabwe Ezekiel Guti University (ZEGU)',
    abbreviation: 'ZEGU',
    category: 'university',
    province: 'Mashonaland Central',
    city: 'Bindura',
    code: 'YARA-ZEGU-01',
    isProvincialLead: false,
    websiteUrl: 'https://zegu.ac.zw',
    description: 'Hands-on computing and electronics chapter fostering rapid prototyping, smart systems, and youth tech entrepreneurship.'
  },

  // Mashonaland East
  {
    name: 'Marondera University of Agricultural Sciences and Technology (MUAST)',
    abbreviation: 'MUAST',
    category: 'university',
    province: 'Mashonaland East',
    city: 'Marondera',
    code: 'YARA-MUAST-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.muast.ac.zw',
    description: 'Mashonaland East provincial lead university specializing in precision agriculture robotics, UAV crop monitoring, and IoT irrigation.'
  },

  // Matabeleland North
  {
    name: 'Lupane State University (LSU)',
    abbreviation: 'LSU',
    category: 'university',
    province: 'Matabeleland North',
    city: 'Lupane',
    code: 'YARA-LSU-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.lsu.ac.zw',
    description: 'Matabeleland North provincial lead university advancing semi-arid engineering, solar robotics, and community STEM labs.'
  },

  // Matabeleland South
  {
    name: 'Gwanda State University (GSU)',
    abbreviation: 'GSU',
    category: 'university',
    province: 'Matabeleland South',
    city: 'Gwanda',
    code: 'YARA-GSU-01',
    isProvincialLead: true,
    websiteUrl: 'https://www.gsu.ac.zw',
    description: 'Matabeleland South provincial lead university spearheading mining automation, metallurgy robotics, and secondary STEM clubs.'
  },
  {
    name: 'Solusi University',
    abbreviation: 'Solusi',
    category: 'university',
    province: 'Matabeleland South',
    city: 'Bulawayo / Solusi',
    code: 'YARA-SOLUSI-01',
    isProvincialLead: false,
    websiteUrl: 'https://www.solusi.ac.zw',
    description: 'Established computing sciences and renewable energy lab conducting hands-on microcontroller and automation workshops.'
  },

  // Polytechnics & Technical Colleges
  {
    name: 'Harare Polytechnic',
    abbreviation: 'Harare Poly',
    category: 'polytechnic',
    province: 'Harare',
    city: 'Harare',
    code: 'YARA-HP-01',
    isProvincialLead: false,
    websiteUrl: 'https://harepoly.ac.zw',
    description: 'Major technical hub for electrical, mechanical and computer engineering students building competition-grade rovers.'
  },
  {
    name: 'Bulawayo Polytechnic',
    abbreviation: 'Byo Poly',
    category: 'polytechnic',
    province: 'Bulawayo',
    city: 'Bulawayo',
    code: 'YARA-BYOPOLY-01',
    isProvincialLead: false,
    websiteUrl: 'https://bulawayopolytechnic.ac.zw',
    description: 'Industrial automation, CNC machining, PCB fabrication, and technical maker robotics collective.'
  },
  {
    name: 'Mutare Polytechnic',
    abbreviation: 'Mutare Poly',
    category: 'polytechnic',
    province: 'Manicaland',
    city: 'Mutare',
    code: 'YARA-MUTPOLY-01',
    isProvincialLead: false,
    websiteUrl: 'https://mutarepolytechnic.ac.zw',
    description: 'Eastern region technical college developing renewable energy automation, robotics hardware, and community electronics.'
  },
  {
    name: 'Kwekwe Polytechnic',
    abbreviation: 'Kwekwe Poly',
    category: 'polytechnic',
    province: 'Midlands',
    city: 'Kwekwe',
    code: 'YARA-KWEKPOLY-01',
    isProvincialLead: false,
    websiteUrl: 'https://kwekwepoly.ac.zw',
    description: 'Heavy industrial automation, smelting sensors, and hands-on mechanical robotics lab.'
  },
  {
    name: 'Gweru Polytechnic',
    abbreviation: 'Gweru Poly',
    category: 'polytechnic',
    province: 'Midlands',
    city: 'Gweru',
    code: 'YARA-GWERUPOLY-01',
    isProvincialLead: false,
    description: 'Midlands vocational hub training students in electronics, motor controls, and practical automation.'
  },
  {
    name: 'Masvingo Polytechnic',
    abbreviation: 'Masvingo Poly',
    category: 'polytechnic',
    province: 'Masvingo',
    city: 'Masvingo',
    code: 'YARA-MASVPOLY-01',
    isProvincialLead: false,
    description: 'Applied technical engineering chapter conducting solar telemetry and practical robotics development.'
  },
  {
    name: 'Joshua Mqabuko Nkomo Polytechnic',
    abbreviation: 'JMN Poly',
    category: 'polytechnic',
    province: 'Matabeleland South',
    city: 'Gwanda',
    code: 'YARA-JMNPOLY-01',
    isProvincialLead: false,
    description: 'Southern region vocational and technical robotics education chapter.'
  }
];

export const ALL_ZIMBABWE_TERTIARY_INSTITUTIONS = ZIMBABWE_UNIVERSITIES;

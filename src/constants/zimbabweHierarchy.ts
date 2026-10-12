export interface DistrictHierarchy {
  id: string;
  name: string;
  institutions: Array<{
    name: string;
    type: 'university' | 'polytechnic' | 'high_school' | 'primary_school' | 'community_youth';
    chapterName: string;
    chapterCode?: string;
  }>;
}

export interface ProvinceHierarchy {
  id: string;
  name: string;
  capital: string;
  leadUniversity: string;
  leadChapterCode: string;
  districts: DistrictHierarchy[];
}

export const ZIMBABWE_PROVINCES: ProvinceHierarchy[] = [
  {
    id: 'mash_west',
    name: 'Mashonaland West',
    capital: 'Chinhoyi',
    leadUniversity: 'Chinhoyi University of Technology (CUT)',
    leadChapterCode: 'YARA-CUT-01',
    districts: [
      {
        id: 'makonde',
        name: 'Makonde / Chinhoyi District',
        institutions: [
          { name: 'Chinhoyi University of Technology (CUT)', type: 'university', chapterName: 'YARA CUT Chapter (Provincial Lead)', chapterCode: 'YARA-CUT-01' },
          { name: 'Chinhoyi High School', type: 'high_school', chapterName: 'YARA Chinhoyi High Robotics Club' },
          { name: 'Lomagundi College', type: 'high_school', chapterName: 'YARA Lomagundi College STEM Chapter' },
          { name: 'Chinhoyi Technical & Vocational Centre', type: 'polytechnic', chapterName: 'YARA Chinhoyi TVET Chapter' },
          { name: 'Makonde Community Innovation Hub', type: 'community_youth', chapterName: 'YARA Makonde Youth Robotics Chapter' },
          { name: 'Chinhoyi Primary School', type: 'primary_school', chapterName: 'YARA Chinhoyi Primary Bot Club' }
        ]
      },
      {
        id: 'kariba',
        name: 'Kariba District',
        institutions: [
          { name: 'Kariba Secondary School', type: 'high_school', chapterName: 'YARA Kariba Lake Robotics Club' },
          { name: 'Kariba Aquatic & Community Tech Hub', type: 'community_youth', chapterName: 'YARA Kariba ROV & Drone Chapter' }
        ]
      },
      {
        id: 'chegutu',
        name: 'Chegutu District',
        institutions: [
          { name: 'Chegutu High School', type: 'high_school', chapterName: 'YARA Chegutu STEM Innovators' },
          { name: 'Hartley Primary School', type: 'primary_school', chapterName: 'YARA Hartley Junior Bot Chapter' }
        ]
      },
      {
        id: 'kadoma',
        name: 'Kadoma / Sanyati District',
        institutions: [
          { name: 'Jameson High School', type: 'high_school', chapterName: 'YARA Jameson High Robotics Chapter' },
          { name: 'Sanyati Baptist High School', type: 'high_school', chapterName: 'YARA Sanyati Baptist STEM Chapter' }
        ]
      },
      {
        id: 'zvimba',
        name: 'Zvimba District',
        institutions: [
          { name: 'Kutama College', type: 'high_school', chapterName: 'YARA Kutama College Robotics Chapter' },
          { name: 'Murombedzi Community Youth Hub', type: 'community_youth', chapterName: 'YARA Zvimba Youth Tech Chapter' }
        ]
      },
      {
        id: 'hurungwe',
        name: 'Hurungwe / Karoi District',
        institutions: [
          { name: 'Karoi High School', type: 'high_school', chapterName: 'YARA Karoi Secondary STEM Chapter' },
          { name: 'Hurungwe Agro-Tech Community Hub', type: 'community_youth', chapterName: 'YARA Hurungwe Agro-Robotics Chapter' }
        ]
      }
    ]
  },
  {
    id: 'harare',
    name: 'Harare Metropolitan',
    capital: 'Harare',
    leadUniversity: 'University of Zimbabwe (UZ) & HIT',
    leadChapterCode: 'YARA-UZ-02',
    districts: [
      {
        id: 'harare_central',
        name: 'Harare Central District',
        institutions: [
          { name: 'University of Zimbabwe (UZ)', type: 'university', chapterName: 'YARA UZ Chapter (Provincial Lead)', chapterCode: 'YARA-UZ-02' },
          { name: 'Harare Institute of Technology (HIT)', type: 'university', chapterName: 'YARA HIT Mechatronics Chapter' },
          { name: 'Harare Polytechnic', type: 'polytechnic', chapterName: 'YARA Harare Poly Electrical & Robotics' },
          { name: 'Prince Edward School', type: 'high_school', chapterName: 'YARA Prince Edward STEM Chapter' },
          { name: 'Churchill High School', type: 'high_school', chapterName: 'YARA Churchill High Robotics Club' },
          { name: 'Avenues Youth Innovation Centre', type: 'community_youth', chapterName: 'YARA Harare Central Youth Tech Hub' }
        ]
      },
      {
        id: 'chitungwiza',
        name: 'Chitungwiza District',
        institutions: [
          { name: 'Sekwe Secondary School', type: 'high_school', chapterName: 'YARA Chitungwiza High Robotics Chapter' },
          { name: 'Chitungwiza Community STEM Hub', type: 'community_youth', chapterName: 'YARA Chitungwiza Youth Makerspace' }
        ]
      },
      {
        id: 'epworth',
        name: 'Epworth District',
        institutions: [
          { name: 'Epworth Secondary School', type: 'high_school', chapterName: 'YARA Epworth Youth Tech Chapter' },
          { name: 'Epworth Community Innovation Club', type: 'community_youth', chapterName: 'YARA Epworth Community Robotics' }
        ]
      }
    ]
  },
  {
    id: 'bulawayo',
    name: 'Bulawayo Metropolitan',
    capital: 'Bulawayo',
    leadUniversity: 'National University of Science and Technology (NUST)',
    leadChapterCode: 'YARA-NUST-01',
    districts: [
      {
        id: 'byo_central',
        name: 'Bulawayo Central / Khami District',
        institutions: [
          { name: 'National University of Science & Technology (NUST)', type: 'university', chapterName: 'YARA NUST Chapter (Provincial Lead)', chapterCode: 'YARA-NUST-01' },
          { name: 'Bulawayo Polytechnic', type: 'polytechnic', chapterName: 'YARA Bulawayo Poly Automation Chapter' },
          { name: 'Milton High School', type: 'high_school', chapterName: 'YARA Milton High Robotics Club' },
          { name: 'Townsend High School', type: 'high_school', chapterName: 'YARA Townsend Girls Robotics Chapter' },
          { name: 'Bulawayo Makerspace & Tech Hub', type: 'community_youth', chapterName: 'YARA Bulawayo Community Innovators' },
          { name: 'Coghlan Primary School', type: 'primary_school', chapterName: 'YARA Coghlan Junior Bot Chapter' }
        ]
      }
    ]
  },
  {
    id: 'midlands',
    name: 'Midlands Province',
    capital: 'Gweru',
    leadUniversity: 'Midlands State University (MSU)',
    leadChapterCode: 'YARA-MSU-01',
    districts: [
      {
        id: 'gweru',
        name: 'Gweru District',
        institutions: [
          { name: 'Midlands State University (MSU)', type: 'university', chapterName: 'YARA MSU Chapter (Provincial Lead)', chapterCode: 'YARA-MSU-01' },
          { name: 'Gweru Polytechnic', type: 'polytechnic', chapterName: 'YARA Gweru Poly Robotics Chapter' },
          { name: 'Thornhill High School', type: 'high_school', chapterName: 'YARA Thornhill High STEM Chapter' },
          { name: 'Fletcher High School', type: 'high_school', chapterName: 'YARA Fletcher High Robotics Club' },
          { name: 'Gweru Community Tech Club', type: 'community_youth', chapterName: 'YARA Gweru Youth Innovation Lab' }
        ]
      },
      {
        id: 'kwekwe',
        name: 'Kwekwe District',
        institutions: [
          { name: 'Kwekwe Polytechnic', type: 'polytechnic', chapterName: 'YARA Kwekwe Poly Industrial Robotics' },
          { name: 'Kwekwe High School', type: 'high_school', chapterName: 'YARA Kwekwe High STEM Chapter' }
        ]
      },
      {
        id: 'zvishavane',
        name: 'Zvishavane District',
        institutions: [
          { name: 'MSU Zvishavane Mining Campus', type: 'university', chapterName: 'YARA Mining & Autonomous Machinery Chapter' },
          { name: 'Zvishavane High School', type: 'high_school', chapterName: 'YARA Zvishavane Secondary Robotics' }
        ]
      }
    ]
  },
  {
    id: 'manicaland',
    name: 'Manicaland Province',
    capital: 'Mutare',
    leadUniversity: 'Manicaland State University of Applied Sciences (MSUAS)',
    leadChapterCode: 'YARA-MSUAS-01',
    districts: [
      {
        id: 'mutare',
        name: 'Mutare District',
        institutions: [
          { name: 'Manicaland State University (MSUAS)', type: 'university', chapterName: 'YARA MSUAS Chapter (Provincial Lead)', chapterCode: 'YARA-MSUAS-01' },
          { name: 'Mutare Polytechnic', type: 'polytechnic', chapterName: 'YARA Mutare Poly Tech Chapter' },
          { name: 'Mutare Boys High School', type: 'high_school', chapterName: 'YARA Mutare Boys Robotics Club' },
          { name: 'Mutare Community Innovation Hub', type: 'community_youth', chapterName: 'YARA Manicaland Youth Makerspace' }
        ]
      },
      {
        id: 'makoni',
        name: 'Makoni / Rusape District',
        institutions: [
          { name: 'St Faith’s High School', type: 'high_school', chapterName: 'YARA St Faith STEM Chapter' }
        ]
      },
      {
        id: 'chipinge',
        name: 'Chipinge District',
        institutions: [
          { name: 'Gaza High School', type: 'high_school', chapterName: 'YARA Chipinge Agro-Robotics Club' }
        ]
      }
    ]
  },
  {
    id: 'masvingo',
    name: 'Masvingo Province',
    capital: 'Masvingo',
    leadUniversity: 'Great Zimbabwe University (GZU)',
    leadChapterCode: 'YARA-GZU-01',
    districts: [
      {
        id: 'masvingo_urban',
        name: 'Masvingo District',
        institutions: [
          { name: 'Great Zimbabwe University (GZU)', type: 'university', chapterName: 'YARA GZU Chapter (Provincial Lead)', chapterCode: 'YARA-GZU-01' },
          { name: 'Masvingo Polytechnic', type: 'polytechnic', chapterName: 'YARA Masvingo Poly Robotics' },
          { name: 'Victoria High School', type: 'high_school', chapterName: 'YARA Victoria High STEM Chapter' }
        ]
      },
      {
        id: 'chiredzi',
        name: 'Chiredzi / Lowveld District',
        institutions: [
          { name: 'Chiredzi Government High', type: 'high_school', chapterName: 'YARA Chiredzi Agro-Drone Club' }
        ]
      }
    ]
  },
  {
    id: 'mash_central',
    name: 'Mashonaland Central',
    capital: 'Bindura',
    leadUniversity: 'Bindura University of Science Education (BUSE)',
    leadChapterCode: 'YARA-BUSE-01',
    districts: [
      {
        id: 'bindura',
        name: 'Bindura District',
        institutions: [
          { name: 'Bindura University of Science Education (BUSE)', type: 'university', chapterName: 'YARA BUSE Chapter (Provincial Lead)', chapterCode: 'YARA-BUSE-01' },
          { name: 'Chipadze High School', type: 'high_school', chapterName: 'YARA Chipadze Secondary Robotics' }
        ]
      },
      {
        id: 'mazowe',
        name: 'Mazowe District',
        institutions: [
          { name: 'Mazowe Boys High School', type: 'high_school', chapterName: 'YARA Mazowe Boys STEM Chapter' }
        ]
      }
    ]
  },
  {
    id: 'mash_east',
    name: 'Mashonaland East',
    capital: 'Marondera',
    leadUniversity: 'Marondera University of Agricultural Sciences (MUAST)',
    leadChapterCode: 'YARA-MUAST-01',
    districts: [
      {
        id: 'marondera',
        name: 'Marondera District',
        institutions: [
          { name: 'Marondera University (MUAST)', type: 'university', chapterName: 'YARA MUAST Chapter (Provincial Lead)', chapterCode: 'YARA-MUAST-01' },
          { name: 'Marondera High School', type: 'high_school', chapterName: 'YARA Marondera High Robotics Club' }
        ]
      },
      {
        id: 'goromonzi',
        name: 'Goromonzi District',
        institutions: [
          { name: 'Goromonzi High School', type: 'high_school', chapterName: 'YARA Goromonzi High STEM Chapter' },
          { name: 'St Ignatius College', type: 'high_school', chapterName: 'YARA St Ignatius Robotics Chapter' }
        ]
      }
    ]
  },
  {
    id: 'mat_north',
    name: 'Matabeleland North',
    capital: 'Lupane',
    leadUniversity: 'Lupane State University (LSU)',
    leadChapterCode: 'YARA-LSU-01',
    districts: [
      {
        id: 'lupane',
        name: 'Lupane District',
        institutions: [
          { name: 'Lupane State University (LSU)', type: 'university', chapterName: 'YARA LSU Chapter (Provincial Lead)', chapterCode: 'YARA-LSU-01' },
          { name: 'Lupane Community Tech Hub', type: 'community_youth', chapterName: 'YARA Lupane Youth Robotics Chapter' }
        ]
      },
      {
        id: 'hwange',
        name: 'Hwange / Victoria Falls District',
        institutions: [
          { name: 'Hwange High School', type: 'high_school', chapterName: 'YARA Hwange Industrial Tech Chapter' },
          { name: 'Victoria Falls Community Tech Club', type: 'community_youth', chapterName: 'YARA Vic Falls Youth Robotics Hub' }
        ]
      }
    ]
  },
  {
    id: 'mat_south',
    name: 'Matabeleland South',
    capital: 'Gwanda',
    leadUniversity: 'Gwanda State University (GSU)',
    leadChapterCode: 'YARA-GSU-01',
    districts: [
      {
        id: 'gwanda',
        name: 'Gwanda District',
        institutions: [
          { name: 'Gwanda State University (GSU)', type: 'university', chapterName: 'YARA GSU Chapter (Provincial Lead)', chapterCode: 'YARA-GSU-01' },
          { name: 'Gwanda High School', type: 'high_school', chapterName: 'YARA Gwanda Secondary Robotics Club' }
        ]
      },
      {
        id: 'beitbridge',
        name: 'Beitbridge District',
        institutions: [
          { name: 'St Mary’s Secondary Beitbridge', type: 'high_school', chapterName: 'YARA Beitbridge Border Tech Club' }
        ]
      }
    ]
  }
];

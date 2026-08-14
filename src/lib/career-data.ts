import type { Course } from './types';

// Career / Course data for Preparation AI
// Categories: Engineering, Medical, Management, Science, Design, Law
// Icons map to lucide-react names: Cpu, HeartPulse, GraduationCap, Briefcase, Users

export const COURSES: Course[] = [
  {
    id: 'btech-cse',
    name: 'B.Tech Computer Science Engineering',
    category: 'Engineering',
    overview:
      'B.Tech CSE is a four-year undergraduate programme focused on computation, software engineering, algorithms, and system design. Students learn programming, data structures, AI/ML, and cloud technologies, building both theoretical depth and hands-on engineering skills. It remains the most sought-after engineering stream globally.',
    futureScope:
      'Explosive growth in AI, cloud, cybersecurity, and data engineering is creating millions of new roles worldwide. CSE graduates can pivot into product management, research, or entrepreneurship with minimal friction.',
    averageSalary:
      'India: ₹6-25 LPA (fresher), ₹20-80 LPA (mid-senior). USA: $90K-$180K (fresher), $150K-$400K (senior).',
    demandForecast:
      'Very High — NASSCOM predicts India will need 2x tech workforce by 2030; US BLS projects 23% growth for software roles through 2032.',
    industryGrowth:
      'IT industry growing at 7-10% CAGR globally; AI sub-segment growing 35-40% YoY.',
    skillRequirements: [
      'Data Structures & Algorithms',
      'Programming (Python, Java, C++)',
      'Operating Systems & DBMS',
      'Machine Learning & AI basics',
      'Cloud computing (AWS / Azure / GCP)',
      'System Design',
      'Web / Mobile development',
    ],
    workLifeBalance:
      'Generally good in product companies; tier-1 service firms can be 50-55 hour weeks. Flexible and remote options widely available.',
    careerProgression:
      'Software Engineer → Senior Engineer → Tech Lead → Engineering Manager / Staff Engineer → Director / VP Engineering → CTO.',
    topRecruiters: [
      'Google',
      'Microsoft',
      'Amazon',
      'Meta',
      'Apple',
      'Adobe',
      'Flipkart',
      'TCS Digital',
    ],
    icon: 'Cpu',
  },
  {
    id: 'btech-mechanical',
    name: 'B.Tech Mechanical Engineering',
    category: 'Engineering',
    overview:
      'B.Tech Mechanical is a foundational engineering discipline dealing with design, manufacturing, thermal systems, and robotics. It blends physics, materials science, and CAD/CAM tools to build machines and vehicles. Modern curriculum increasingly integrates mechatronics and Industry 4.0.',
    futureScope:
      'Strong revival driven by EV manufacturing, aerospace, robotics, and additive manufacturing. Mechanical engineers are critical to India’s $300B manufacturing mission and global green-energy transition.',
    averageSalary:
      'India: ₹4-12 LPA (fresher), ₹12-40 LPA (mid-senior). USA: $70K-$120K (fresher), $110K-$180K (senior).',
    demandForecast:
      'High — EV, defence, and semiconductor fab expansion adding 1.5M+ jobs globally by 2030.',
    industryGrowth:
      'Mechanical engineering services growing 6-8% CAGR; EV sub-sector growing 25%+ CAGR.',
    skillRequirements: [
      'Engineering Mechanics & Strength of Materials',
      'Thermodynamics & Heat Transfer',
      'CAD / SolidWorks / CATIA',
      'Manufacturing Processes',
      'Fluid Mechanics',
      'Robotics & Mechatronics',
      'Finite Element Analysis (FEA)',
    ],
    workLifeBalance:
      'Plant-based roles can be 50-hour weeks with on-call duties; R&D and design roles offer better balance. Hybrid work possible in design/simulation.',
    careerProgression:
      'Graduate Engineer Trainee → Design Engineer → Senior Engineer → Project Manager → Engineering Manager → Plant Head / CTO.',
    topRecruiters: [
      'Tata Motors',
      'Mahindra',
      'Tesla',
      'Larsen & Toubro',
      'Bosch',
      'Siemens',
      'GE',
      'BHEL',
    ],
    icon: 'Cpu',
  },
  {
    id: 'btech-electronics',
    name: 'B.Tech Electronics & Communication',
    category: 'Engineering',
    overview:
      'B.Tech ECE covers analog & digital electronics, communication systems, VLSI, embedded systems, and signal processing. It is the backbone of telecom, IoT, and semiconductor industries. The programme balances hardware design with software for embedded and communication products.',
    futureScope:
      'Semiconductor fabrication, 5G/6G, IoT, and edge AI are driving massive demand for ECE engineers. India’s semiconductor mission alone targets $64B investment by 2026.',
    averageSalary:
      'India: ₹4-14 LPA (fresher), ₹12-40 LPA (mid-senior). USA: $80K-$130K (fresher), $130K-$200K (senior).',
    demandForecast:
      'High — global semiconductor shortage accelerating hiring; 5G rollout creating sustained demand.',
    industryGrowth:
      'Semiconductor industry growing 8-12% CAGR; telecom equipment 6-9% CAGR.',
    skillRequirements: [
      'Digital & Analog Electronics',
      'Signals & Systems',
      'VLSI Design (Verilog / VHDL)',
      'Embedded Systems (C, RTOS)',
      'Communication Systems',
      'Microprocessors & Microcontrollers',
      'PCB Design',
    ],
    workLifeBalance:
      'Design and R&D roles are typically 40-45 hour weeks with flexible hours. Fab-line roles involve shifts.',
    careerProgression:
      'Trainee Engineer → Design Engineer → Senior Engineer → Architect → Manager → Director of Engineering.',
    topRecruiters: [
      'Intel',
      'Qualcomm',
      'Texas Instruments',
      'Samsung',
      'ISRO',
      'BEL',
      'Nvidia',
      'MediaTek',
    ],
    icon: 'Cpu',
  },
  {
    id: 'btech-civil',
    name: 'B.Tech Civil Engineering',
    category: 'Engineering',
    overview:
      'B.Tech Civil Engineering focuses on infrastructure — structures, transportation, geotechnical, water resources, and construction management. It is the oldest and most applied branch of engineering. Modern civil engineering increasingly integrates BIM, sustainability, and smart-city tech.',
    futureScope:
      'Infrastructure mega-projects, metro rail, smart cities, and green buildings ensure long-term demand. Government capex of ₹10 lakh crore in India keeps the pipeline strong.',
    averageSalary:
      'India: ₹3-8 LPA (fresher), ₹10-30 LPA (mid-senior). USA: $60K-$90K (fresher), $90K-$150K (senior).',
    demandForecast:
      'Moderate-High — sustained infrastructure spend in Asia and Middle East; US bridges/highway rebuild cycle.',
    industryGrowth:
      'Construction industry growing 5-7% CAGR; smart-infrastructure niche 15%+ CAGR.',
    skillRequirements: [
      'Structural Analysis & Design',
      'Surveying & Geomatics',
      'Construction Materials',
      'Geotechnical Engineering',
      'BIM (Revit / Bentley)',
      'Project Management',
      'Environmental Engineering',
    ],
    workLifeBalance:
      'Site roles involve long hours and travel; design/consulting roles are office-based with 45-hour weeks.',
    careerProgression:
      'Site Engineer → Project Engineer → Project Manager → Construction Manager → Director / VP Projects.',
    topRecruiters: [
      'Larsen & Toubro',
      'Tata Projects',
      'Shapoorji Pallonji',
      'GMR',
      'DLF',
      'NBCC',
      'Bechtel',
      'Skanska',
    ],
    icon: 'Cpu',
  },
  {
    id: 'mbbs',
    name: 'MBBS (Bachelor of Medicine, Bachelor of Surgery)',
    category: 'Medical',
    overview:
      'MBBS is a 5.5-year undergraduate medical degree (including 1-year internship) that trains students to become practicing physicians. The curriculum covers anatomy, physiology, biochemistry, pathology, pharmacology, and clinical subjects across medicine, surgery, OBG, paediatrics, and community medicine.',
    futureScope:
      'Steady high demand due to global physician shortages. India needs 2.5M more doctors by 2030 to meet WHO norms. Specialisation via NEET-PG / USMLE / PLAB opens super-specialty careers.',
    averageSalary:
      'India: ₹6-15 LPA (junior resident), ₹15-40 LPA (specialist), ₹50L-2Cr (senior consultant). USA: $200K-$600K (specialist).',
    demandForecast:
      'Very High — telemedicine, AI-diagnostics, and aging populations expanding healthcare workforce needs.',
    industryGrowth:
      'Healthcare industry growing 16-18% CAGR in India; telehealth sub-segment growing 25%+.',
    skillRequirements: [
      'Human Anatomy & Physiology',
      'Clinical Diagnosis',
      'Pharmacology',
      'Patient Communication',
      'Surgical Skills (basic)',
      'Medical Ethics',
      'EMR / Health-tech literacy',
    ],
    workLifeBalance:
      'Demanding — residents often work 60-80 hour weeks; senior consultants have more control. Specialties like Dermatology, Radiology offer better balance than Surgery.',
    careerProgression:
      'MBBS → Intern → Junior Resident → Senior Resident → Specialist (MD/MS) → Consultant → HOD / Professor.',
    topRecruiters: [
      'AIIMS',
      'Apollo Hospitals',
      'Fortis Healthcare',
      'Max Healthcare',
      'Manipal Health',
      'Tata Memorial',
      'NHS (UK)',
      'Mayo Clinic',
    ],
    icon: 'HeartPulse',
  },
  {
    id: 'bds',
    name: 'BDS (Bachelor of Dental Surgery)',
    category: 'Medical',
    overview:
      'BDS is a 5-year undergraduate programme (including 1-year internship) training students in oral healthcare, dental surgery, and maxillofacial treatment. It covers dental anatomy, oral pathology, periodontics, orthodontics, and prosthodontics with significant clinical practice.',
    futureScope:
      'Rising cosmetic dentistry demand and awareness of oral health creating strong private practice opportunities. Specialisation via MDS enhances income substantially.',
    averageSalary:
      'India: ₹4-10 LPA (fresher), ₹10-30 LPA (established), ₹30L-1Cr (successful private practice). USA: $120K-$250K.',
    demandForecast:
      'High — growing medical tourism in India and cosmetic dentistry boom in developed markets.',
    industryGrowth:
      'Dental services market growing 8-10% CAGR globally.',
    skillRequirements: [
      'Oral Anatomy & Histology',
      'Dental Materials',
      'Prosthodontics',
      'Orthodontics',
      'Oral Surgery',
      'Patient Communication',
      'Sterilization & Infection Control',
    ],
    workLifeBalance:
      'Generally excellent — most dentists run private clinics with controllable hours. Academic and hospital roles are 40-hour weeks.',
    careerProgression:
      'BDS → Intern → Dental Surgeon → MDS Specialist → Senior Consultant → Clinic Owner / Professor.',
    topRecruiters: [
      'Apollo White Dental',
      'Cloves Dental',
      'Sabka Dentist',
      'AIIMS',
      'Manipal College of Dental Sciences',
      'Fortis Dental',
      'Private Practice',
      'Army Dental Corps',
    ],
    icon: 'HeartPulse',
  },
  {
    id: 'bba',
    name: 'BBA (Bachelor of Business Administration)',
    category: 'Management',
    overview:
      'BBA is a 3-year undergraduate management programme covering marketing, finance, HR, operations, and entrepreneurship. It builds business acumen, leadership, and analytical skills early. Most students follow it with an MBA for senior management careers.',
    futureScope:
      'Strong pipeline to MBA programs and entry-level management roles in consulting, FMCG, banking, and startups. Demand rising for analytically-skilled business graduates.',
    averageSalary:
      'India: ₹3-8 LPA (fresher), ₹8-25 LPA (post-MBA). USA: $45K-$65K (fresher), $90K-$150K (post-MBA).',
    demandForecast:
      'High — management consulting and product management among fastest-growing white-collar roles.',
    industryGrowth:
      'Management consulting growing 7-9% CAGR; product management 18%+ CAGR.',
    skillRequirements: [
      'Business Strategy',
      'Financial Accounting',
      'Marketing Fundamentals',
      'Data Analysis (Excel, SQL)',
      'Communication & Presentation',
      'Operations & Supply Chain',
      'Leadership & Teamwork',
    ],
    workLifeBalance:
      'Good in most corporate roles; consulting and investment banking are demanding (60+ hour weeks).',
    careerProgression:
      'Management Trainee → Associate → Senior Associate → Manager → Senior Manager → Director → VP / CXO.',
    topRecruiters: [
      'McKinsey',
      'BCG',
      'Bain',
      'Deloitte',
      'HUL',
      'ITC',
      'Tata Administrative Service',
      'Google',
    ],
    icon: 'Briefcase',
  },
  {
    id: 'mba',
    name: 'MBA (Master of Business Administration)',
    category: 'Management',
    overview:
      'MBA is a 2-year postgraduate programme specialising in finance, marketing, HR, operations, strategy, or analytics. Top schools (IIM A/B/C, ISB, Harvard, Stanford, INSEAD) place graduates into consulting, investment banking, product, and general management roles. It accelerates leadership trajectories.',
    futureScope:
      'AI-proof strategic and leadership roles remain in high demand. Specialised MBAs in analytics, sustainability, and healthcare expanding rapidly.',
    averageSalary:
      'India: ₹15-35 LPA (Tier-1), ₹8-15 LPA (Tier-2). USA: $130K-$200K (top-15 schools).',
    demandForecast:
      'Very High — GMAC reports 80%+ of corporates plan to hire MBAs; tech firms increasingly recruit MBAs for PM roles.',
    industryGrowth:
      'Consulting industry growing 8-10% CAGR; product management growing 20%+ CAGR.',
    skillRequirements: [
      'Strategic Thinking',
      'Financial Modelling',
      'Data Analytics',
      'Negotiation & Persuasion',
      'Leadership',
      'Case Problem Solving',
      'Stakeholder Management',
    ],
    workLifeBalance:
      'Variable — Tech/General Management offer good balance; consulting and IB are 60-80 hour weeks.',
    careerProgression:
      'Associate / PM → Senior PM / Engagement Manager → Principal → Partner / VP → CXO.',
    topRecruiters: [
      'McKinsey',
      'Goldman Sachs',
      'Google',
      'Amazon',
      'Bain',
      'Microsoft',
      'Flipkart',
      'Reliance',
    ],
    icon: 'Briefcase',
  },
  {
    id: 'bsc-data-science',
    name: 'BSc Data Science',
    category: 'Science',
    overview:
      'BSc Data Science is a 3-year programme combining statistics, computer science, and domain knowledge to extract insights from data. Students learn Python, R, SQL, machine learning, visualisation, and big-data tools. It is among the fastest-growing science degrees globally.',
    futureScope:
      'AI/ML adoption across every industry is creating unprecedented demand for data scientists. World Economic Forum ranks data scientist among top-3 fastest-growing jobs through 2030.',
    averageSalary:
      'India: ₹5-12 LPA (fresher), ₹15-40 LPA (mid-senior). USA: $80K-$130K (fresher), $130K-$250K (senior).',
    demandForecast:
      'Very High — 11.5M new data-science jobs projected globally by 2026.',
    industryGrowth:
      'Data science & AI services growing 30-35% CAGR.',
    skillRequirements: [
      'Statistics & Probability',
      'Python / R Programming',
      'SQL & NoSQL databases',
      'Machine Learning Algorithms',
      'Data Visualisation (Tableau / Power BI)',
      'Big Data (Spark / Hadoop)',
      'Storytelling with Data',
    ],
    workLifeBalance:
      'Generally good — most data roles are 40-50 hour weeks with remote flexibility.',
    careerProgression:
      'Data Analyst → Data Scientist → Senior Data Scientist → Lead Data Scientist → Head of Data / Chief Data Officer.',
    topRecruiters: [
      'Google',
      'Amazon',
      'Microsoft',
      'Flipkart',
      'Swiggy',
      'Deloitte',
      'Fractal Analytics',
      'Mu Sigma',
    ],
    icon: 'GraduationCap',
  },
  {
    id: 'bsc-biotechnology',
    name: 'BSc Biotechnology',
    category: 'Science',
    overview:
      'BSc Biotechnology is a 3-4 year programme applying biological systems to develop products in healthcare, agriculture, and industry. Curriculum covers genetics, molecular biology, biochemistry, microbiology, and bioinformatics with significant lab work.',
    futureScope:
      ' mRNA vaccines, gene therapy, synthetic biology, and precision agriculture driving a global biotech boom. India’s bio-economy target: $150B by 2025.',
    averageSalary:
      'India: ₹3-8 LPA (fresher), ₹8-25 LPA (mid-senior). USA: $50K-$80K (fresher), $90K-$150K (senior).',
    demandForecast:
      'High — biosciences workforce growing 9% globally through 2032.',
    industryGrowth:
      'Biotech industry growing 14-16% CAGR; biopharma sub-segment 18%+.',
    skillRequirements: [
      'Molecular Biology & Genetics',
      'Biochemistry',
      'Microbiology',
      'Bioinformatics (Python, R)',
      'Lab Techniques (PCR, ELISA, chromatography)',
      'GMP & Regulatory Affairs',
      'Statistical Analysis',
    ],
    workLifeBalance:
      'Lab-based roles are typically 45-hour weeks; R&D roles in industry offer flexible hours.',
    careerProgression:
      'Research Assistant → Junior Scientist → Scientist → Senior Scientist → Principal Scientist → R&D Head.',
    topRecruiters: [
      'Biocon',
      'Serum Institute of India',
      'Bharat Biotech',
      'Dr. Reddy’s',
      'Syngene',
      'Genentech',
      'Amgen',
      'GSK',
    ],
    icon: 'GraduationCap',
  },
  {
    id: 'bdes',
    name: 'BDes (Bachelor of Design)',
    category: 'Design',
    overview:
      'BDes is a 4-year undergraduate programme covering product, communication, UX/UI, and industrial design. Students learn design thinking, human-centred research, prototyping, and design software. Top schools include NID, IIT-IDC, Parsons, and RISD.',
    futureScope:
      'Digital transformation has made UX/UI and product designers critical to every tech company. Design roles rank among the highest-satisfaction creative careers.',
    averageSalary:
      'India: ₹5-12 LPA (fresher), ₹12-40 LPA (mid-senior). USA: $60K-$110K (fresher), $110K-$200K (senior).',
    demandForecast:
      'Very High — UX design jobs growing 13% through 2032 (US BLS).',
    industryGrowth:
      'Digital design services growing 12-15% CAGR globally.',
    skillRequirements: [
      'Design Thinking',
      'Figma / Adobe XD / Sketch',
      'User Research',
      'Prototyping',
      'Visual Design & Typography',
      'Interaction Design',
      'Motion Design (After Effects)',
    ],
    workLifeBalance:
      'Generally good — 40-45 hour weeks with creative flexibility; agency life can be deadline-driven.',
    careerProgression:
      'Junior Designer → Designer → Senior Designer → Lead Designer → Design Manager → Head of Design / CDO.',
    topRecruiters: [
      'Google',
      'Microsoft',
      'Adobe',
      'Flipkart',
      'Razorpay',
      'Airbnb',
      'IDEO',
      'Frog Design',
    ],
    icon: 'Users',
  },
  {
    id: 'llb',
    name: 'LLB (Bachelor of Laws)',
    category: 'Law',
    overview:
      'LLB is a 3-year (post-graduation) or 5-year integrated (BA LLB / BBA LLB) law degree covering constitutional, criminal, civil, corporate, and international law. NLU graduates and top firms offer lucrative corporate-law careers. The bar exam (AIBE) certifies practice in India.',
    futureScope:
      'Specialisation in tech-law, IPR, ESG, and arbitration is expanding rapidly. India’s legal services market projected to reach $35B+ by 2025.',
    averageSalary:
      'India: ₹6-16 LPA (Tier-1 firm), ₹3-8 LPA (litigation start). USA: $190K-$215K (BigLaw first-year).',
    demandForecast:
      'High — corporate compliance, data-privacy (DPDP Act), and cross-border trade driving demand for legal talent.',
    industryGrowth:
      'Legal services growing 6-8% CAGR; legal-tech growing 20%+ CAGR.',
    skillRequirements: [
      'Constitutional & Statutory Law',
      'Legal Research & Writing',
      'Contract Drafting',
      'Litigation & Advocacy',
      'Corporate Law & M&A',
      'Negotiation',
      'Legal-tech & e-Discovery',
    ],
    workLifeBalance:
      'Variable — in-house counsel roles have good balance; BigLaw and litigation can be 60+ hour weeks.',
    careerProgression:
      'Associate → Senior Associate → Partner → Managing Partner / General Counsel / Judge.',
    topRecruiters: [
      'AZB & Partners',
      'Cyril Amarchand Mangaldas',
      'Khaitan & Co.',
      'Trilegal',
      'Shardul Amarchand',
      'Clifford Chance',
      'Allen & Allen',
      'Supreme Court / High Courts',
    ],
    icon: 'Briefcase',
  },
  {
    id: 'barch',
    name: 'B.Arch (Bachelor of Architecture)',
    category: 'Design',
    overview:
      'B.Arch is a 5-year undergraduate programme combining art, engineering, and sustainability to design buildings and spaces. Curriculum covers architectural design, building construction, history, urban planning, and CAD/BIM tools. COA registration is required to practice in India.',
    futureScope:
      'Green buildings, smart cities, and sustainable urbanisation expanding opportunities. India’s real estate and infra sectors projected to reach $1T by 2030.',
    averageSalary:
      'India: ₹4-10 LPA (fresher), ₹12-35 LPA (mid-senior). USA: $55K-$85K (fresher), $90K-$150K (senior).',
    demandForecast:
      'Moderate-High — 3% growth (US BLS), but green-architecture niche growing 15%+.',
    industryGrowth:
      'Architecture services growing 5-7% CAGR; sustainable design 18%+.',
    skillRequirements: [
      'Architectural Design',
      'AutoCAD / Revit / SketchUp',
      'Building Materials & Construction',
      'Sustainable Design (LEED / IGBC)',
      'Urban Planning',
      'Structural Systems',
      '3D Visualisation',
    ],
    workLifeBalance:
      'Studio culture can be demanding during projects (50-55 hour weeks); established architects have more control over schedule.',
    careerProgression:
      'Junior Architect → Project Architect → Senior Architect → Associate → Principal Architect → Partner / Firm Owner.',
    topRecruiters: [
      'Hafeez Contractor',
      'Morphogenesis',
      'Mani Chowfla',
      'CP Kukreja',
      'L&T Construction',
      'Gensler',
      'HOK',
      'Som',
    ],
    icon: 'Users',
  },
  {
    id: 'bpharma',
    name: 'B.Pharm (Bachelor of Pharmacy)',
    category: 'Medical',
    overview:
      'B.Pharm is a 4-year undergraduate programme covering pharmaceutics, pharmacology, pharmaceutical chemistry, and pharmacognosy. Graduates work in drug discovery, manufacturing, regulatory affairs, and clinical research. India supplies 20% of global generic medicines, making pharmacy a strategic sector.',
    futureScope:
      'Biologics, personalised medicine, and India’s API self-reliance mission driving sustained demand. Pharmacovigilance and clinical research adding new roles.',
    averageSalary:
      'India: ₹3-7 LPA (fresher), ₹8-20 LPA (mid-senior). USA: $70K-$120K (PharmD / industry).',
    demandForecast:
      'High — global pharma workforce growing 5-7%; clinical research growing 12%+.',
    industryGrowth:
      'Pharma industry growing 9-12% CAGR in India; clinical research 14%+.',
    skillRequirements: [
      'Pharmaceutics & Formulation',
      'Pharmacology',
      'Pharmaceutical Analysis',
      'Regulatory Affairs (USFDA, CDSCO)',
      'Quality Control (GMP)',
      'Clinical Research',
      'Pharmacovigilance',
    ],
    workLifeBalance:
      'Manufacturing roles involve shifts; R&D and regulatory roles are 45-hour weeks with good stability.',
    careerProgression:
      'Pharmacist / Trainee → Production Executive → Manager → Senior Manager → Plant Head / Regulatory Director.',
    topRecruiters: [
      'Sun Pharma',
      'Dr. Reddy’s',
      'Cipla',
      'Lupin',
      'Pfizer',
      'Novartis',
      'Serum Institute',
      'Biocon',
    ],
    icon: 'HeartPulse',
  },
];

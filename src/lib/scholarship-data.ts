import type { Scholarship } from './types';

// Helper: returns a Google search URL as a safe fallback for scholarship links
function searchLink(name: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(name + ' scholarship')}`;
}

export const SCHOLARSHIPS: Scholarship[] = [
  {
    id: 'fulbright',
    name: 'Fulbright Foreign Student Program',
    provider: 'U.S. Department of State (Fulbright Commission)',
    amount: 'Full tuition + living stipend + health insurance + travel (~$40,000-$70,000 / year)',
    eligibility:
      'Indian citizens with a Bachelor’s degree and at least 3 years of professional experience. Must meet TOEFL/IELTS requirements. Applicants cannot hold U.S. citizenship or green card.',
    deadline: '15 May (annual, India)',
    countries: ['USA'],
    level: 'Masters, PhD, Non-degree research',
    link: searchLink('Fulbright Foreign Student Program'),
  },
  {
    id: 'rhodes',
    name: 'Rhodes Scholarship',
    provider: 'Rhodes Trust, University of Oxford',
    amount: 'Full Oxford tuition + £18,180/year stipend + travel + settling-in allowance',
    eligibility:
      'Outstanding academic record, leadership, and commitment to service. Age 18-24. Indian citizens with a first-class undergraduate degree are eligible via the India constituency.',
    deadline: 'August (annual, India)',
    countries: ['UK'],
    level: 'Postgraduate (Masters, DPhil)',
    link: searchLink('Rhodes Scholarship'),
  },
  {
    id: 'chevening',
    name: 'Chevening Scholarship',
    provider: 'UK Government (FCDO)',
    amount: 'Full tuition + living allowance (£18,000+/year) + travel + thesis grant',
    eligibility:
      'Indian citizens with an undergraduate degree, 2+ years of work experience, and admission to a UK Master’s programme. Must commit to returning home for 2 years post-study.',
    deadline: 'Early November (annual)',
    countries: ['UK'],
    level: 'Masters (1-year)',
    link: searchLink('Chevening Scholarship'),
  },
  {
    id: 'daad',
    name: 'DAAD Scholarship (Development-Related Postgraduate Courses)',
    provider: 'Deutscher Akademischer Austauschdienst (DAAD)',
    amount: '€934/month (Masters) / €1,200/month (PhD) + tuition + travel + health insurance',
    eligibility:
      'Graduates from developing countries with at least 2 years of work experience. Bachelor’s degree in a relevant field. English-taught programme at a German university.',
    deadline: 'October - March (varies by programme)',
    countries: ['Germany'],
    level: 'Masters, PhD',
    link: searchLink('DAAD Scholarship'),
  },
  {
    id: 'erasmus-mundus',
    name: 'Erasmus Mundus Joint Masters Scholarship',
    provider: 'European Union (EACEA)',
    amount: '€1,400/month + tuition + travel + installation allowance (~€33,600 / year)',
    eligibility:
      'Open to applicants worldwide holding a Bachelor’s degree. Must apply to a selected Erasmus Mundus joint Master’s programme and study in at least 2 EU countries.',
    deadline: 'October - January (varies by programme)',
    countries: ['Germany', 'Netherlands', 'Sweden', 'Ireland', 'UK'],
    level: 'Masters (joint degree)',
    link: searchLink('Erasmus Mundus Joint Masters Scholarship'),
  },
  {
    id: 'vanier-canada',
    name: 'Vanier Canada Graduate Scholarship',
    provider: 'Government of Canada',
    amount: 'CAD 50,000 / year for 3 years',
    eligibility:
      'Doctoral applicants nominated by a Canadian university. Demonstrated leadership and scholarly achievement. Open to Canadian and international students.',
    deadline: 'Early November (annual)',
    countries: ['Canada'],
    level: 'PhD',
    link: searchLink('Vanier Canada Graduate Scholarship'),
  },
  {
    id: 'australia-awards',
    name: 'Australia Awards Scholarship',
    provider: 'Australian Government (DFAT)',
    amount: 'Full tuition + airfare + establishment allowance (AUD 5,000) + living contribution (AUD 31,396/year) + health insurance',
    eligibility:
      'Citizens of eligible developing countries, including India for select categories. Applicants must satisfy both Australian and home-country admission requirements and commit to returning home for 2 years.',
    deadline: '30 April (annual)',
    countries: ['Australia'],
    level: 'Masters, PhD, Short courses',
    link: searchLink('Australia Awards Scholarship'),
  },
  {
    id: 'knight-hennessy',
    name: 'Knight-Hennessy Scholars',
    provider: 'Stanford University',
    amount: 'Full Stanford tuition + living stipend + travel allowance (~$80,000 / year)',
    eligibility:
      'Applicants applying to any full-time graduate programme at Stanford. Must have earned their first bachelor’s degree in 2018 or later. Open to all nationalities.',
    deadline: 'Early October (annual)',
    countries: ['USA'],
    level: 'Masters, PhD, MD, JD, MBA',
    link: searchLink('Knight-Hennessy Scholars'),
  },
  {
    id: 'inlaks',
    name: 'Inlaks Shivdasani Foundation Scholarship',
    provider: 'Inlaks Shivdasani Foundation',
    amount: 'Up to USD 100,000 (covers tuition + living for one-year or two-year programmes)',
    eligibility:
      'Indian citizens under 30 with a first-class degree and admission to a top-ranked institution abroad. Must demonstrate exceptional talent and financial need.',
    deadline: 'March (annual)',
    countries: ['USA', 'UK', 'Germany', 'Australia', 'Canada'],
    level: 'Masters',
    link: searchLink('Inlaks Shivdasani Foundation Scholarship'),
  },
  {
    id: 'commonwealth',
    name: 'Commonwealth Master’s Scholarship',
    provider: 'UK Government (FCDO)',
    amount: 'Full tuition + living allowance (£1,390/month) + travel + thesis grant',
    eligibility:
      'Citizens of Commonwealth countries (incl. India) who could not otherwise afford UK study. Must hold an undergraduate honors degree (2:1+) and admission to a UK Master’s.',
    deadline: 'Mid-October (annual)',
    countries: ['UK'],
    level: 'Masters (1-year)',
    link: searchLink('Commonwealth Master Scholarship'),
  },
  {
    id: 'singa',
    name: 'Singapore International Graduate Award (SINGA)',
    provider: 'A*STAR, NUS, NTU, SUTD',
    amount: 'Full tuition + SGD 2,200/month stipend (raised to SGD 2,700 after qualifying) + one-time SGD 1,500 travel grant',
    eligibility:
      'International graduates with a passion for research in science/engineering. Excellent academic record and strong English proficiency. Must apply for a PhD at NUS, NTU, SUTD, or A*STAR.',
    deadline: '1 December (annual)',
    countries: ['Singapore'],
    level: 'PhD',
    link: searchLink('Singapore International Graduate Award SINGA'),
  },
  {
    id: 'swedish-institute',
    name: 'Swedish Institute Scholarship for Global Professionals (SISGP)',
    provider: 'Swedish Institute',
    amount: 'Full tuition + SEK 12,000/month + travel grant + health insurance',
    eligibility:
      'Professionals from eligible countries with 3,000+ hours of work experience and leadership ambition. Must be admitted to a full-time Master’s programme in Sweden.',
    deadline: 'February (annual)',
    countries: ['Sweden'],
    level: 'Masters',
    link: searchLink('Swedish Institute Scholarship for Global Professionals'),
  },
  {
    id: 'holland-scholarship',
    name: 'Holland Scholarship',
    provider: 'Dutch Ministry of Education & Dutch universities',
    amount: '€5,000 one-time payment (first year)',
    eligibility:
      'Non-EU/EEA international students applying to a participating Dutch university for a Bachelor’s or Master’s programme. Must meet institutional admission criteria.',
    deadline: '1 May (annual, varies by university)',
    countries: ['Netherlands'],
    level: 'Bachelors, Masters',
    link: searchLink('Holland Scholarship'),
  },
  {
    id: 'ireland-goi',
    name: 'Government of Ireland International Education Scholarship',
    provider: 'Government of Ireland (HEA)',
    amount: '€10,000 stipend + full tuition waiver for one year',
    eligibility:
      'Non-EU/EEA students with an offer for a full-time Irish Master’s or PhD. Selected via competitive academic merit ranking.',
    deadline: 'Late March (annual)',
    countries: ['Ireland'],
    level: 'Masters, PhD',
    link: searchLink('Government of Ireland International Education Scholarship'),
  },
  {
    id: 'nz-aid',
    name: 'Manaaki New Zealand Scholarship',
    provider: 'New Zealand Ministry of Foreign Affairs and Trade',
    amount: 'Full tuition + living allowance (NZD 525/week) + travel + health insurance',
    eligibility:
      'Citizens of eligible countries in Asia-Pacific and Africa. Must meet both NZ university admission criteria and commit to returning home for 2 years post-study.',
    deadline: 'End of February / mid-July (varies by country)',
    countries: ['New Zealand'],
    level: 'Bachelors, Masters, PhD',
    link: searchLink('Manaaki New Zealand Scholarship'),
  },
  {
    id: 'gates-cambridge',
    name: 'Gates Cambridge Scholarship',
    provider: 'Gates Cambridge Trust, University of Cambridge',
    amount: 'Full Cambridge tuition + £21,000/year stipend + travel + family allowance + health insurance',
    eligibility:
      'Outstanding applicants from outside the UK applying for full-time postgraduate study at Cambridge. Selection based on academic excellence, leadership, and commitment to improving lives.',
    deadline: 'Early December (US citizens) / Early January (all others)',
    countries: ['UK'],
    level: 'Masters, PhD',
    link: searchLink('Gates Cambridge Scholarship'),
  },
  {
    id: 'aiccubst',
    name: 'AIC GUSEC Startup Scholarship (India Global)',
    provider: 'Atal Innovation Mission, NITI Aayog',
    amount: 'INR 5-25 lakh equity-free grant + incubation support',
    eligibility:
      'Indian students/recent graduates with innovative startups. Team must include at least one student founder. Selection based on innovation, scalability, and social impact.',
    deadline: 'Rolling (quarterly cohorts)',
    countries: ['India'],
    level: 'Entrepreneurship / Pre-incubation',
    link: searchLink('AIC GUSEC Startup Scholarship'),
  },
  {
    id: 'jtnd-tata',
    name: 'JN Tata Endowment Loan Scholarship',
    provider: 'JN Tata Endowment',
    amount: 'Loan scholarship up to ₹10 lakh + travel grant (selected candidates receive gift awards of up to ₹7.5 lakh)',
    eligibility:
      'Indian nationals under 45, holding a graduate degree and admission to a foreign university for higher studies. Selection based on academic merit and need.',
    deadline: 'March (annual)',
    countries: ['USA', 'UK', 'Germany', 'Canada', 'Australia', 'Singapore'],
    level: 'Masters, PhD',
    link: searchLink('JN Tata Endowment Loan Scholarship'),
  },
];

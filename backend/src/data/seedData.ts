import { CompetencyItem, UserProfile, UserCompetencyScore } from '../types';

export const MASTER_COMPETENCIES: CompetencyItem[] = [
  // 1. Statistical Domain (10)
  { id: 'c0000000-0000-0000-0000-000000000001', code: 'STAT_SURV', name: 'Survey Design', category: 'Statistical', description: 'Concepts of target population, survey instruments, sampling frames, and pilot testing.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000002', code: 'STAT_SAMP', name: 'Sampling', category: 'Statistical', description: 'Multi-stage stratified sampling, PPS selection, cluster sampling, and design weights.', benchmarkScore: 85, weight: 1.2 },
  { id: 'c0000000-0000-0000-0000-000000000003', code: 'STAT_NACC', name: 'National Accounts', category: 'Statistical', description: 'GDP computation, input-output tables, GVA estimation, and SNA 2008 standards.', benchmarkScore: 75, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000004', code: 'STAT_PRIC', name: 'Price Statistics', category: 'Statistical', description: 'Consumer Price Index (CPI), Wholesale Price Index (WPI), weighting diagrams, and deflation.', benchmarkScore: 75, weight: 0.9 },
  { id: 'c0000000-0000-0000-0000-000000000005', code: 'STAT_LABR', name: 'Labour Statistics', category: 'Statistical', description: 'PLFS indicators, Labour Force Participation Rate (LFPR), WPR, and unemployment rates.', benchmarkScore: 75, weight: 0.9 },
  { id: 'c0000000-0000-0000-0000-000000000006', code: 'STAT_AGRI', name: 'Agricultural Statistics', category: 'Statistical', description: 'Crop estimation surveys, agricultural census methodologies, and yield forecasts.', benchmarkScore: 70, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000007', code: 'STAT_INDU', name: 'Industrial Statistics', category: 'Statistical', description: 'Index of Industrial Production (IIP), ASI schedules, and NIC code classifications.', benchmarkScore: 70, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000008', code: 'STAT_SDGS', name: 'SDG Indicators', category: 'Statistical', description: 'National Indicator Framework (NIF) for Sustainable Development Goals tracking.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000009', code: 'STAT_META', name: 'Metadata Standards', category: 'Statistical', description: 'SDMX, DDI metadata schemas, and statistical data catalogue harmonization.', benchmarkScore: 75, weight: 0.9 },
  { id: 'c0000000-0000-0000-0000-000000000010', code: 'STAT_QUAL', name: 'Data Quality', category: 'Statistical', description: 'MoSPI Quality Assurance Framework (NQAF), non-sampling error minimization, and validation.', benchmarkScore: 85, weight: 1.1 },

  // 2. Technical Domain (12)
  { id: 'c0000000-0000-0000-0000-000000000011', code: 'TECH_PYTH', name: 'Python', category: 'Technical', description: 'Pandas, NumPy, automated data wrangling, and survey statistical computation.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000012', code: 'TECH_RPRG', name: 'R Programming', category: 'Technical', description: 'Survey package in R, complex survey estimation, and reproducible statistical reporting.', benchmarkScore: 75, weight: 0.9 },
  { id: 'c0000000-0000-0000-0000-000000000013', code: 'TECH_SQLD', name: 'SQL', category: 'Technical', description: 'Relational database queries, statistical aggregations, and data warehouse management.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000014', code: 'TECH_STAT', name: 'Stata', category: 'Technical', description: 'Microdata tabulation, econometric modeling, and survey regression analysis in Stata.', benchmarkScore: 70, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000015', code: 'TECH_SPSS', name: 'SPSS', category: 'Technical', description: 'Statistical Package for Social Sciences for census and survey cross-tabulations.', benchmarkScore: 70, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000016', code: 'TECH_SASD', name: 'SAS', category: 'Technical', description: 'Enterprise statistical analytics, macros, and large-scale data processing.', benchmarkScore: 65, weight: 0.7 },
  { id: 'c0000000-0000-0000-0000-000000000017', code: 'TECH_GISD', name: 'GIS', category: 'Technical', description: 'Geospatial mapping of enumeration blocks, spatial sampling, and GIS visualization.', benchmarkScore: 75, weight: 0.9 },
  { id: 'c0000000-0000-0000-0000-000000000018', code: 'TECH_DVIZ', name: 'Data Visualization', category: 'Technical', description: 'Interactive statistical dashboards, charts, and public dissemination graphics.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000019', code: 'TECH_AIML', name: 'AI/ML', category: 'Technical', description: 'Machine learning algorithms, imputation of missing survey values, and NLP text mining.', benchmarkScore: 75, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000020', code: 'TECH_CLOU', name: 'Cloud Computing', category: 'Technical', description: 'GovCloud statistical data lakes, secure containerization, and distributed storage.', benchmarkScore: 70, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000021', code: 'TECH_APIS', name: 'APIs', category: 'Technical', description: 'RESTful API integration, Open Data endpoints, and microservice architectures.', benchmarkScore: 75, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000022', code: 'TECH_OPDT', name: 'Open Data', category: 'Technical', description: 'National Data Sharing and Accessibility Policy (NDSAP) standards and open portals.', benchmarkScore: 80, weight: 0.9 },

  // 3. Digital Governance Domain (5)
  { id: 'c0000000-0000-0000-0000-000000000023', code: 'GOV_CYBR', name: 'Cybersecurity', category: 'Digital Governance', description: 'Official data security protocols, CERT-In compliance, and endpoint protection.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000024', code: 'GOV_PRIV', name: 'Data Privacy', category: 'Digital Governance', description: 'Digital Personal Data Protection (DPDP) Act compliance and microdata anonymization.', benchmarkScore: 85, weight: 1.1 },
  { id: 'c0000000-0000-0000-0000-000000000025', code: 'GOV_DSIG', name: 'Digital Signatures', category: 'Digital Governance', description: 'e-Sign, PKI infrastructure, and official document authenticity verification.', benchmarkScore: 75, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000026', code: 'GOV_GCLD', name: 'Government Cloud', category: 'Digital Governance', description: 'MeitY GI Cloud (MeghRaj) guidelines and government data sovereignty standards.', benchmarkScore: 75, weight: 0.8 },
  { id: 'c0000000-0000-0000-0000-000000000027', code: 'GOV_DPIN', name: 'Digital Public Infrastructure', category: 'Digital Governance', description: 'India Stack, Aadhaar-linked verification, and DigiLocker interoperability.', benchmarkScore: 80, weight: 1.0 },

  // 4. Behavioural / Managerial Domain (6)
  { id: 'c0000000-0000-0000-0000-000000000028', code: 'MGR_LEAD', name: 'Leadership', category: 'Behavioural/Managerial', description: 'Team leadership in large-scale national census and survey operations.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000029', code: 'MGR_COMM', name: 'Communication', category: 'Behavioural/Managerial', description: 'Effective statistical storytelling, inter-ministerial liaison, and brief drafting.', benchmarkScore: 85, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000030', code: 'MGR_PRJM', name: 'Project Management', category: 'Behavioural/Managerial', description: 'Survey timeline management, budget adherence, and field investigator coordination.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000031', code: 'MGR_ETHC', name: 'Ethics', category: 'Behavioural/Managerial', description: 'Official statistics confidentiality (Collection of Statistics Act) and integrity.', benchmarkScore: 90, weight: 1.2 },
  { id: 'c0000000-0000-0000-0000-000000000032', code: 'MGR_DECM', name: 'Decision Making', category: 'Behavioural/Managerial', description: 'Evidence-based policy advisory and operational bottleneck resolution.', benchmarkScore: 80, weight: 1.0 },
  { id: 'c0000000-0000-0000-0000-000000000033', code: 'MGR_CHGM', name: 'Change Management', category: 'Behavioural/Managerial', description: 'Transitioning field cadres from paper schedules (PAPI) to digital tablets (CAPI).', benchmarkScore: 75, weight: 0.9 }
];

export const DEMO_OFFICIAL_PROFILE: UserProfile = {
  id: 'd0000000-0000-0000-0000-000000000001',
  email: 'officer.demo@mospi.gov.in',
  fullName: 'Rajesh Kumar Sharma',
  designation: 'Statistical Officer',
  department: 'Ministry of Statistics & Programme Implementation (NSSO - Field Operations Division)',
  jobRole: 'Sample Survey Field & Estimation Specialist',
  experienceYears: 6,
  education: 'M.Sc. in Statistics (University of Delhi)',
  currentAssignment: 'Periodic Labour Force Survey (PLFS) 2024-25 Round 8',
  createdAt: '2026-08-30T10:00:00Z',
  updatedAt: '2026-08-30T10:00:00Z'
};

export const DEMO_USER_COMPETENCIES: UserCompetencyScore[] = [
  {
    id: 'uc_001',
    userId: 'd0000000-0000-0000-0000-000000000001',
    competencyId: 'c0000000-0000-0000-0000-000000000002', // Sampling
    competency: MASTER_COMPETENCIES[1],
    estimatedScore: 35,
    benchmarkScore: 85,
    gapScore: 50,
    confidenceLevel: 0.85,
    lastAssessedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'uc_002',
    userId: 'd0000000-0000-0000-0000-000000000001',
    competencyId: 'c0000000-0000-0000-0000-000000000010', // Data Quality
    competency: MASTER_COMPETENCIES[9],
    estimatedScore: 48,
    benchmarkScore: 85,
    gapScore: 37,
    confidenceLevel: 0.80,
    lastAssessedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'uc_003',
    userId: 'd0000000-0000-0000-0000-000000000001',
    competencyId: 'c0000000-0000-0000-0000-000000000011', // Python
    competency: MASTER_COMPETENCIES[10],
    estimatedScore: 42,
    benchmarkScore: 80,
    gapScore: 38,
    confidenceLevel: 0.75,
    lastAssessedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'uc_004',
    userId: 'd0000000-0000-0000-0000-000000000001',
    competencyId: 'c0000000-0000-0000-0000-000000000019', // AI/ML
    competency: MASTER_COMPETENCIES[18],
    estimatedScore: 30,
    benchmarkScore: 75,
    gapScore: 45,
    confidenceLevel: 0.70,
    lastAssessedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'uc_005',
    userId: 'd0000000-0000-0000-0000-000000000001',
    competencyId: 'c0000000-0000-0000-0000-000000000001', // Survey Design
    competency: MASTER_COMPETENCIES[0],
    estimatedScore: 70,
    benchmarkScore: 80,
    gapScore: 10,
    confidenceLevel: 0.90,
    lastAssessedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'uc_006',
    userId: 'd0000000-0000-0000-0000-000000000001',
    competencyId: 'c0000000-0000-0000-0000-000000000031', // Ethics
    competency: MASTER_COMPETENCIES[30],
    estimatedScore: 88,
    benchmarkScore: 90,
    gapScore: 2,
    confidenceLevel: 0.95,
    lastAssessedAt: '2026-08-30T09:30:00Z'
  },
  {
    id: 'uc_007',
    userId: 'd0000000-0000-0000-0000-000000000001',
    competencyId: 'c0000000-0000-0000-0000-000000000024', // Data Privacy
    competency: MASTER_COMPETENCIES[23],
    estimatedScore: 55,
    benchmarkScore: 85,
    gapScore: 30,
    confidenceLevel: 0.80,
    lastAssessedAt: '2026-08-30T09:30:00Z'
  }
];

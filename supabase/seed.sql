-- ==============================================================================
-- StatIntel: Master Framework Seed Data
-- ==============================================================================

-- 1. Insert Core Competencies
INSERT INTO public.competencies (id, code, name, category, description, benchmark_score, weight) VALUES
-- Statistical Domain
('c0000000-0000-0000-0000-000000000001', 'STAT_SURV', 'Survey Design', 'Statistical', 'Concepts of target population, survey instruments, sampling frames, and pilot testing.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000002', 'STAT_SAMP', 'Sampling', 'Statistical', 'Multi-stage stratified sampling, PPS selection, cluster sampling, and design weights.', 85.0, 1.2),
('c0000000-0000-0000-0000-000000000003', 'STAT_NACC', 'National Accounts', 'Statistical', 'GDP computation, input-output tables, GVA estimation, and SNA 2008 standards.', 75.0, 1.0),
('c0000000-0000-0000-0000-000000000004', 'STAT_PRIC', 'Price Statistics', 'Statistical', 'Consumer Price Index (CPI), Wholesale Price Index (WPI), weighting diagrams, and deflation.', 75.0, 0.9),
('c0000000-0000-0000-0000-000000000005', 'STAT_LABR', 'Labour Statistics', 'Statistical', 'PLFS indicators, Labour Force Participation Rate (LFPR), WPR, and unemployment rates.', 75.0, 0.9),
('c0000000-0000-0000-0000-000000000006', 'STAT_AGRI', 'Agricultural Statistics', 'Statistical', 'Crop estimation surveys, agricultural census methodologies, and yield forecasts.', 70.0, 0.8),
('c0000000-0000-0000-0000-000000000007', 'STAT_INDU', 'Industrial Statistics', 'Statistical', 'Index of Industrial Production (IIP), ASI schedules, and NIC code classifications.', 70.0, 0.8),
('c0000000-0000-0000-0000-000000000008', 'STAT_SDGS', 'SDG Indicators', 'Statistical', 'National Indicator Framework (NIF) for Sustainable Development Goals tracking.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000009', 'STAT_META', 'Metadata Standards', 'Statistical', 'SDMX, DDI metadata schemas, and statistical data catalogue harmonization.', 75.0, 0.9),
('c0000000-0000-0000-0000-000000000010', 'STAT_QUAL', 'Data Quality', 'Statistical', 'MoSPI Quality Assurance Framework (NQAF), non-sampling error minimization, and validation.', 85.0, 1.1),

-- Technical Domain
('c0000000-0000-0000-0000-000000000011', 'TECH_PYTH', 'Python', 'Technical', 'Pandas, NumPy, automated data wrangling, and survey statistical computation.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000012', 'TECH_RPRG', 'R Programming', 'Technical', 'Survey package in R, complex survey estimation, and reproducible statistical reporting.', 75.0, 0.9),
('c0000000-0000-0000-0000-000000000013', 'TECH_SQLD', 'SQL', 'Technical', 'Relational database queries, statistical aggregations, and data warehouse management.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000014', 'TECH_STAT', 'Stata', 'Technical', 'Microdata tabulation, econometric modeling, and survey regression analysis in Stata.', 70.0, 0.8),
('c0000000-0000-0000-0000-000000000015', 'TECH_SPSS', 'SPSS', 'Technical', 'Statistical Package for Social Sciences for census and survey cross-tabulations.', 70.0, 0.8),
('c0000000-0000-0000-0000-000000000016', 'TECH_SASD', 'SAS', 'Technical', 'Enterprise statistical analytics, macros, and large-scale data processing.', 65.0, 0.7),
('c0000000-0000-0000-0000-000000000017', 'TECH_GISD', 'GIS', 'Technical', 'Geospatial mapping of enumeration blocks, spatial sampling, and GIS visualization.', 75.0, 0.9),
('c0000000-0000-0000-0000-000000000018', 'TECH_DVIZ', 'Data Visualization', 'Technical', 'Interactive statistical dashboards, charts, and public dissemination graphics.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000019', 'TECH_AIML', 'AI/ML', 'Technical', 'Machine learning algorithms, imputation of missing survey values, and NLP text mining.', 75.0, 1.0),
('c0000000-0000-0000-0000-000000000020', 'TECH_CLOU', 'Cloud Computing', 'Technical', 'GovCloud statistical data lakes, secure containerization, and distributed storage.', 70.0, 0.8),
('c0000000-0000-0000-0000-000000000021', 'TECH_APIS', 'APIs', 'Technical', 'RESTful API integration, Open Data endpoints, and microservice architectures.', 75.0, 0.8),
('c0000000-0000-0000-0000-000000000022', 'TECH_OPDT', 'Open Data', 'Technical', 'National Data Sharing and Accessibility Policy (NDSAP) standards and open portals.', 80.0, 0.9),

-- Digital Governance Domain
('c0000000-0000-0000-0000-000000000023', 'GOV_CYBR', 'Cybersecurity', 'Digital Governance', 'Official data security protocols, CERT-In compliance, and endpoint protection.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000024', 'GOV_PRIV', 'Data Privacy', 'Digital Governance', 'Digital Personal Data Protection (DPDP) Act compliance and microdata anonymization.', 85.0, 1.1),
('c0000000-0000-0000-0000-000000000025', 'GOV_DSIG', 'Digital Signatures', 'Digital Governance', 'e-Sign, PKI infrastructure, and official document authenticity verification.', 75.0, 0.8),
('c0000000-0000-0000-0000-000000000026', 'GOV_GCLD', 'Government Cloud', 'Digital Governance', 'MeitY GI Cloud (MeghRaj) guidelines and government data sovereignty standards.', 75.0, 0.8),
('c0000000-0000-0000-0000-000000000027', 'GOV_DPIN', 'Digital Public Infrastructure', 'Digital Governance', 'India Stack, Aadhaar-linked verification, and DigiLocker interoperability.', 80.0, 1.0),

-- Behavioural/Managerial Domain
('c0000000-0000-0000-0000-000000000028', 'MGR_LEAD', 'Leadership', 'Behavioural/Managerial', 'Team leadership in large-scale national census and survey operations.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000029', 'MGR_COMM', 'Communication', 'Behavioural/Managerial', 'Effective statistical storytelling, inter-ministerial liaison, and brief drafting.', 85.0, 1.0),
('c0000000-0000-0000-0000-000000000030', 'MGR_PRJM', 'Project Management', 'Behavioural/Managerial', 'Survey timeline management, budget adherence, and field investigator coordination.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000031', 'MGR_ETHC', 'Ethics', 'Behavioural/Managerial', 'Official statistics confidentiality (Collection of Statistics Act) and integrity.', 90.0, 1.2),
('c0000000-0000-0000-0000-000000000032', 'MGR_DECM', 'Decision Making', 'Behavioural/Managerial', 'Evidence-based policy advisory and operational bottleneck resolution.', 80.0, 1.0),
('c0000000-0000-0000-0000-000000000033', 'MGR_CHGM', 'Change Management', 'Behavioural/Managerial', 'Transitioning field cadres from paper schedules (PAPI) to digital tablets (CAPI).', 75.0, 0.9)
ON CONFLICT (code) DO NOTHING;

-- 2. Demo Official Profile (Statistical Officer with realistic Sampling gap)
INSERT INTO public.profiles (
    id, email, full_name, designation, department, job_role, experience_years, education, current_assignment
) VALUES (
    'd0000000-0000-0000-0000-000000000001',
    'officer.demo@mospi.gov.in',
    'Rajesh Kumar Sharma',
    'Statistical Officer',
    'Ministry of Statistics & Programme Implementation (NSSO - Field Operations Division)',
    'Sample Survey Field & Estimation Specialist',
    6,
    'M.Sc. in Statistics (University of Delhi)',
    'Periodic Labour Force Survey (PLFS) 2024-25 Round 8'
) ON CONFLICT (email) DO NOTHING;

-- 3. Initial Baseline Competencies for Demo Officer
INSERT INTO public.user_competencies (user_id, competency_id, estimated_score, benchmark_score, confidence_level) VALUES
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002', 35.0, 85.0, 0.85), -- Sampling (High Gap: 50)
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000010', 50.0, 85.0, 0.80), -- Data Quality (Gap: 35)
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000011', 45.0, 80.0, 0.70), -- Python (Gap: 35)
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 70.0, 80.0, 0.90), -- Survey Design (Low Gap: 10)
('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000031', 88.0, 90.0, 0.95)  -- Ethics (Very Low Gap: 2)
ON CONFLICT (user_id, competency_id) DO UPDATE 
SET estimated_score = EXCLUDED.estimated_score, benchmark_score = EXCLUDED.benchmark_score;

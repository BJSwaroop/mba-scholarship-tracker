// ============================================================================
//  data.ts — Types + seed data for the MBA Application & Scholarship Tracker
//  Edit the SEED below to change what loads on first run / after "Reset".
//  Dates marked `approx: true` show a small "verify" flag in the UI.
// ============================================================================

export type Status =
  | 'Not started'
  | 'In progress'
  | 'Submitted'
  | 'Interview'
  | 'Admitted'
  | 'Funded'
  | 'Rejected';

export type SchoolType = 'Chevening core' | 'India backup' | 'Scholarship-or-nothing reach';

export type ApplyType = 'Automatic' | 'Separate application';

export type MilestoneCategory =
  | 'Chevening'
  | 'GMAT'
  | 'School'
  | 'Loan-scholarship'
  | 'Personal';

export interface ScholarshipAward {
  id: string;
  name: string;
  amount: string; // e.g. "100% tuition", "£50,000", "₹20L @ 2%"
  apply: ApplyType;
  deadline?: string; // ISO date or note
  approx?: boolean; // date is approximate → show verify flag
  notes?: string;
  status: Status;
}

export interface Round {
  id: string;
  name: string;
  date: string; // ISO date
  approx?: boolean;
}

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  program: string;
  durationMonths: number;
  tuition: string;
  cheveningGap?: string; // tuition above the £22,000 Chevening cap
  gmatPolicy: string;
  rounds: Round[];
  scholarships: ScholarshipAward[];
  status: Status;
  link?: string;
  notes?: string;
}

export interface LoanScholarship {
  id: string;
  name: string;
  amount: string;
  eligibility: string;
  window: string;
  process: string;
  status: Status;
  link?: string;
}

export interface Milestone {
  id: string;
  date: string; // ISO date
  label: string;
  category: MilestoneCategory;
  done: boolean;
  approx?: boolean;
}

export interface Essay {
  id: string;
  title: string;
  forWhom: string;
  wordLimit?: number;
  status: Status;
}

export interface Task {
  id: string;
  title: string;
  due?: string; // ISO date
  category: string;
  done: boolean;
}

export interface Recommender {
  id: string;
  name: string;
  relationship: string;
  status: Status;
}

export interface Meta {
  candidate: string;
  goal: string;
  constraint: string;
  cheveningCap: string;
  gmatTarget: string;
}

// ---- Test prep (GMAT Focus / GRE) ----

export type TestType = 'GMAT' | 'GRE';
export type PrepRoute = 'Undecided' | 'Waiver-first' | 'GMAT' | 'GRE';
export type ResourceStatus = 'To explore' | 'Using' | 'Done';
export type ResourceKind = 'Official' | 'Course' | 'Books' | 'Practice tests' | 'Free';

export interface PrepSection {
  id: string;
  test: TestType;
  name: string;
  range: string; // scoring range, e.g. "60–90"
  target: string; // target for this section
  confidence: number; // 0..100 self-rated readiness
}

export interface MockTest {
  id: string;
  test: TestType;
  label: string; // e.g. "Official Practice Exam 1"
  date?: string; // ISO date taken
  score?: number; // total score
  notes?: string;
}

export interface PrepResource {
  id: string;
  name: string;
  test: TestType | 'Both';
  kind: ResourceKind;
  link?: string;
  cost?: string;
  notes?: string;
  status: ResourceStatus;
}

export interface PrepStep {
  id: string;
  phase: string; // e.g. "Phase 1 · Diagnostic & foundations"
  date: string; // ISO date
  label: string;
  done: boolean;
  approx?: boolean;
}

export interface TestTarget {
  display: string; // "655+ (Focus Edition)"
  score: number; // numeric, for the mock-trend reference line
  range: string; // "205–805"
}

export interface TestPrep {
  route: PrepRoute;
  decideBy: string; // ISO, approx
  targetTestDate: string; // ISO, approx
  targets: { gmat: TestTarget; gre: TestTarget };
  sections: PrepSection[];
  mocks: MockTest[];
  plan: PrepStep[];
  resources: PrepResource[];
}

export interface AppData {
  meta: Meta;
  schools: School[];
  loanScholarships: LoanScholarship[];
  milestones: Milestone[];
  essays: Essay[];
  tasks: Task[];
  recommenders: Recommender[];
  testPrep: TestPrep;
}

// Bump this if the shape of the seed changes incompatibly.
export const DATA_VERSION = 1;
export const STORAGE_KEY = 'mba-tracker:v1';

// Stable, readable ids without authoring noise in the seed below.
const counters: Record<string, number> = {};
function gid(prefix: string): string {
  counters[prefix] = (counters[prefix] || 0) + 1;
  return `${prefix}-${counters[prefix]}`;
}

const sch = (s: Omit<ScholarshipAward, 'id'>): ScholarshipAward => ({ id: gid('sch'), ...s });
const rnd = (r: Omit<Round, 'id'>): Round => ({ id: gid('rnd'), ...r });
const mil = (m: Omit<Milestone, 'id'>): Milestone => ({ id: gid('mil'), ...m });
const ess = (e: Omit<Essay, 'id'>): Essay => ({ id: gid('ess'), ...e });
const tsk = (t: Omit<Task, 'id'>): Task => ({ id: gid('tsk'), ...t });
const loan = (l: Omit<LoanScholarship, 'id'>): LoanScholarship => ({ id: gid('loan'), ...l });
const rec = (r: Omit<Recommender, 'id'>): Recommender => ({ id: gid('rec'), ...r });
const psec = (s: Omit<PrepSection, 'id'>): PrepSection => ({ id: gid('psec'), ...s });
const pres = (r: Omit<PrepResource, 'id'>): PrepResource => ({ id: gid('pres'), ...r });
const pstep = (s: Omit<PrepStep, 'id'>): PrepStep => ({ id: gid('pstep'), ...s });

/**
 * Build a fresh copy of the seed data. Called on first load and on "Reset".
 * Resets the id counters so a reset always produces the same ids.
 */
export function buildSeed(): AppData {
  for (const k of Object.keys(counters)) delete counters[k];

  const schools: School[] = [
    {
      id: 'bath',
      name: 'University of Bath',
      type: 'Chevening core',
      program: 'MBA (School of Management)',
      durationMonths: 12,
      tuition: '~£34,000',
      cheveningGap: '~£12,000 (smallest gap)',
      gmatPolicy: 'Often flexible — GMAT not always required.',
      link: 'https://www.bath.ac.uk/courses/postgraduate-2026/taught-postgraduate-courses/full-time-mba/',
      status: 'Not started',
      rounds: [rnd({ name: 'Rolling admissions (multiple stages)', date: '2026-09-01', approx: true })],
      scholarships: [
        sch({
          name: 'Bath MBA Scholarships',
          amount: 'Partial (merit-based)',
          apply: 'Automatic',
          notes: 'Considered automatically on admission.',
          status: 'Not started',
        }),
        sch({
          name: 'Chevening Scholarship',
          amount: 'Tuition to £22,000 cap + stipend',
          apply: 'Separate application',
          deadline: '2026-11-03',
          approx: true,
          notes: 'Apply via the Chevening portal. Smallest funding gap of the UK options.',
          status: 'Not started',
        }),
      ],
    },
    {
      id: 'warwick',
      name: 'Warwick (WBS)',
      type: 'Chevening core',
      program: 'Full-time MBA',
      durationMonths: 12,
      tuition: '~£47,750',
      cheveningGap: '~£25,750',
      gmatPolicy: 'GMAT/GRE or the Warwick Test (waiver-style for experienced candidates).',
      link: 'https://www.wbs.ac.uk/courses/mba/full-time/',
      status: 'Not started',
      rounds: [
        rnd({ name: 'Stage 1', date: '2026-09-01', approx: true }),
        rnd({ name: 'Stage 2', date: '2026-10-15', approx: true }),
        rnd({ name: 'Stage 3', date: '2026-12-01', approx: true }),
        rnd({ name: 'Stage 4', date: '2027-01-15', approx: true }),
        rnd({ name: 'Stage 5', date: '2027-03-01', approx: true }),
      ],
      scholarships: [
        sch({ name: 'WBS Scholarships', amount: 'Partial (merit)', apply: 'Automatic', status: 'Not started' }),
        sch({
          name: 'Chevening Scholarship',
          amount: 'Tuition to £22,000 cap + stipend',
          apply: 'Separate application',
          deadline: '2026-11-03',
          approx: true,
          notes: 'Gap above the cap ~£25,750.',
          status: 'Not started',
        }),
      ],
    },
    {
      id: 'imperial',
      name: 'Imperial College Business School',
      type: 'Chevening core',
      program: 'Full-time MBA',
      durationMonths: 12,
      tuition: '~£57,200',
      cheveningGap: '~£35,200 (largest gap)',
      gmatPolicy: 'GMAT required; case-by-case waiver — submit waiver form BEFORE applying.',
      link: 'https://www.imperial.ac.uk/business-school/programmes/full-time-mba/',
      status: 'Not started',
      rounds: [
        rnd({ name: 'GMAT waiver form (before applying)', date: '2026-08-15', approx: true }),
        rnd({ name: 'Round 1', date: '2026-09-01', approx: true }),
        rnd({ name: 'Round 2', date: '2026-11-01', approx: true }),
        rnd({ name: 'Round 3', date: '2027-01-15', approx: true }),
      ],
      scholarships: [
        sch({ name: 'Imperial Business School Scholarships', amount: 'Partial (merit)', apply: 'Automatic', status: 'Not started' }),
        sch({
          name: 'Chevening (matched)',
          amount: 'Tuition to £22,000 cap + stipend',
          apply: 'Separate application',
          deadline: '2026-11-03',
          approx: true,
          notes: 'Largest gap ~£35,200. Submit the GMAT waiver form before applying.',
          status: 'Not started',
        }),
      ],
    },
    {
      id: 'isb',
      name: 'ISB (Indian School of Business)',
      type: 'India backup',
      program: 'PGP',
      durationMonths: 12,
      tuition: '~₹38–40L',
      gmatPolicy: 'GMAT/GRE — holistic admit.',
      link: 'https://www.isb.edu/en/study-isb/post-graduate-programmes/pgp.html',
      status: 'Not started',
      rounds: [
        rnd({ name: 'Early', date: '2026-09-15', approx: true }),
        rnd({ name: 'Round 1', date: '2026-12-01', approx: true }),
        rnd({ name: 'Round 2', date: '2027-01-15', approx: true }),
      ],
      scholarships: [
        sch({ name: 'ISB Merit Scholarships', amount: 'Partial', apply: 'Automatic', notes: 'Considered at admission.', status: 'Not started' }),
        sch({
          name: 'ISB Need-based Scholarships',
          amount: 'Partial',
          apply: 'Separate application',
          notes: 'Separate need-assessment form required.',
          status: 'Not started',
        }),
      ],
    },
    {
      id: 'lbs',
      name: 'London Business School',
      type: 'Scholarship-or-nothing reach',
      program: 'MBA',
      durationMonths: 18,
      tuition: '~£120,000',
      gmatPolicy: 'GMAT/GRE — skews experienced.',
      link: 'https://www.london.edu/masters-degrees/mba',
      status: 'Not started',
      notes: '15–21 month programme. Only viable with a status-defining scholarship.',
      rounds: [
        rnd({ name: 'Round 1', date: '2026-09-15', approx: true }),
        rnd({ name: 'Round 2', date: '2027-01-08', approx: true }),
        rnd({ name: 'Round 3', date: '2027-04-15', approx: true }),
      ],
      scholarships: [
        sch({
          name: 'SARI Foundation Trust Scholarship',
          amount: '100% tuition',
          apply: 'Separate application',
          notes: 'Status-defining — this is what makes LBS possible. Confirm eligibility + essay.',
          status: 'Not started',
        }),
        sch({
          name: 'Ajay Arora Scholarship',
          amount: '£50,000',
          apply: 'Separate application',
          notes: 'For Indian nationals. Separate essay.',
          status: 'Not started',
        }),
        sch({
          name: 'LBS India Scholarship',
          amount: 'Partial',
          apply: 'Automatic',
          notes: 'Mostly automatic at admission; confirm whether a form is needed.',
          status: 'Not started',
        }),
      ],
    },
    {
      id: 'oxford',
      name: 'Oxford Saïd',
      type: 'Scholarship-or-nothing reach',
      program: 'MBA',
      durationMonths: 12,
      tuition: '~£71,000',
      gmatPolicy: 'GMAT/GRE.',
      link: 'https://www.sbs.ox.ac.uk/programmes/mbas/oxford-mba',
      status: 'Not started',
      rounds: [
        rnd({ name: 'Stage 1', date: '2026-09-08', approx: true }),
        rnd({ name: 'Stage 2', date: '2026-10-13', approx: true }),
        rnd({ name: 'Stage 3', date: '2026-11-10', approx: true }),
        rnd({ name: 'Stage 4', date: '2027-01-12', approx: true }),
      ],
      scholarships: [
        sch({
          name: 'Skoll Scholarship',
          amount: 'Full fees + living costs',
          apply: 'Separate application',
          notes: 'Separate essay INSIDE the MBA application — for social entrepreneurs.',
          status: 'Not started',
        }),
        sch({
          name: 'Weidenfeld-Hoffmann Scholarship',
          amount: 'Full fees + living',
          apply: 'Separate application',
          notes: 'Leadership programme; separate application.',
          status: 'Not started',
        }),
        sch({
          name: 'Pershing Square Scholarship',
          amount: 'Full fees + stipend',
          apply: 'Separate application',
          deadline: '2026-09-08',
          approx: true,
          notes: 'EARLIER deadline than the MBA rounds — do not miss it.',
          status: 'Not started',
        }),
      ],
    },
    {
      id: 'cambridge',
      name: 'Cambridge Judge',
      type: 'Scholarship-or-nothing reach',
      program: 'MBA',
      durationMonths: 12,
      tuition: '~£64,000',
      gmatPolicy: 'GMAT/GRE.',
      link: 'https://www.jbs.cam.ac.uk/programmes/mba/',
      status: 'Not started',
      notes: '2027 entry rounds have firm dates.',
      rounds: [
        rnd({ name: 'Round 1', date: '2026-08-24' }),
        rnd({ name: 'Round 2', date: '2026-10-05' }),
        rnd({ name: 'Round 3', date: '2027-01-04' }),
        rnd({ name: 'Round 4', date: '2027-03-22' }),
        rnd({ name: 'Round 5', date: '2027-05-04' }),
      ],
      scholarships: [
        sch({
          name: 'Boustany MBA Scholarship',
          amount: '75% tuition + travel/internship costs',
          apply: 'Separate application',
          notes: 'Apply AFTER admit. Awarded every 2 years.',
          status: 'Not started',
        }),
        sch({
          name: 'Cambridge Trust Scholarships',
          amount: 'Partial to full',
          apply: 'Automatic',
          notes: 'Considered via admission / Trust application.',
          status: 'Not started',
        }),
      ],
    },
  ];

  const loanScholarships: LoanScholarship[] = [
    loan({
      name: 'J.N. Tata Endowment',
      amount: 'Up to ₹20L @ ~2%',
      eligibility: 'Indian, under 45, 60%+ undergrad (you: 8.5 CGPA).',
      window: 'Register ~Jan 2027 · form by ~Mar · aptitude test ~late Apr · interview May–Jun',
      process: 'Online application.',
      link: 'https://www.jntataendowment.org',
      status: 'Not started',
    }),
    loan({
      name: 'K.C. Mahindra Education Trust',
      amount: '₹10L (top fellows) / ₹5L',
      eligibility: 'Merit + need.',
      window: '~Jan–Mar 2027',
      process: 'Online + interview.',
      link: 'https://www.kcmet.org',
      status: 'Not started',
    }),
    loan({
      name: 'Narotam Sekhsaria Foundation',
      amount: 'Interest-free loan',
      eligibility: 'Strong academics + need.',
      window: '~Jan–Apr 2027',
      process: 'Aptitude test + interview.',
      link: 'https://www.nsfoundation.co.in',
      status: 'Not started',
    }),
    loan({
      name: 'Aga Khan Foundation',
      amount: '50% grant + 50% loan (tuition + living)',
      eligibility: 'Excellent record + need; preference under 30.',
      window: '~Jan–Mar 2027',
      process: 'Via the AKF India office.',
      link: 'https://www.akdn.org/akf',
      status: 'Not started',
    }),
  ];

  const milestones: Milestone[] = [
    // Chevening (UK route — Bath / Warwick / Imperial)
    mil({ date: '2026-08-03', label: 'Chevening portal opens', category: 'Chevening', done: false, approx: true }),
    mil({ date: '2026-11-03', label: 'Chevening application deadline', category: 'Chevening', done: false, approx: true }),
    mil({ date: '2027-03-01', label: 'Chevening interviews begin', category: 'Chevening', done: false, approx: true }),
    mil({ date: '2027-05-01', label: 'Chevening results', category: 'Chevening', done: false, approx: true }),
    mil({ date: '2027-09-21', label: 'Course starts (UK / 2027 intake)', category: 'Chevening', done: false, approx: true }),

    // GMAT / waiver
    mil({ date: '2026-08-15', label: 'Decide GMAT vs waiver route', category: 'GMAT', done: false, approx: true }),

    // School rounds
    mil({ date: '2026-09-01', label: 'Bath MBA — rolling admissions open', category: 'School', done: false, approx: true }),
    mil({ date: '2026-09-01', label: 'Warwick WBS — Stage 1', category: 'School', done: false, approx: true }),
    mil({ date: '2026-08-15', label: 'Imperial — submit GMAT waiver form', category: 'School', done: false, approx: true }),
    mil({ date: '2026-09-01', label: 'Imperial — applications open', category: 'School', done: false, approx: true }),
    mil({ date: '2026-09-15', label: 'ISB — Early round', category: 'School', done: false, approx: true }),
    mil({ date: '2026-12-01', label: 'ISB — Round 1', category: 'School', done: false, approx: true }),
    mil({ date: '2027-01-15', label: 'ISB — Round 2', category: 'School', done: false, approx: true }),
    mil({ date: '2026-09-15', label: 'LBS — Round 1', category: 'School', done: false, approx: true }),
    mil({ date: '2027-01-08', label: 'LBS — Round 2', category: 'School', done: false, approx: true }),
    mil({ date: '2027-04-15', label: 'LBS — Round 3', category: 'School', done: false, approx: true }),
    mil({ date: '2026-09-08', label: 'Oxford Saïd — Stage 1 (+ Pershing Square deadline)', category: 'School', done: false, approx: true }),
    mil({ date: '2026-10-13', label: 'Oxford Saïd — Stage 2', category: 'School', done: false, approx: true }),
    mil({ date: '2026-11-10', label: 'Oxford Saïd — Stage 3', category: 'School', done: false, approx: true }),
    mil({ date: '2027-01-12', label: 'Oxford Saïd — Stage 4', category: 'School', done: false, approx: true }),
    mil({ date: '2026-08-24', label: 'Cambridge Judge — Round 1', category: 'School', done: false }),
    mil({ date: '2026-10-05', label: 'Cambridge Judge — Round 2', category: 'School', done: false }),
    mil({ date: '2027-01-04', label: 'Cambridge Judge — Round 3', category: 'School', done: false }),
    mil({ date: '2027-03-22', label: 'Cambridge Judge — Round 4', category: 'School', done: false }),
    mil({ date: '2027-05-04', label: 'Cambridge Judge — Round 5', category: 'School', done: false }),

    // India loan-scholarships (after admits — stackable)
    mil({ date: '2027-01-15', label: 'J.N. Tata Endowment — registration opens', category: 'Loan-scholarship', done: false, approx: true }),
    mil({ date: '2027-03-15', label: 'J.N. Tata Endowment — application form deadline', category: 'Loan-scholarship', done: false, approx: true }),
    mil({ date: '2027-04-25', label: 'J.N. Tata Endowment — aptitude test', category: 'Loan-scholarship', done: false, approx: true }),
    mil({ date: '2027-05-20', label: 'J.N. Tata Endowment — interview', category: 'Loan-scholarship', done: false, approx: true }),
    mil({ date: '2027-02-15', label: 'K.C. Mahindra — apply (Jan–Mar window)', category: 'Loan-scholarship', done: false, approx: true }),
    mil({ date: '2027-02-28', label: 'Narotam Sekhsaria — apply (Jan–Apr window)', category: 'Loan-scholarship', done: false, approx: true }),
    mil({ date: '2027-02-15', label: 'Aga Khan Foundation — apply (Jan–Mar window)', category: 'Loan-scholarship', done: false, approx: true }),
  ];

  const essays: Essay[] = [
    ess({ title: 'Chevening — Leadership & Influence', forWhom: 'Chevening', wordLimit: 500, status: 'Not started' }),
    ess({ title: 'Chevening — Networking', forWhom: 'Chevening', wordLimit: 500, status: 'Not started' }),
    ess({ title: 'Chevening — Studying in the UK', forWhom: 'Chevening', wordLimit: 500, status: 'Not started' }),
    ess({ title: 'Chevening — Career Plan', forWhom: 'Chevening', wordLimit: 500, status: 'Not started' }),
    ess({ title: 'Why MBA / Career Goals', forWhom: 'All schools (reusable)', status: 'Not started' }),
    ess({ title: 'Why This School', forWhom: 'Per-school', status: 'Not started' }),
    ess({ title: 'Oxford Skoll Essay', forWhom: 'Oxford Saïd', status: 'Not started' }),
    ess({ title: 'LBS India / Ajay Arora Essay', forWhom: 'LBS', status: 'Not started' }),
  ];

  const tasks: Task[] = [
    tsk({ title: 'Register on the Chevening portal when it opens', due: '2026-08-03', category: 'Chevening', done: false }),
    tsk({ title: 'Decide GMAT vs waiver route', due: '2026-08-15', category: 'GMAT', done: false }),
    tsk({ title: 'Pursue Warwick Test + Imperial waiver first (given 8.5 CGPA)', due: '2026-08-31', category: 'GMAT', done: false }),
    tsk({ title: 'Submit Imperial GMAT waiver form (before applying)', due: '2026-08-31', category: 'School', done: false }),
    tsk({ title: 'Shortlist final schools to apply to', due: '2026-08-31', category: 'School', done: false }),
    tsk({ title: 'Prepare Pershing Square (earlier deadline)', due: '2026-09-08', category: 'Scholarship', done: false }),
    tsk({ title: 'Confirm 2 recommenders', due: '2026-09-30', category: 'Recommenders', done: false }),
    tsk({ title: 'Draft the 4 Chevening essays', due: '2026-10-15', category: 'Chevening', done: false }),
    tsk({ title: 'Register for J.N. Tata Endowment', due: '2027-01-15', category: 'Loan-scholarship', done: false }),
  ];

  const recommenders: Recommender[] = [
    rec({ name: 'Senior Scaler / SST leader', relationship: 'Manager / institutional', status: 'Not started' }),
    rec({
      name: 'External industry figure (brand partner / IIT Tirupati host / mentor)',
      relationship: 'Professional mentor',
      status: 'Not started',
    }),
  ];

  const testPrep: TestPrep = {
    // Strategy: chase waivers first (Warwick Test + Imperial waiver) given the
    // 8.5 CGPA, but keep a real GMAT/GRE plan running as a parallel backup.
    route: 'Waiver-first',
    decideBy: '2026-08-15',
    targetTestDate: '2026-09-05',
    targets: {
      gmat: { display: '655+ (Focus Edition)', score: 655, range: '205–805' },
      gre: { display: '325+ (Verbal + Quant)', score: 325, range: '260–340' },
    },
    sections: [
      psec({ test: 'GMAT', name: 'Quantitative Reasoning', range: '60–90', target: '84+', confidence: 15 }),
      psec({ test: 'GMAT', name: 'Verbal Reasoning', range: '60–90', target: '85+', confidence: 20 }),
      psec({ test: 'GMAT', name: 'Data Insights', range: '60–90', target: '80+', confidence: 10 }),
      psec({ test: 'GRE', name: 'Quantitative Reasoning', range: '130–170', target: '165', confidence: 15 }),
      psec({ test: 'GRE', name: 'Verbal Reasoning', range: '130–170', target: '160', confidence: 20 }),
      psec({ test: 'GRE', name: 'Analytical Writing', range: '0–6', target: '4.5', confidence: 25 }),
    ],
    mocks: [], // log practice-test results as you take them
    plan: [
      // Phase 1 — Diagnostic & foundations
      pstep({ phase: 'Phase 1 · Diagnostic & foundations', date: '2026-06-22', label: 'Take a free official diagnostic mock to baseline (GMAT Official Practice 1 / GRE POWERPREP 1)', done: false, approx: true }),
      pstep({ phase: 'Phase 1 · Diagnostic & foundations', date: '2026-06-28', label: 'Pick the primary test: GMAT Focus vs GRE (use the diagnostic + section comfort)', done: false, approx: true }),
      pstep({ phase: 'Phase 1 · Diagnostic & foundations', date: '2026-07-05', label: 'Set a study schedule (~10–12 hrs/week) and gather resources', done: false, approx: true }),
      // Phase 2 — Core concepts
      pstep({ phase: 'Phase 2 · Core concepts', date: '2026-07-12', label: 'Quant fundamentals pass + daily problem sets', done: false, approx: true }),
      pstep({ phase: 'Phase 2 · Core concepts', date: '2026-07-19', label: 'Verbal fundamentals pass (RC / CR / SC, or GRE Verbal + vocab)', done: false, approx: true }),
      pstep({ phase: 'Phase 2 · Core concepts', date: '2026-07-26', label: 'Data Insights (GMAT) / Analytical Writing (GRE) focused practice', done: false, approx: true }),
      pstep({ phase: 'Phase 2 · Core concepts', date: '2026-08-02', label: 'Full-length mock #2 — review every error, start an error log', done: false, approx: true }),
      // Phase 3 — Practice & timing
      pstep({ phase: 'Phase 3 · Practice & timing', date: '2026-08-09', label: 'Timed section sets; drill weak areas from the error log', done: false, approx: true }),
      pstep({ phase: 'Phase 3 · Practice & timing', date: '2026-08-16', label: 'Full-length mock #3 + full review', done: false, approx: true }),
      pstep({ phase: 'Phase 3 · Practice & timing', date: '2026-08-21', label: 'Book the official exam slot (~3 weeks out)', done: false, approx: true }),
      pstep({ phase: 'Phase 3 · Practice & timing', date: '2026-08-23', label: 'Full-length mock #4 — simulate real test-day timing', done: false, approx: true }),
      // Phase 4 — Final & test
      pstep({ phase: 'Phase 4 · Final & test', date: '2026-08-30', label: 'Light review, redo flagged questions, rest well', done: false, approx: true }),
      pstep({ phase: 'Phase 4 · Final & test', date: '2026-09-05', label: 'Test day (target) — send official scores to your schools', done: false, approx: true }),
      pstep({ phase: 'Phase 4 · Final & test', date: '2026-09-15', label: 'Scores ready for Round 1 applications', done: false, approx: true }),
    ],
    resources: [
      // GMAT
      pres({ name: 'GMAT Focus Edition — Official (mba.com)', test: 'GMAT', kind: 'Official', link: 'https://www.mba.com/exams/gmat-focus-edition', cost: 'Exam ~US$275–300', notes: 'Register here. 2 free Official Practice Exams included.', status: 'To explore' }),
      pres({ name: 'GMAT Official Guide 2024–2025', test: 'GMAT', kind: 'Books', link: 'https://www.mba.com/exam-prep', cost: '~₹3–5k', notes: 'Official retired questions + online question bank.', status: 'To explore' }),
      pres({ name: 'GMAT Club', test: 'GMAT', kind: 'Free', link: 'https://gmatclub.com', cost: 'Free', notes: 'Forums, free tests, error log, plus scholarship threads.', status: 'To explore' }),
      pres({ name: 'Target Test Prep (GMAT)', test: 'GMAT', kind: 'Course', link: 'https://www.targettestprep.com', cost: '~US$99/mo', notes: 'Top-rated, especially for Quant & Data Insights.', status: 'To explore' }),
      pres({ name: 'e-GMAT', test: 'GMAT', kind: 'Course', link: 'https://e-gmat.com', cost: '~US$199+', notes: 'Popular with Indian test-takers; strong Verbal (SC/CR).', status: 'To explore' }),
      // GRE
      pres({ name: 'GRE General Test — Official (ETS)', test: 'GRE', kind: 'Official', link: 'https://www.ets.org/gre', cost: 'Exam ~US$220–228', notes: 'Register here. 2 free POWERPREP practice tests.', status: 'To explore' }),
      pres({ name: 'GregMat', test: 'GRE', kind: 'Course', link: 'https://www.gregmat.com', cost: '~US$5/mo', notes: 'Best value; full study plans + Quant/Verbal lessons.', status: 'To explore' }),
      pres({ name: 'Manhattan Prep 5 lb Book (GRE)', test: 'GRE', kind: 'Books', link: 'https://www.manhattanprep.com/gre/', cost: '~₹2–3k', notes: '1,800+ practice problems across all sections.', status: 'To explore' }),
      pres({ name: 'Magoosh GRE', test: 'GRE', kind: 'Course', link: 'https://magoosh.com/gre/', cost: '~US$149', notes: 'Video lessons + question bank, strong mobile app.', status: 'To explore' }),
      // Both
      pres({ name: 'Khan Academy (Math & Verbal foundations)', test: 'Both', kind: 'Free', link: 'https://www.khanacademy.org', cost: 'Free', notes: 'Free brush-up on Quant fundamentals and grammar.', status: 'To explore' }),
    ],
  };

  return {
    meta: {
      candidate: 'B. Jyothi Swaroop',
      goal: '1-year MBA for the 2027 intake → senior marketing / CMO role in India.',
      constraint:
        'Must be largely funded (scholarship + low/zero-interest loan-scholarships); avoid large high-interest debt.',
      cheveningCap: 'Chevening caps MBA tuition at £22,000 — track the gap per school.',
      gmatTarget: 'Target ~655+ GMAT Focus (~710+ old scale) if testing; pursue waivers first.',
    },
    schools,
    loanScholarships,
    milestones,
    essays,
    tasks,
    recommenders,
    testPrep,
  };
}

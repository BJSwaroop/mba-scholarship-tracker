import type { AppData, PrepStep, SchoolType, TestType } from '../data';
import { formatDate } from './dates';

function schoolsByType(data: AppData, type: SchoolType): string {
  const names = data.schools.filter((s) => s.type === type).map((s) => s.name);
  return names.length ? names.join(', ') : '—';
}

function sectionLine(data: AppData, test: TestType): string {
  return data.testPrep.sections
    .filter((s) => s.test === test)
    .map((s) => `${s.name} ${s.confidence}% (target ${s.target})`)
    .join(', ');
}

function appUrl(): string {
  return typeof window !== 'undefined' ? window.location.href : '(the tracker app)';
}

/**
 * A full "study-coach" prompt, pre-filled with the candidate's targets, route,
 * section readiness and dates. Pasted into Claude (cowork) for tailored resource
 * + study-plan guidance.
 */
export function buildCoachPrompt(data: AppData): string {
  const tp = data.testPrep;
  return `I'm preparing for the GMAT Focus Edition / GRE as part of my 2027 MBA applications, and I'd like your help choosing the best resources and building a study plan that fits me.

MY CONTEXT
- Goal: ${data.meta.goal}
- Funding constraint: ${data.meta.constraint}
- Schools I'm targeting:
  • Chevening-core (UK): ${schoolsByType(data, 'Chevening core')}
  • India: ${schoolsByType(data, 'India backup')}
  • Reach: ${schoolsByType(data, 'Scholarship-or-nothing reach')}
- Current test route: ${tp.route} — I'm chasing test waivers first (Warwick Test + Imperial waiver) given my 8.5 CGPA, but I want a strong test score ready as a backup.
- Targets: GMAT Focus ${tp.targets.gmat.display} (range ${tp.targets.gmat.range}); GRE ${tp.targets.gre.display} (range ${tp.targets.gre.range}).
- My self-rated section readiness (0–100%):
  • GMAT — ${sectionLine(data, 'GMAT')}
  • GRE — ${sectionLine(data, 'GRE')}
- Key dates: decide route by ${formatDate(tp.decideBy)}; target test day ${formatDate(tp.targetTestDate)}; scores needed for Round 1 apps by ~mid-Sep 2026.
- Study capacity: ~10–12 hours/week.

WHAT I'D LIKE FROM YOU
1. Whether GMAT Focus or GRE is the better fit for my profile and these specific schools, and why.
2. For the test you recommend, the best resources for each section (free + paid), ranked, with rough cost and who each suits — please include strong options for Indian test-takers and call out the best free starting points.
3. A concrete week-by-week study plan from today to my target test day for ~10–12 hrs/week that prioritises my weakest sections.
4. How to sequence official practice tests, and what score at each checkpoint would tell me I'm on track for ${tp.targets.gmat.display}/${tp.targets.gre.display}.
5. Anything I should double-check myself (exact exam fees, registration lead time, score-release timing, score validity).

For reference, I'm tracking everything (schools, scholarships, this prep plan) in my app here: ${appUrl()}
Please give me direct, specific recommendations rather than generic advice.`;
}

/** A focused prompt for one study-plan step. */
export function buildStepPrompt(data: AppData, step: PrepStep): string {
  const tp = data.testPrep;
  const weak = [...tp.sections]
    .sort((a, b) => a.confidence - b.confidence)
    .slice(0, 3)
    .map((s) => `${s.test} ${s.name} (${s.confidence}%)`)
    .join(', ');

  return `Help me complete this step of my GMAT/GRE prep plan:
"${step.label}"
(phase: ${step.phase}; target date: ${formatDate(step.date)})

MY CONTEXT: targeting GMAT Focus ${tp.targets.gmat.display} / GRE ${tp.targets.gre.display} for 2027 MBA applications; current route is "${tp.route}"; ~10–12 hrs/week to study. My weakest areas right now: ${weak}.

For THIS specific step, please give me:
1. The best 1–3 resources to use (free + paid, with links if you know them) and why they fit me.
2. A concrete checklist of what "done" looks like for this step.
3. Roughly how many hours it should take and how to split them.
4. One quick way to measure that I actually nailed it before moving on.`;
}

// GAP-267 Phase 1 - the v2 interpretation engine.
//
// Replaces v1's winner-takes-all persona tally (../data/scoring.ts) with
// transparent, answer-anchored dimensions. Rules:
//   1. Every reading traces to the specific answer(s) that support it (evidence).
//   2. Anything not established is UNKNOWN, never invented, never a negative trait.
//   3. Contradictions are surfaced as a clarifying question, not silently resolved.
//   4. No invented confidence percentages.
//   5. A belief is only ever `confirmed` after the user confirms the readout; a
//      proxy answerer's beliefs about the investor are never auto-confirmed.
// This engine produces observations only; it never recommends an action.

import {
  INTERPRETATION_VERSION,
  QUESTIONNAIRE_VERSION,
  type AnsweredBy,
  type Belief,
  type Conflict,
  type DimensionKey,
  type DimensionReading,
  type Readout,
  type RouteId,
  type V2Answer,
  type V2Profile,
} from '../types/v2';
import { QUESTIONS_V2 } from './questionsV2';

const NOT_ESTABLISHED = new Set<string>();
for (const q of QUESTIONS_V2) {
  for (const o of q.options) {
    if (o.notEstablished) NOT_ESTABLISHED.add(`${q.id}:${o.id}`);
  }
}

// Concise value phrases per (questionId, optionId). Used verbatim in "what you
// told us"; kept factual and neutral.
const VALUE_PHRASES: Record<string, Record<string, string>> = {
  purpose: {
    clarify: 'clarify your approach',
    review: 'review an existing process',
    consistency: 'make decisions more consistently',
    'adviser-prep': 'prepare for an adviser conversation',
    explore: 'explore investing',
  },
  objective: {
    growth: 'long-term growth',
    'future-goal': 'a future spending goal',
    income: 'current income',
    preservation: 'preserving spending power',
    several: 'several different jobs',
  },
  timeHorizon: {
    lt3: 'within 3 years',
    '3to7': '3 to 7 years',
    gt7: 'beyond 7 years',
    staggered: 'different portions at different times',
  },
  decisionResponsibility: {
    me: 'mainly you',
    jointly: 'jointly with someone',
    adviser: 'with an adviser',
    delegated: 'delegated to a manager',
  },
  decisionMethod: {
    diversification: 'broad diversification and low costs',
    value: 'business value and price',
    thesis: 'a long-term economic or technological thesis',
    rules: 'predefined rules',
    trends: 'price trends',
    intuition: 'intuition',
    recommendation: 'a recommendation',
    mixture: 'a mixture of approaches',
  },
  recentBehaviour: {
    planned: 'a planned contribution or rebalance',
    evidence: 'changed evidence',
    circumstances: 'changed personal circumstances',
    price: 'price movement',
    recommendation: 'a recommendation',
    instinct: 'instinct',
  },
  explicitBelief: {
    'growth-participation': 'broad participation in economic growth',
    'below-value': 'buying below underlying value',
    'structural-change': 'exposure to structural change',
    'consistent-rules': 'consistent application of rules',
    'capital-preservation': 'preserving capital for its intended use',
    other: 'another reason (in your words)',
  },
  holdingRationale: {
    written: 'written and specific',
    'clear-unwritten': 'clear but unwritten',
    broad: 'a broad idea',
    varies: 'varies between investments',
    'someone-else': "someone else's reasoning",
  },
  reconsideration: {
    'contradicting-evidence': 'evidence contradicting your rationale',
    valuation: 'valuation',
    rule: 'a predefined rule',
    'personal-needs': 'changed personal needs',
    'adviser-review': 'an adviser review',
    'price-alone': 'price movement alone',
  },
  monitoring: {
    schedule: 'on a regular schedule',
    'evidence-changes': 'when relevant evidence changes',
    'alerts-rules': 'via predefined alerts or rules',
    'adviser-led': 'adviser-led',
    'after-price': 'mainly after large price moves',
  },
  uncertaintyResponse: {
    'followed-plan': 'followed your existing plan',
    'sought-evidence': 'sought specific missing evidence',
    'repeatedly-delayed': 'repeatedly delayed a decision you intended to make',
    'changed-quickly': 'changed course quickly',
    'consulted-adviser': 'consulted an adviser',
  },
  supportNeeds: {
    'less-info': 'less information to process',
    'clearer-reasons': 'clearer reasons for holdings',
    'clearer-review': 'clearer review conditions',
    organisation: 'better organisation',
    understanding: 'more understanding',
    'adviser-conversations': 'better adviser conversations',
    nothing: 'nothing specific',
  },
};

// GAP-267: beginner learning-interest option ids -> readable topic labels.
// These become learning-interest beliefs (never declarations) and seed the
// guided learning path downstream.
const LEARNING_INTEREST_PHRASES: Record<string, string> = {
  'how-markets-work': 'how markets work',
  'diversification-index': 'diversification and index funds',
  'company-analysis': 'analysing a company',
  'long-term-themes': 'long-term themes',
  'managing-risk': 'managing risk',
};

const DIMENSION_LABELS: Record<DimensionKey, string> = {
  experience: 'Experience',
  purpose: 'Purpose',
  objective: 'Objective',
  timeHorizon: 'Time horizon',
  decisionResponsibility: 'Who decides',
  decisionMethod: 'Decision method',
  recentBehaviour: 'Recent behaviour',
  explicitBelief: 'Explicit belief',
  holdingRationale: 'Holding rationale',
  reconsideration: 'What would change your mind',
  monitoring: 'Monitoring',
  uncertaintyResponse: 'Under uncertainty',
  supportNeeds: 'Support wanted',
};

const ROUTE_EXPERIENCE: Record<RouteId, string> = {
  learning: 'learning, not yet investing',
  developing: 'started, still developing an approach',
  regular: 'investing regularly',
  established: 'an established process',
  'adviser-led': 'investments managed by someone else',
};

function answerFor(answers: V2Answer[], questionId: string): V2Answer | undefined {
  return answers.find((a) => a.questionId === questionId);
}

// Build one dimension reading from a single-select question. Returns an UNKNOWN
// reading (value null) when unanswered or when the chosen option is
// not-established. Never invents a value.
function readSingle(
  answers: V2Answer[],
  questionId: string,
  key: DimensionKey,
  provenance: 'stated' | 'proxy',
): DimensionReading {
  const label = DIMENSION_LABELS[key];
  const ans = answerFor(answers, questionId);
  const optId = ans?.selectedOptionIds[0];
  if (!ans || !optId || NOT_ESTABLISHED.has(`${questionId}:${optId}`)) {
    return { key, label, value: null, provenance: 'unknown', evidence: ans ? [questionId] : [] };
  }
  const phrase = VALUE_PHRASES[questionId]?.[optId] ?? optId;
  return { key, label, value: phrase, provenance, evidence: [questionId] };
}

export function interpret(
  route: RouteId,
  answers: V2Answer[],
  answeredBy: AnsweredBy = 'self',
): V2Profile {
  const beliefProvenance: 'stated' | 'proxy' = answeredBy === 'proxy' ? 'proxy' : 'stated';
  const dims: DimensionReading[] = [];

  // Experience is established by the routing answer itself.
  dims.push({
    key: 'experience',
    label: DIMENSION_LABELS.experience,
    value: ROUTE_EXPERIENCE[route],
    provenance: answeredBy === 'proxy' ? 'proxy' : 'stated',
    evidence: ['route'],
  });

  dims.push(readSingle(answers, 'purpose', 'purpose', beliefProvenance));
  dims.push(readSingle(answers, 'objective', 'objective', 'stated'));
  dims.push(readSingle(answers, 'timeHorizon', 'timeHorizon', 'stated'));

  // Who decides: the route can already establish it; otherwise read the answer.
  if (route === 'learning') {
    dims.push({ key: 'decisionResponsibility', label: DIMENSION_LABELS.decisionResponsibility, value: 'not investing yet', provenance: 'stated', evidence: ['route'] });
  } else if (route === 'adviser-led') {
    dims.push({ key: 'decisionResponsibility', label: DIMENSION_LABELS.decisionResponsibility, value: 'managed by someone else', provenance: 'stated', evidence: ['route'] });
  } else {
    dims.push(readSingle(answers, 'decisionResponsibility', 'decisionResponsibility', 'stated'));
  }

  dims.push(readSingle(answers, 'decisionMethod', 'decisionMethod', beliefProvenance));
  dims.push(readSingle(answers, 'recentBehaviour', 'recentBehaviour', 'stated'));
  dims.push(readSingle(answers, 'explicitBelief', 'explicitBelief', beliefProvenance));
  dims.push(readSingle(answers, 'holdingRationale', 'holdingRationale', beliefProvenance));

  // Reconsideration is multi-select.
  const recon = answerFor(answers, 'reconsideration');
  const reconIds = (recon?.selectedOptionIds ?? []).filter((id) => !NOT_ESTABLISHED.has(`reconsideration:${id}`));
  if (reconIds.length === 0) {
    dims.push({ key: 'reconsideration', label: DIMENSION_LABELS.reconsideration, value: null, provenance: 'unknown', evidence: recon ? ['reconsideration'] : [] });
  } else {
    const phrase = reconIds.map((id) => VALUE_PHRASES.reconsideration[id] ?? id).join(', ');
    dims.push({ key: 'reconsideration', label: DIMENSION_LABELS.reconsideration, value: phrase, provenance: 'stated', evidence: ['reconsideration'] });
  }

  dims.push(readSingle(answers, 'monitoring', 'monitoring', 'stated'));
  dims.push(readSingle(answers, 'uncertaintyResponse', 'uncertaintyResponse', 'stated'));
  dims.push(readSingle(answers, 'supportNeeds', 'supportNeeds', 'stated'));

  const unknowns = dims.filter((d) => d.value === null).map((d) => d.key);
  const optId = (qid: string) => answerFor(answers, qid)?.selectedOptionIds[0];

  const conflicts = detectConflicts(answers);
  const beliefs = classifyBeliefs(route, answers, answeredBy);
  const readout = buildReadout(route, dims, unknowns, conflicts, optId);

  return {
    questionnaireVersion: QUESTIONNAIRE_VERSION,
    interpretationVersion: INTERPRETATION_VERSION,
    route,
    answeredBy,
    dimensions: dims,
    unknowns,
    conflicts,
    beliefs,
    readout,
    answers,
    confirmed: false,
  };
}

const ANALYTICAL_METHODS = new Set(['value', 'thesis', 'rules', 'diversification']);

function detectConflicts(answers: V2Answer[]): Conflict[] {
  const conflicts: Conflict[] = [];
  const optId = (qid: string) => answerFor(answers, qid)?.selectedOptionIds[0];
  const method = optId('decisionMethod');
  const behaviour = optId('recentBehaviour');
  const recon = answerFor(answers, 'reconsideration')?.selectedOptionIds ?? [];

  // Rules-based method but last action followed a recommendation (astra's example).
  if (method === 'rules' && behaviour === 'recommendation') {
    conflicts.push({
      between: ['decisionMethod', 'recentBehaviour'],
      description: 'You described a rules-based approach, but your most recent decision followed a recommendation.',
      clarifyingQuestion: 'Was that recommendation part of your rules, or an exception?',
    });
  }

  // A deliberate/analytical method but the only stated reconsideration trigger is
  // price movement alone.
  if (method && ANALYTICAL_METHODS.has(method) && recon.length === 1 && recon[0] === 'price-alone') {
    conflicts.push({
      between: ['decisionMethod', 'reconsideration'],
      description: 'You described a deliberate approach, but the only thing that would make you reconsider is price movement on its own.',
      clarifyingQuestion: 'Is price alone really your trigger, or would contradicting evidence also change your mind?',
    });
  }

  // Deliberate method but recent action driven purely by price movement.
  if (method && ANALYTICAL_METHODS.has(method) && behaviour === 'price') {
    conflicts.push({
      between: ['decisionMethod', 'recentBehaviour'],
      description: 'You described a deliberate approach, but your most recent decision was driven by price movement.',
      clarifyingQuestion: 'Was that a planned response, or a departure from your usual approach?',
    });
  }

  return conflicts;
}

function classifyBeliefs(route: RouteId, answers: V2Answer[], answeredBy: AnsweredBy): Belief[] {
  const beliefs: Belief[] = [];
  const belief = answerFor(answers, 'explicitBelief');
  const beliefId = belief?.selectedOptionIds[0];
  const purpose = answerFor(answers, 'purpose')?.selectedOptionIds[0];
  const exploring = route === 'learning' || purpose === 'explore';

  if (beliefId && !NOT_ESTABLISHED.has(`explicitBelief:${beliefId}`) && beliefId !== 'other') {
    const theme = VALUE_PHRASES.explicitBelief[beliefId] ?? beliefId;
    // A stated belief is `considering` until the user confirms the readout, and
    // never auto-confirmed for a proxy answerer. `learning-interest` for a learner.
    const status = exploring || answeredBy === 'proxy' ? (exploring ? 'learning-interest' : 'considering') : 'considering';
    beliefs.push({ theme, status, evidence: ['explicitBelief'] });
  } else if (belief?.text && belief.text.trim()) {
    beliefs.push({ theme: belief.text.trim(), status: exploring ? 'learning-interest' : 'considering', evidence: ['explicitBelief', 'belief-text'] });
  }

  // Beginner learning interests -> learning-interest beliefs (never confirmed).
  const li = answerFor(answers, 'learningInterests');
  for (const id of li?.selectedOptionIds ?? []) {
    if (NOT_ESTABLISHED.has(`learningInterests:${id}`)) continue;
    const theme = LEARNING_INTEREST_PHRASES[id] ?? id.replace(/-/g, ' ');
    beliefs.push({ theme, status: 'learning-interest', evidence: ['learningInterests'] });
  }
  return beliefs;
}

function buildReadout(
  route: RouteId,
  dims: DimensionReading[],
  unknowns: DimensionKey[],
  conflicts: Conflict[],
  optId: (qid: string) => string | undefined,
): Readout {
  const get = (k: DimensionKey) => dims.find((d) => d.key === k)!;
  const known = (k: DimensionKey) => get(k).value !== null;

  // 1. What you told us - only established dimensions. Every answer that the
  // interpretation or unclear sections lean on must appear here, so each
  // conclusion traces to an answer the reader can actually see.
  const told: string[] = [];
  if (known('objective')) told.push(`The main job of this money is ${get('objective').value}.`);
  if (known('timeHorizon')) told.push(`Your time horizon is ${get('timeHorizon').value}.`);
  if (known('decisionMethod')) told.push(`You choose investments using ${get('decisionMethod').value}.`);
  if (known('recentBehaviour')) told.push(`Your most recent investment decision was driven by ${get('recentBehaviour').value}.`);
  if (known('explicitBelief')) told.push(`The reason you expect your approach to work: ${get('explicitBelief').value}.`);
  if (known('holdingRationale')) told.push(`Your reason for owning something is ${get('holdingRationale').value}.`);
  if (known('reconsideration')) told.push(`You would reconsider on: ${get('reconsideration').value}.`);
  if (known('monitoring')) told.push(`You review ${get('monitoring').value}.`);
  if (known('uncertaintyResponse')) told.push(`When uncertain, you have ${get('uncertaintyResponse').value}.`);

  // 2. Our interpretation - each line answer-anchored; conservative.
  const interpretation: string[] = [];
  const method = optId('decisionMethod');
  const monitoring = optId('monitoring');
  const uncertainty = optId('uncertaintyResponse');
  const analytical = method != null && ANALYTICAL_METHODS.has(method);
  const deliberateReview = monitoring === 'schedule' || monitoring === 'evidence-changes' || monitoring === 'alerts-rules';

  if (analytical && deliberateReview) {
    interpretation.push('Your approach appears analytical and deliberate.');
  } else if (analytical) {
    interpretation.push('Your decision method appears analytical.');
  }
  if (method === 'diversification') {
    interpretation.push('You favour broad diversification and low costs. That is a deliberate approach, not a lack of one.');
  }
  if (route === 'adviser-led' || optId('decisionResponsibility') === 'adviser' || optId('decisionResponsibility') === 'delegated') {
    interpretation.push('Your investments are adviser-led or delegated. That describes who decides, not a gap in your understanding.');
  }
  // Decision paralysis: ONLY from the explicit answer, never inferred.
  if (uncertainty === 'repeatedly-delayed') {
    interpretation.push('You reported repeatedly delaying decisions you intended to make.');
  }
  if (route === 'learning' || optId('purpose') === 'explore') {
    interpretation.push("You're exploring investing. We haven't assumed you already have an approach.");
  }

  // 3. What remains unclear.
  const unclear: string[] = [];
  if (optId('reconsideration') === 'not-defined' || unknowns.includes('reconsideration')) {
    unclear.push("You haven't yet specified what evidence would change your mind.");
  }
  if (unknowns.includes('explicitBelief')) {
    unclear.push("You haven't yet put into words why you expect your approach to work.");
  }
  if (unknowns.includes('objective')) unclear.push('The main job of this money is not yet defined.');
  if (unknowns.includes('timeHorizon')) unclear.push('Your time horizon is unclear.');
  for (const c of conflicts) unclear.push(c.description + ' ' + c.clarifyingQuestion);

  // 4. One relevant next step, drawn from stated support or the biggest gap.
  const nextStep = chooseNextStep(optId, unknowns);

  return { told, interpretation, unclear, nextStep };
}

function chooseNextStep(optId: (qid: string) => string | undefined, unknowns: DimensionKey[]): string {
  const support = optId('supportNeeds');
  switch (support) {
    case 'clearer-reasons':
      return 'Write a one-line reason for each thing you own.';
    case 'clearer-review':
      return 'Decide, per holding, what evidence would make you reconsider it.';
    case 'organisation':
      return 'Gather your holdings in one place so you can see them together.';
    case 'understanding':
      return 'Explore the ideas behind the approaches that interest you.';
    case 'less-info':
      return 'Narrow what you monitor to the few things that would actually change a decision.';
    case 'adviser-conversations':
      return 'Take this profile into your next adviser conversation.';
    default:
      break;
  }
  if (unknowns.includes('reconsideration')) return 'Decide what would make you reconsider a holding.';
  if (unknowns.includes('explicitBelief')) return 'Put into words why you expect your approach to work.';
  return 'Review this profile and see which parts you would like to sharpen.';
}

// Confirmation step. Marks the readout confirmed and promotes stated
// (`considering`) beliefs to `confirmed` - the ONLY path by which a Vector
// belief may later be treated as a declaration downstream, and never for a
// proxy answerer (a client must confirm their own beliefs).
export function confirmProfile(profile: V2Profile): V2Profile {
  const beliefs =
    profile.answeredBy === 'proxy'
      ? profile.beliefs
      : profile.beliefs.map((b) => (b.status === 'considering' ? { ...b, status: 'confirmed' as const } : b));
  return { ...profile, confirmed: true, beliefs };
}

export const _internal = { NOT_ESTABLISHED, VALUE_PHRASES };

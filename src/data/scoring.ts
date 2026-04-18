import type { Answer, PersonaType, CapitalBand, VectorProfile } from '../types';
import type { VectorAnswerPayload, TimeHorizon, MacroAwareness, ActionHistory, ConvictionDriver, AnswerLetter } from '../types/vector';

const PERSONA_WEIGHTS: Record<PersonaType, number> = {
  'awakening': 0,
  'gut-trader': 0,
  'swamped-analyst': 0,
  'comfortable-blind-spot': 0
};

const CAPITAL_WEIGHTS: Record<CapitalBand, number> = {
  'emerging': 0,
  'building': 0,
  'established': 0,
  'concentrated': 0,
  'sovereign-capital': 0,
  'sovereign-concentrated': 0
};

export function calculateProfile(answers: Answer[]): VectorProfile {
  const personaScores = { ...PERSONA_WEIGHTS };
  const capitalScores = { ...CAPITAL_WEIGHTS };

  answers.forEach(answer => {
    if (answer.personaSignal) {
      personaScores[answer.personaSignal]++;
    }
    if (answer.capitalSignal) {
      capitalScores[answer.capitalSignal]++;
    }
  });

  // Determine dominant persona
  const persona = (Object.entries(personaScores)
    .sort(([, a], [, b]) => b - a)[0][0]) as PersonaType;

  // Determine capital band
  // Concentrated + high capital signals = sovereign-concentrated
  const isConcentrated = capitalScores['concentrated'] >= 2;
  const isEstablishedPlus = capitalScores['established'] >= 1 || capitalScores['concentrated'] >= 1;

  let capitalBand: CapitalBand;
  if (isConcentrated && isEstablishedPlus) {
    capitalBand = 'sovereign-concentrated';
  } else {
    capitalBand = (Object.entries(capitalScores)
      .filter(([key]) => key !== 'sovereign-concentrated' && key !== 'sovereign-capital')
      .sort(([, a], [, b]) => b - a)[0][0]) as CapitalBand;
  }

  return { persona, capitalBand, answers };
}

const TIME_HORIZON_MAP: Record<AnswerLetter, TimeHorizon> = {
  A: 'long',
  B: 'medium',
  C: 'short',
  D: 'undefined',
};

const MACRO_AWARENESS_MAP: Record<AnswerLetter, MacroAwareness> = {
  A: 'high',
  B: 'moderate',
  C: 'low',
  D: 'none',
};

const ACTION_HISTORY_MAP: Record<AnswerLetter, ActionHistory> = {
  A: 'inactive',
  B: 'active',
  C: 'research_only',
  D: 'new',
};

const CONVICTION_DRIVER_MAP: Record<AnswerLetter, ConvictionDriver> = {
  A: 'social',
  B: 'thesis',
  C: 'analysis',
  D: 'instinct',
};

const FRICTION_POINT_LABELS: Record<AnswerLetter, string> = {
  A: 'Knowledge gap is the primary blocker',
  B: 'Has conviction but no clear vehicle or starting point',
  C: 'Time and complexity crowd out action',
  D: 'No perceived urgency to change',
};

const DESIRED_OUTCOME_LABELS: Record<AnswerLetter, string> = {
  A: 'Wants a clear starting point',
  B: 'Wants a framework for thinking about money',
  C: 'Wants confirmation that current approach is sound',
  D: 'Wants perspective on how their situation maps to a coherent philosophy',
};

export function buildAnswerPayload(profile: VectorProfile): VectorAnswerPayload {
  const answerRecord: Record<string, AnswerLetter> = {};
  profile.answers.forEach((a) => {
    answerRecord[`q${a.questionId}`] = a.selectedLetter;
  });

  const q8 = answerRecord['q8'] as AnswerLetter;
  const q9 = answerRecord['q9'] as AnswerLetter;
  const q10 = answerRecord['q10'] as AnswerLetter;
  const q11 = answerRecord['q11'] as AnswerLetter;
  const q12 = answerRecord['q12'] as AnswerLetter;
  const q13 = answerRecord['q13'] as AnswerLetter;

  return {
    answers: answerRecord as VectorAnswerPayload['answers'],
    persona: profile.persona,
    capitalBand: profile.capitalBand,
    timeHorizon: TIME_HORIZON_MAP[q8],
    frictionPoint: FRICTION_POINT_LABELS[q12],
    desiredOutcome: DESIRED_OUTCOME_LABELS[q13],
    macroAwareness: MACRO_AWARENESS_MAP[q9],
    actionHistory: ACTION_HISTORY_MAP[q10],
    convictionDriver: CONVICTION_DRIVER_MAP[q11],
  };
}

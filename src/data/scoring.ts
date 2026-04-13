import type { Answer, PersonaType, CapitalBand, VectorProfile } from '../types';

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

// GAP-267 Phase 1 - the versioned v2 investor-approach profile contract.
//
// Design goal (the defensibility bar): every conclusion in a profile traces to a
// specific answer, and anything not established is recorded as UNKNOWN, never
// invented. v1 (persona tally + proxy philosophy scoring in ../data/scoring.ts)
// is left untouched for backward compatibility; v2 lives alongside it.

export const QUESTIONNAIRE_VERSION = 'v2.0.0';
export const INTERPRETATION_VERSION = 'v2.0.0';

// The routing answer sets language and support depth, NOT competence or asset
// suitability.
export type RouteId =
  | 'learning' // I'm learning and haven't started investing.
  | 'developing' // I've started, but I'm still developing my approach.
  | 'regular' // I invest regularly and want a clearer process.
  | 'established' // I have an established process and want better tools.
  | 'adviser-led'; // Someone else manages my investments and I want to understand them better.

// Provenance of every recorded value. Nothing is silently defaulted; an
// unestablished value is `unknown`, never invented as a low/negative trait.
export type Provenance =
  | 'stated' // the user explicitly selected/typed it
  | 'inferred' // the system derived it (never used to feed StackMotive declarations)
  | 'confirmed' // the user confirmed or corrected an interpretation
  | 'unknown' // not established
  | 'proxy'; // supplied by someone answering on the investor's behalf

// A belief's standing. Only `confirmed` may ever be promoted into StackMotive's
// alignment/conviction apparatus, and only by an explicit user action there.
export type BeliefStatus =
  | 'learning-interest' // interested in learning about a theme
  | 'considering' // considering a belief
  | 'confirmed'; // confirmed investment belief

// Who answered.
export type AnsweredBy = 'self' | 'proxy';

export interface V2Option {
  id: string; // stable within the question, e.g. 'evidence-led'
  text: string;
  help?: string; // inline plain-language explanation for unfamiliar terms
  // Marks the "not yet / no example / unsure" option: selecting it records the
  // topic as UNKNOWN rather than as a negative characteristic.
  notEstablished?: boolean;
}

export interface V2Question {
  id: string; // stable v2 id (never reused with a new meaning)
  topic: string; // short human label
  text: string;
  help?: string;
  options: V2Option[];
  multiSelect?: boolean;
  optionalText?: { id: string; prompt: string }; // free text, never scored on style
  // Adaptation. `showForRoutes` undefined = shown to everyone.
  showForRoutes?: RouteId[];
  // When the routing answer already establishes this topic, skip it.
  skipWhenRouteEstablishes?: boolean;
}

// A recorded answer. Original selection(s) preserved verbatim; multi-select
// stored as an array. Stable question + option ids.
export interface V2Answer {
  questionId: string;
  selectedOptionIds: string[];
  text?: string;
}

export type DimensionKey =
  | 'experience'
  | 'purpose'
  | 'objective'
  | 'timeHorizon'
  | 'decisionResponsibility'
  | 'decisionMethod'
  | 'recentBehaviour'
  | 'explicitBelief'
  | 'holdingRationale'
  | 'reconsideration'
  | 'monitoring'
  | 'uncertaintyResponse'
  | 'supportNeeds';

// One transparent reading. `value === null` means UNKNOWN. `evidence` lists the
// question ids that support this reading - the traceability guarantee.
export interface DimensionReading {
  key: DimensionKey;
  label: string;
  value: string | null;
  provenance: Provenance;
  evidence: string[];
}

// A detected contradiction between answers. The engine never silently resolves
// it; it surfaces a targeted clarifying question or a qualified result.
export interface Conflict {
  between: DimensionKey[];
  description: string;
  clarifyingQuestion: string;
}

export interface Belief {
  theme: string;
  status: BeliefStatus;
  evidence: string[];
}

// The four-part result readout. No invented confidence percentages.
export interface Readout {
  told: string[]; // "What you told us"
  interpretation: string[]; // "Our interpretation" (each line answer-anchored)
  unclear: string[]; // "What remains unclear"
  nextStep: string; // one relevant learning/organisational step
}

export interface V2Profile {
  questionnaireVersion: string;
  interpretationVersion: string;
  route: RouteId;
  answeredBy: AnsweredBy;
  dimensions: DimensionReading[];
  unknowns: DimensionKey[];
  conflicts: Conflict[];
  beliefs: Belief[];
  readout: Readout;
  answers: V2Answer[]; // preserved originals
  confirmed: boolean; // set true only after the user confirms the readout
}

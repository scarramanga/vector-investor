import type { PersonaType, CapitalBand } from './index';

export type AnswerLetter = 'A' | 'B' | 'C' | 'D';

export type TimeHorizon = 'long' | 'medium' | 'short' | 'undefined';
export type MacroAwareness = 'high' | 'moderate' | 'low' | 'none';
export type ActionHistory = 'inactive' | 'active' | 'research_only' | 'new';
export type ConvictionDriver = 'social' | 'thesis' | 'analysis' | 'instinct';

export interface VectorAnswerPayload {
  answers: Record<`q${number}`, AnswerLetter>;
  persona: PersonaType;
  capitalBand: CapitalBand;
  timeHorizon: TimeHorizon;
  frictionPoint: string;
  desiredOutcome: string;
  macroAwareness: MacroAwareness;
  actionHistory: ActionHistory;
  convictionDriver: ConvictionDriver;
}

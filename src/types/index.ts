export type PersonaType = 'awakening' | 'gut-trader' | 'swamped-analyst' | 'comfortable-blind-spot';

export type CapitalBand = 'emerging' | 'building' | 'established' | 'concentrated' | 'sovereign-capital' | 'sovereign-concentrated';

export interface Question {
  id: number;
  layer: 1 | 2 | 3;
  text: string;
  options: Option[];
}

export interface Option {
  letter: 'A' | 'B' | 'C' | 'D';
  text: string;
  personaSignal?: PersonaType;
  capitalSignal?: CapitalBand;
}

export interface Answer {
  questionId: number;
  selectedLetter: 'A' | 'B' | 'C' | 'D';
  personaSignal?: PersonaType;
  capitalSignal?: CapitalBand;
}

export interface VectorProfile {
  persona: PersonaType;
  capitalBand: CapitalBand;
  answers: Answer[];
}

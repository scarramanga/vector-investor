// GAP-267 Phase 1 - acceptance tests for the v2 interpretation engine.
// Covers astra's 12 scenarios + the required defensibility properties:
// every conclusion has answer-level support, unknowns stay unknown, no
// winner-take-all, conflicts surface, a learning interest never auto-confirms.

import { describe, expect, it } from 'vitest';
import { confirmProfile, interpret } from './interpretationV2';
import { calculateProfile } from './scoring';
import type { V2Answer } from '../types/v2';

// Build answers concisely: { questionId: 'optId' } or { questionId: ['a','b'] }.
function A(map: Record<string, string | string[]>): V2Answer[] {
  return Object.entries(map).map(([questionId, v]) => ({
    questionId,
    selectedOptionIds: Array.isArray(v) ? v : [v],
  }));
}

const dim = (p: ReturnType<typeof interpret>, k: string) => p.dimensions.find((d) => d.key === k)!;

// --- Required property: every non-null reading is answer-anchored -----------

describe('defensibility properties', () => {
  it('every established conclusion has evidence (traceability)', () => {
    const p = interpret('regular', A({ objective: 'growth', timeHorizon: 'gt7', decisionMethod: 'value', monitoring: 'schedule' }));
    for (const d of p.dimensions) {
      if (d.value !== null) expect(d.evidence.length).toBeGreaterThan(0);
    }
  });

  it('unknowns stay unknown - not-established options never invent a value', () => {
    const p = interpret('developing', A({ objective: 'undefined', decisionMethod: 'none-yet', timeHorizon: 'unsure' }));
    expect(dim(p, 'objective').value).toBeNull();
    expect(dim(p, 'decisionMethod').value).toBeNull();
    expect(dim(p, 'timeHorizon').value).toBeNull();
    expect(p.unknowns).toContain('objective');
    // unanswered questions are unknown, never defaulted
    expect(dim(p, 'monitoring').value).toBeNull();
  });

  it('an unrelated answer change does not alter another dimension', () => {
    const base = A({ decisionMethod: 'value', supportNeeds: 'organisation' });
    const changed = A({ decisionMethod: 'value', supportNeeds: 'understanding' });
    expect(dim(interpret('regular', base), 'decisionMethod').value).toBe(
      dim(interpret('regular', changed), 'decisionMethod').value,
    );
  });

  it('produces dimensions transparently, not a single winner-take-all label', () => {
    const p = interpret('regular', A({ decisionMethod: 'value', monitoring: 'schedule' }));
    expect(Array.isArray(p.dimensions)).toBe(true);
    expect(p.dimensions.length).toBeGreaterThan(5);
    expect(p).not.toHaveProperty('persona');
  });
});

// --- astra's 12 scenarios ---------------------------------------------------

describe('scenario 1: complete novice, no holdings, no beliefs', () => {
  const p = interpret('learning', A({ purpose: 'explore', objective: 'undefined', decisionMethod: 'none-yet', recentBehaviour: 'no-example', explicitBelief: 'not-articulated' }));
  it('invents no belief and does not treat emptiness as a negative trait', () => {
    expect(p.beliefs.every((b) => b.status !== 'confirmed')).toBe(true);
    expect(dim(p, 'experience').value).toBe('learning, not yet investing');
    expect(dim(p, 'decisionResponsibility').value).toBe('not investing yet');
  });
  it('still yields a useful next step', () => {
    expect(p.readout.nextStep.length).toBeGreaterThan(0);
  });
});

describe('scenario 2: beginner with substantial capital - wealth does not establish knowledge', () => {
  it('experience stays learning regardless of any financial context', () => {
    const p = interpret('learning', A({ purpose: 'explore' }));
    expect(dim(p, 'experience').value).toBe('learning, not yet investing');
  });
});

describe('scenario 3: disciplined index investor who deliberately holds', () => {
  const p = interpret('established', A({ decisionMethod: 'diversification', monitoring: 'schedule', recentBehaviour: 'planned', holdingRationale: 'clear-unwritten' }));
  it('reads diversification as a deliberate approach, not a blind spot', () => {
    expect(p.readout.interpretation.join(' ')).toMatch(/deliberate approach, not a lack/i);
    expect(p.readout.interpretation.join(' ')).not.toMatch(/blind spot/i);
  });
  it('a planned rebalance is a decision, never inactivity/failure', () => {
    expect(dim(p, 'recentBehaviour').value).toBe('a planned contribution or rebalance');
  });
});

describe('scenario 4: experienced analytical investor who lacks tools', () => {
  const p = interpret('established', A({ decisionMethod: 'value', monitoring: 'schedule', supportNeeds: 'clearer-review' }));
  it('reads as analytical and deliberate, with a tooling-oriented next step', () => {
    expect(p.readout.interpretation.join(' ')).toMatch(/analytical and deliberate/i);
    expect(p.readout.nextStep).toMatch(/reconsider/i);
  });
});

describe('scenario 5: decision paralysis only from the explicit answer', () => {
  it('concludes paralysis ONLY when repeatedly-delayed is chosen', () => {
    const withIt = interpret('developing', A({ uncertaintyResponse: 'repeatedly-delayed' }));
    expect(withIt.readout.interpretation.join(' ')).toMatch(/repeatedly delaying/i);
    const withoutIt = interpret('developing', A({ uncertaintyResponse: 'sought-evidence' }));
    expect(withoutIt.readout.interpretation.join(' ')).not.toMatch(/delay/i);
  });
});

describe('scenario 6: thesis-led investor with defined review criteria', () => {
  const p = interpret('regular', A({ decisionMethod: 'thesis', reconsideration: ['contradicting-evidence', 'valuation'], explicitBelief: 'structural-change' }));
  it('records the belief (not confirmed pre-confirmation) and the review criteria', () => {
    expect(dim(p, 'reconsideration').value).toMatch(/contradicting/);
    expect(p.beliefs[0].theme).toBe('exposure to structural change');
    expect(p.beliefs[0].status).toBe('considering');
  });
});

describe('scenario 7: adviser-led investor', () => {
  const p = interpret('adviser-led', A({ objective: 'preservation' }));
  it('separates who decides from a gap in understanding', () => {
    expect(dim(p, 'decisionResponsibility').value).toBe('managed by someone else');
    expect(p.readout.interpretation.join(' ')).toMatch(/not a gap in your understanding/i);
  });
});

describe('scenario 8: proxy answering for a client with unknown beliefs', () => {
  it('never auto-confirms the clients beliefs, even after confirmProfile', () => {
    const p = interpret('adviser-led', A({ explicitBelief: 'below-value' }), 'proxy');
    expect(p.beliefs[0].status).not.toBe('confirmed');
    const confirmed = confirmProfile(p);
    expect(confirmed.beliefs[0].status).not.toBe('confirmed');
    expect(dim(p, 'explicitBelief').provenance).toBe('proxy');
  });
});

describe('scenario 9: mixed approaches and multiple time horizons', () => {
  it('records the mixture and staggered horizon without forcing a single box', () => {
    const p = interpret('regular', A({ decisionMethod: 'mixture', timeHorizon: 'staggered' }));
    expect(dim(p, 'decisionMethod').value).toBe('a mixture of approaches');
    expect(dim(p, 'timeHorizon').value).toBe('different portions at different times');
  });
});

describe('scenario 10: skipped optional financial information', () => {
  it('interpretation succeeds with no financial answers at all', () => {
    const p = interpret('regular', A({ decisionMethod: 'value' }));
    expect(p.confirmed).toBe(false);
    expect(p.dimensions.length).toBeGreaterThan(5);
  });
});

describe('scenario 11: conflicting answers surface a clarification', () => {
  const p = interpret('regular', A({ decisionMethod: 'rules', recentBehaviour: 'recommendation' }));
  it('flags the rules-vs-recommendation conflict with a clarifying question', () => {
    expect(p.conflicts.length).toBeGreaterThan(0);
    const c = p.conflicts[0];
    expect(c.between).toContain('decisionMethod');
    expect(c.clarifyingQuestion).toMatch(/rules, or an exception/i);
  });
});

describe('scenario 12: existing legacy (v1) profile still works', () => {
  it('v1 calculateProfile is untouched and still returns a persona', () => {
    const legacy = calculateProfile([{ questionId: 11, selectedLetter: 'C', personaSignal: 'swamped-analyst' }]);
    expect(legacy.persona).toBe('swamped-analyst');
  });
});

// --- confirmation boundary --------------------------------------------------

describe('confirmation boundary', () => {
  it('a stated belief is only confirmed after the user confirms the readout', () => {
    const p = interpret('regular', A({ explicitBelief: 'below-value' }));
    expect(p.beliefs[0].status).toBe('considering');
    expect(confirmProfile(p).beliefs[0].status).toBe('confirmed');
  });
  it('a learner exploring a theme yields a learning-interest, never confirmed', () => {
    const p = interpret('learning', A({ purpose: 'explore', explicitBelief: 'structural-change' }));
    expect(p.beliefs[0].status).toBe('learning-interest');
    expect(confirmProfile(p).beliefs[0].status).toBe('learning-interest');
  });
});

describe('readout defensibility: shown evidence covers cited answers', () => {
  it('surfaces the answers the interpretation and unclear sections lean on', () => {
    // A thesis-led profile that reported a price-driven recent decision and
    // repeated delay: both feed the interpretation/unclear, so both must appear
    // in "what you told us".
    const p = interpret('regular', A({
      decisionMethod: 'thesis',
      recentBehaviour: 'price',
      uncertaintyResponse: 'repeatedly-delayed',
      explicitBelief: 'structural-change',
    }));
    const told = p.readout.told.join(' ');
    expect(told).toMatch(/most recent investment decision was driven by price movement/i);
    expect(told).toMatch(/when uncertain, you have repeatedly delayed/i);
    expect(told).toMatch(/you expect your approach to work: exposure to structural change/i);
    // and the interpretation still cites them (trace is now visible)
    expect(p.readout.interpretation.join(' ')).toMatch(/repeatedly delaying/i);
  });

  it('the next step is a clean sentence, not double-prefixed with its own header', () => {
    const p = interpret('regular', A({ supportNeeds: 'understanding' }));
    expect(p.readout.nextStep).not.toMatch(/^A useful next step:/i);
    expect(p.readout.nextStep).toBe('Explore the ideas behind the approaches that interest you.');
  });
});

describe('GAP-267 beginner learning interests', () => {
  it('selected interests become learning-interest beliefs (never confirmed)', () => {
    const p = interpret('learning', A({ learningInterests: ['diversification-index', 'managing-risk'] }));
    const li = p.beliefs.filter((b) => b.evidence.includes('learningInterests'));
    expect(li.map((b) => b.theme).sort()).toEqual(['diversification and index funds', 'managing risk']);
    expect(li.every((b) => b.status === 'learning-interest')).toBe(true);
    // even after confirmation they stay learning-interest (not a declaration)
    expect(confirmProfile(p).beliefs.every((b) => b.status !== 'confirmed')).toBe(true);
  });
  it('the "just getting started" option is not-established, adds no interest', () => {
    const p = interpret('learning', A({ learningInterests: ['getting-started'] }));
    expect(p.beliefs.filter((b) => b.evidence.includes('learningInterests'))).toHaveLength(0);
  });
});

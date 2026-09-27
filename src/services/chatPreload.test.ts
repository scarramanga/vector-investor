// Stack AI page (Ripen spec, Build 2): the Vector door's pre-load becomes
// answers in the prospect's own words, and never invents one.
import { describe, expect, it } from 'vitest';
import { answersFromPreload, preloadFromDoor } from './chatPreload';
import { interpret } from '../data/interpretationV2';

describe('preloadFromDoor', () => {
  it('carries belief, sell rule and kind from the door payload', () => {
    const p = preloadFromDoor('tok', { route: 'vector', belief: ' the money lost value ', sell_rule: 'if it halves I sell', sell_rule_kind: 'rule' });
    expect(p).toEqual({ token: 'tok', belief: 'the money lost value', sellRule: 'if it halves I sell', sellRuleKind: 'rule' });
  });

  it('records nothing for missing fields', () => {
    expect(preloadFromDoor('tok', null)).toEqual({ token: 'tok', belief: null, sellRule: null, sellRuleKind: null });
    expect(preloadFromDoor('tok', { belief: null, sell_rule: '' }).belief).toBeNull();
  });
});

describe('answersFromPreload', () => {
  it('pre-answers the belief question as "another reason" with the words as text', () => {
    const a = answersFromPreload({ token: 't', belief: 'houses did not change, money did', sellRule: null, sellRuleKind: null });
    expect(a).toEqual([{ questionId: 'explicitBelief', selectedOptionIds: ['other'], text: 'houses did not change, money did' }]);
  });

  it('records a stated sell rule as a predefined rule, and an admitted gap as nothing', () => {
    const rule = answersFromPreload({ token: 't', belief: null, sellRule: 'sell at 20% down', sellRuleKind: 'rule' });
    expect(rule).toEqual([{ questionId: 'reconsideration', selectedOptionIds: ['rule'], text: 'sell at 20% down' }]);
    const gap = answersFromPreload({ token: 't', belief: null, sellRule: "I don't know", sellRuleKind: 'gap' });
    expect(gap).toEqual([]);
  });

  it('flows into the readout as the person\'s own words, as a belief under consideration', () => {
    const answers = answersFromPreload({ token: 't', belief: 'the money is what changed', sellRule: null, sellRuleKind: null });
    const profile = interpret('regular', answers, 'self');
    const belief = profile.beliefs.find((b) => b.evidence.includes('belief-text'));
    expect(belief?.theme).toBe('the money is what changed');
    expect(belief?.status).toBe('considering');
  });
});

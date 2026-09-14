// GAP-267 Phase 1 - the v2 investor-approach questionnaire (wording approved
// 2026-09-14). Router + 12 evidence-bearing topics. Stable string ids; option
// ids are stable within a question. v1 (../data/questions.ts) is untouched.
//
// The questionnaire establishes APPROACH and PROCESS. It does not assess asset
// suitability, competence, allocations, or readiness to trade. Financial
// amounts live in a separate optional follow-up (see FINANCIAL_FOLLOWUP).

import type { RouteId, V2Question } from '../types/v2';

export interface RouteOption {
  id: RouteId;
  text: string;
}

export const ROUTE_QUESTION = {
  id: 'route',
  text: 'Which best describes you?',
  help: 'This sets the language and level of support you see. It does not judge your competence or what you should invest in.',
  options: [
    { id: 'learning', text: "I'm learning and haven't started investing." },
    { id: 'developing', text: "I've started, but I'm still developing my approach." },
    { id: 'regular', text: 'I invest regularly and want a clearer process.' },
    { id: 'established', text: 'I have an established process and want better tools.' },
    { id: 'adviser-led', text: 'Someone else manages my investments and I want to understand them better.' },
  ] as RouteOption[],
};

export const QUESTIONS_V2: V2Question[] = [
  {
    id: 'purpose',
    topic: 'Purpose',
    text: 'What would you most like this profile to help you understand?',
    options: [
      { id: 'clarify', text: 'Clarify my approach.' },
      { id: 'review', text: 'Review an existing process.' },
      { id: 'consistency', text: 'Make decisions more consistently.' },
      { id: 'adviser-prep', text: 'Prepare for an adviser conversation.' },
      { id: 'explore', text: 'Explore investing.' },
    ],
  },
  {
    id: 'objective',
    topic: 'Objective',
    text: 'What is the main job of the money you are considering here?',
    options: [
      { id: 'growth', text: 'Long-term growth.' },
      { id: 'future-goal', text: 'A future spending goal.' },
      { id: 'income', text: 'Current income.' },
      { id: 'preservation', text: 'Preserving spending power.' },
      { id: 'several', text: 'Several different jobs.' },
      { id: 'undefined', text: 'Not yet defined.', notEstablished: true },
    ],
  },
  {
    id: 'timeHorizon',
    topic: 'Time horizon',
    text: 'When might you need to withdraw a meaningful part of this money?',
    help: 'Pick the closest fit. Boundaries are exact: "within 3 years" means up to and including 3 years; "3 to 7 years" means after 3 and up to 7.',
    options: [
      { id: 'lt3', text: 'Within 3 years.' },
      { id: '3to7', text: '3 to 7 years.' },
      { id: 'gt7', text: 'Beyond 7 years.' },
      { id: 'staggered', text: 'Different portions at different times.' },
      { id: 'unsure', text: 'Unsure.', notEstablished: true },
    ],
  },
  {
    id: 'decisionResponsibility',
    topic: 'Decision responsibility',
    text: 'How are investment decisions usually made?',
    skipWhenRouteEstablishes: true, // route 'learning' and 'adviser-led' already establish this
    options: [
      { id: 'me', text: 'Mainly by me.' },
      { id: 'jointly', text: 'Jointly with someone.' },
      { id: 'adviser', text: 'With an adviser.' },
      { id: 'delegated', text: 'Delegated to a manager.' },
      { id: 'not-yet', text: "I'm not investing yet.", notEstablished: true },
    ],
  },
  {
    id: 'decisionMethod',
    topic: 'Decision method',
    text: 'Which best describes how you choose an investment?',
    options: [
      { id: 'diversification', text: 'Broad diversification and low costs.' },
      { id: 'value', text: 'Business value and price.' },
      { id: 'thesis', text: 'A long-term economic or technological thesis.' },
      { id: 'rules', text: 'Predefined rules.' },
      { id: 'trends', text: 'Price trends.' },
      { id: 'intuition', text: 'Intuition.' },
      { id: 'recommendation', text: 'A recommendation.' },
      { id: 'mixture', text: 'A mixture.' },
      { id: 'none-yet', text: "I haven't developed an approach yet.", notEstablished: true },
    ],
  },
  {
    id: 'recentBehaviour',
    topic: 'Actual behaviour',
    text: 'Think about your most recent investment decision, including a decision to keep holding. What mainly drove it?',
    options: [
      { id: 'planned', text: 'A planned contribution or rebalance.' },
      { id: 'evidence', text: 'Changed evidence.' },
      { id: 'circumstances', text: 'Changed personal circumstances.' },
      { id: 'price', text: 'Price movement.' },
      { id: 'recommendation', text: 'A recommendation.' },
      { id: 'instinct', text: 'Instinct.' },
      { id: 'no-example', text: 'No example yet.', notEstablished: true },
    ],
  },
  {
    id: 'explicitBelief',
    topic: 'Explicit belief',
    text: 'Which statement best describes why you expect your approach to work?',
    options: [
      { id: 'growth-participation', text: 'Broad participation in economic growth.' },
      { id: 'below-value', text: 'Buying below underlying value.' },
      { id: 'structural-change', text: 'Exposure to structural change.' },
      { id: 'consistent-rules', text: 'Consistent application of rules.' },
      { id: 'capital-preservation', text: 'Preserving capital for its intended use.' },
      { id: 'other', text: 'Another reason.' },
      { id: 'not-articulated', text: 'Not yet articulated.', notEstablished: true },
    ],
    optionalText: {
      id: 'belief-text',
      prompt: 'In your own words, why do you think your approach makes sense? (optional)',
    },
  },
  {
    id: 'holdingRationale',
    topic: 'Holding rationale',
    text: 'Before investing, how clearly do you usually define your reason for owning it?',
    options: [
      { id: 'written', text: 'Written and specific.' },
      { id: 'clear-unwritten', text: 'Clear but unwritten.' },
      { id: 'broad', text: 'A broad idea.' },
      { id: 'varies', text: 'Varies between investments.' },
      { id: 'someone-else', text: "I generally rely on someone else's reasoning." },
      { id: 'not-applicable', text: 'Not applicable yet.', notEstablished: true },
    ],
  },
  {
    id: 'reconsideration',
    topic: 'What would change your mind',
    text: 'What would normally make you reconsider an investment?',
    help: 'Choose any that apply.',
    multiSelect: true,
    options: [
      { id: 'contradicting-evidence', text: 'Evidence contradicting my rationale.' },
      { id: 'valuation', text: 'Valuation.' },
      { id: 'rule', text: 'A predefined rule.' },
      { id: 'personal-needs', text: 'Changed personal needs.' },
      { id: 'adviser-review', text: 'An adviser review.' },
      { id: 'price-alone', text: 'Price movement without other evidence.' },
      { id: 'not-defined', text: 'Not yet defined.', notEstablished: true },
    ],
  },
  {
    id: 'monitoring',
    topic: 'Monitoring',
    text: 'How do you normally review your investments?',
    options: [
      { id: 'schedule', text: 'Regular schedule.' },
      { id: 'evidence-changes', text: 'When relevant evidence changes.' },
      { id: 'alerts-rules', text: 'Predefined alerts or rules.' },
      { id: 'adviser-led', text: 'Adviser-led.' },
      { id: 'after-price', text: 'Mainly after large price moves.' },
      { id: 'none-consistent', text: 'No consistent approach yet.', notEstablished: true },
    ],
  },
  {
    id: 'uncertaintyResponse',
    topic: 'Under uncertainty',
    text: 'When you have felt uncertain, what have you actually done?',
    options: [
      { id: 'followed-plan', text: 'Followed my existing plan.' },
      { id: 'sought-evidence', text: 'Sought specific missing evidence.' },
      { id: 'repeatedly-delayed', text: 'Repeatedly delayed a decision I intended to make.' },
      { id: 'changed-quickly', text: 'Changed course quickly.' },
      { id: 'consulted-adviser', text: 'Consulted an adviser.' },
      { id: 'no-example', text: 'No clear example.', notEstablished: true },
    ],
  },
  {
    id: 'learningInterests',
    topic: 'Learning interests',
    text: 'What would you like to learn about?',
    help: 'Pick any that interest you. We use this to choose which examples to show you first, never to tell you what to buy.',
    multiSelect: true,
    // Beginner-only (GAP-267): feeds the guided learning path; experienced routes never see it.
    showForRoutes: ['learning', 'developing'],
    options: [
      { id: 'how-markets-work', text: 'How markets work.' },
      { id: 'diversification-index', text: 'Diversification and index funds.' },
      { id: 'company-analysis', text: 'How to analyse a company.' },
      { id: 'long-term-themes', text: 'Long-term themes (AI, energy, and the like).' },
      { id: 'managing-risk', text: 'Managing risk and protecting capital.' },
      { id: 'getting-started', text: 'Just getting started, show me the basics.', notEstablished: true },
    ],
  },
  {
    id: 'supportNeeds',
    topic: 'Support',
    text: 'What, if anything, would improve your current process?',
    options: [
      { id: 'less-info', text: 'Less information to process.' },
      { id: 'clearer-reasons', text: 'Clearer reasons for holdings.' },
      { id: 'clearer-review', text: 'Clearer review conditions.' },
      { id: 'organisation', text: 'Better organisation.' },
      { id: 'understanding', text: 'More understanding.' },
      { id: 'adviser-conversations', text: 'Better adviser conversations.' },
      { id: 'nothing', text: 'Nothing specific.' },
      { id: 'unsure', text: 'Unsure.', notEstablished: true },
    ],
  },
];

// Part 5: financial context is an OPTIONAL, clearly-separated follow-up. Never
// used to derive allocations, suitability, or a "working hard enough" verdict.
// Every field offers "Prefer not to say"; ranges are non-overlapping.
export const FINANCIAL_FOLLOWUP = {
  intro:
    'Optional. This helps size examples later. It is never used to judge your approach or suggest what to buy. You can skip any of it.',
  questions: [
    {
      id: 'fin-amount',
      topic: 'Amount available',
      text: 'Roughly how much are you considering putting to work here?',
      options: [
        { id: 'lt-10k', text: 'Under 10,000.' },
        { id: '10k-50k', text: '10,000 to 50,000.' },
        { id: '50k-250k', text: '50,000 to 250,000.' },
        { id: '250k-1m', text: '250,000 to 1,000,000.' },
        { id: 'gt-1m', text: 'Over 1,000,000.' },
        { id: 'prefer-not', text: 'Prefer not to say.', notEstablished: true },
      ],
    },
    {
      id: 'fin-concentration',
      topic: 'Concentration',
      text: 'Is a large part of your wealth tied up in one asset or holding?',
      options: [
        { id: 'yes', text: 'Yes, most of it.' },
        { id: 'some', text: 'Somewhat.' },
        { id: 'no', text: 'No, it is spread out.' },
        { id: 'prefer-not', text: 'Prefer not to say.', notEstablished: true },
      ],
    },
    {
      id: 'fin-liquidity',
      topic: 'Access',
      text: 'How much of this money could you access without selling something hard to sell?',
      options: [
        { id: 'most', text: 'Most of it.' },
        { id: 'some', text: 'Some of it.' },
        { id: 'little', text: 'Little of it.' },
        { id: 'prefer-not', text: 'Prefer not to say.', notEstablished: true },
      ],
    },
  ] as V2Question[],
};

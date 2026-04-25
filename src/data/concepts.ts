export interface ConceptExplanation {
  name: string;
  description: string;
  explanation: string;
}

export const conceptExplanations: Record<string, ConceptExplanation> = {
  'Concentration Risk': {
    name: 'Concentration Risk',
    description: 'When most of your wealth sits in one asset class, you\'re making a single bet whether you intended to or not.',
    explanation: 'When most of your wealth sits in one asset class, you are making a single bet whether you intended to or not. Property has been an exceptional wealth builder. The question is not whether that was right. It is whether the next decade rewards the same concentration as the last two.',
  },
  'Real Returns vs Nominal Returns': {
    name: 'Real Returns vs Nominal Returns',
    description: 'The difference between what your portfolio says it earned and what that gain actually buys in the real world.',
    explanation: 'Your portfolio says it returned eight percent. But if the real cost of living rose by six, your purchasing power gained two. That gap between what your account says and what it actually buys changes how you evaluate almost every financial outcome.',
  },
  'The Post-1971 Monetary Architecture': {
    name: 'The Post-1971 Monetary Architecture',
    description: 'The framework that governs how money works today \u2014 and why it matters for anyone holding assets denominated in fiat currency.',
    explanation: 'In 1971, money stopped being anchored to a finite physical asset. Since then, money supply has expanded without structural constraint. This is not a conspiracy. It is a mechanism, and it explains why asset prices, house prices, and the cost of living have moved the way they have.',
  },
  'Experienced Inflation vs CPI': {
    name: 'Experienced Inflation vs CPI',
    description: 'Why the official inflation number often does not match what people feel at the supermarket or when looking at property prices.',
    explanation: 'The official inflation number uses a specific measurement method that often does not match what people feel at the supermarket or when looking at property prices. Understanding why these numbers differ helps explain why many people feel stretched even when official data says inflation is low.',
  },
  'Hard Assets and Why They Matter': {
    name: 'Hard Assets and Why They Matter',
    description: 'Assets with intrinsic value independent of any government \u2014 and why they behave differently in a debasement environment.',
    explanation: 'Hard assets have intrinsic value independent of any government. Gold cannot be printed and its supply grows at roughly one percent per year. In a debasement environment, hard assets tend to hold value relative to fiat currency. Understanding this category explains why some investors allocate differently.',
  },
  'Currency Exposure and Geographic Diversification': {
    name: 'Currency Exposure and Geographic Diversification',
    description: 'Why holding assets denominated in a single currency is itself a concentrated position \u2014 and what alternatives look like.',
    explanation: 'If all your wealth is denominated in a single currency, you are making a bet on that currency. Spreading exposure across multiple currencies and monetary systems reduces the impact of any one central bank\'s decisions on your total wealth.',
  },
  'Portfolio Architecture': {
    name: 'Portfolio Architecture',
    description: 'The conscious structure underneath your positions \u2014 the difference between a portfolio and a collection of trades.',
    explanation: 'Most investors accumulate positions without a deliberate structure underneath. Portfolio architecture means deciding what percentage sits in each category before selecting instruments. The structure determines how the portfolio behaves as a whole, not just how each piece performs alone.',
  },
  'The Index Fund in Context': {
    name: 'The Index Fund in Context',
    description: 'A proven tool \u2014 but understanding its assumptions helps you decide whether it belongs as the whole portfolio or one part of it.',
    explanation: 'An index fund is one of the most sensible default decisions an investor can make. The question is not whether it works. It is what it assumes. In a debasement-aware portfolio, it works best as one component of a considered philosophy rather than the entire answer.',
  },
  'Momentum vs Conviction': {
    name: 'Momentum vs Conviction',
    description: 'Two valid investment approaches that require fundamentally different position sizing, time horizons, and exit strategies.',
    explanation: 'Momentum is reading a short-term signal correctly. Conviction is a view about why something should be worth more in five years based on a structural thesis. Both are valid. They require different position sizing, different time horizons, and different exit thinking.',
  },
  'The Cost of Inaction': {
    name: 'The Cost of Inaction',
    description: 'Waiting for perfect information has a measurable cost. Understanding that cost changes how you think about readiness.',
    explanation: 'Cash earning three percent while real inflation runs at five is losing purchasing power every year. Deciding not to act is itself a decision with a measurable cost. Acting on eighty percent conviction often teaches more than researching for another six months.',
  },
  'Time as a Portfolio Asset': {
    name: 'Time as a Portfolio Asset',
    description: 'For early-career investors, the most valuable asset is not savings \u2014 it is time.',
    explanation: 'For early-career investors, the most valuable asset is not savings. It is time. A thousand dollars invested at 25 with a seven percent real return becomes roughly fifteen thousand by 65. The same amount at 45 becomes four thousand. The difference is time, not skill.',
  },
  'Housing Financialisation': {
    name: 'Housing Financialisation',
    description: 'How housing shifted from being a place to live to being an investment asset class \u2014 and why that matters.',
    explanation: 'Housing shifted from being a place to live to being an investment asset class. The consequence is that younger generations compete for housing against leveraged investors, not just other people who need somewhere to live. This is a structural outcome, not a lifestyle complaint.',
  },
  'The Wealth Transfer Mechanism': {
    name: 'The Wealth Transfer Mechanism',
    description: 'How money supply expansion transfers wealth from savers to asset holders \u2014 mechanically, not politically.',
    explanation: 'When money supply expands, asset prices rise first. Wages follow later, if at all. People who own assets get wealthier. People saving to buy assets find the target moving away. This is not political. It is mechanical.',
  },
  'What Institutional Investors Know That Retail Doesn\'t': {
    name: 'What Institutional Investors Know That Retail Doesn\'t',
    description: 'The structural information gap between institutional and retail investors \u2014 and why understanding it matters.',
    explanation: 'Institutional investors have tools, data, and context that retail investors do not. They see order flow, macro analysis, and research that costs hundreds of thousands per year. This information gap is structural. Understanding it is the first step toward closing it.',
  },
  'The Debasement Mechanism': {
    name: 'The Debasement Mechanism',
    description: 'How currency supply expansion quietly erodes the purchasing power of savings, wages, and fixed-income assets over time.',
    explanation: 'When a central bank expands the money supply, each unit of currency buys less than it did before. This process is gradual and difficult to feel in real time, but over a decade it compounds. Understanding this mechanism is the starting point for thinking about why asset allocation matters.',
  },
};

export interface Strategy {
  id: string;
  name: string;
  oneLiner: string;
  paragraphs: string[];
  bucketMapping: string;
}

export const strategies: Strategy[] = [
  {
    id: 'barbell',
    name: 'Barbell',
    oneLiner: 'Concentrate at both ends. Nothing in the middle.',
    paragraphs: [
      'The barbell strategy allocates capital to two extremes of the risk spectrum while deliberately avoiding the middle ground. One end holds highly conservative, capital-preserving assets. The other holds high-conviction, higher-risk positions. The logic is that the conservative end protects against catastrophic loss while the conviction end captures asymmetric upside. The middle ground, where most managed funds operate, is avoided because it offers neither genuine protection nor meaningful upside.',
      'Originally popularised by Nassim Nicholas Taleb, the barbell has become one of the most discussed allocation frameworks among macro-aware investors. It appeals particularly to investors who hold strong views about where the world is heading but want to protect against being wrong.',
    ],
    bucketMapping: 'Heavy Foundation, skip or minimise Growth, concentrated Conviction.',
  },
  {
    id: 'core-satellite',
    name: 'Core-Satellite',
    oneLiner: 'Broad base. Targeted edges.',
    paragraphs: [
      'The core-satellite strategy builds a large, diversified foundation (the core) and surrounds it with smaller, targeted positions (the satellites) in areas of specific conviction. The core typically consists of broad market index exposure or diversified ETFs. The satellites are individual equities, thematic ETFs, or alternative assets that reflect the investor\u2019s specific thesis.',
      'This is the most common portfolio architecture among self-directed investors. It provides market participation through the core while allowing personal conviction to express through the satellites. The key discipline is sizing. Most practitioners allocate 60\u201380% to the core and 20\u201340% across satellites.',
    ],
    bucketMapping: 'Core is a blend of Foundation and Growth. Satellites sit in Conviction.',
  },
  {
    id: 'all-weather',
    name: 'All-Weather',
    oneLiner: 'Built to survive any environment. Not to win in one.',
    paragraphs: [
      'The all-weather portfolio is designed to perform acceptably across all macroeconomic environments: growth, recession, rising inflation, and falling inflation. Rather than predicting which environment is coming, it allocates across asset classes that perform well in each. The classic version includes equities, long-term bonds, intermediate bonds, gold, and commodities in specific proportions.',
      'Popularised by Ray Dalio through Bridgewater Associates, the all-weather approach appeals to investors who believe forecasting is unreliable and that diversification across uncorrelated assets is the most robust long-term strategy. It tends to underperform in strong bull markets and outperform in volatile or uncertain ones.',
    ],
    bucketMapping: 'Distributed across all three buckets with the heaviest weight in Foundation.',
  },
  {
    id: 'dca',
    name: 'Dollar Cost Averaging (Systematic Deployment)',
    oneLiner: 'Time in the market. Not timing the market.',
    paragraphs: [
      'Dollar cost averaging is not a portfolio structure but a deployment strategy. Instead of investing a lump sum at a single point, capital is deployed in equal amounts at regular intervals over time. This reduces the risk of entering the market at a peak and smooths the average purchase price across market cycles.',
      'DCA is particularly relevant for investors in the Emerging and Building capital bands who are accumulating positions over months or years. It removes the paralysis of trying to pick the perfect entry point and replaces it with discipline and consistency. The evidence on whether DCA outperforms lump sum investing is mixed, but the behavioural benefit, actually deploying capital rather than waiting for a better moment, is well documented.',
    ],
    bucketMapping: 'Applies to any bucket. It is a timing strategy, not an allocation strategy.',
  },
  {
    id: 'equal-weight',
    name: 'Equal Weight',
    oneLiner: 'No predictions. Equal conviction across all positions.',
    paragraphs: [
      'Equal weight allocation assigns the same percentage of capital to each position in the portfolio regardless of market capitalisation, sector weighting, or personal conviction. If a portfolio holds ten instruments, each gets 10%. When positions drift from equal weight due to price movements, the portfolio is rebalanced.',
      'The philosophy behind equal weight is intellectual humility. It acknowledges that predicting which position will outperform is difficult and that concentrating heavily in a single conviction creates fragility. Equal weight portfolios tend to have higher exposure to smaller positions and lower exposure to dominant ones compared to market-cap-weighted approaches.',
    ],
    bucketMapping: 'Even distribution. Every position in every bucket receives the same allocation.',
  },
];

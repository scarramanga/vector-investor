export type ThemeId = 'debasement' | 'technology' | 'energy' | 'digital';
export type BucketId = 'foundation' | 'growth' | 'conviction';
export type ExchangeId = 'ASX' | 'NZX' | 'NYSE' | 'LSE' | 'CRYPTO';
export type VolatilityLevel = 'Low' | 'Medium' | 'High';
export type AccessMethod = 'Sharesies' | 'Hatch' | 'CommSec' | 'Direct exchange' | 'NZX broker';

export interface Instrument {
  ticker: string;
  name: string;
  exchange: ExchangeId;
  thesis: string;
  access: AccessMethod[];
  volatility: VolatilityLevel;
  bucket: BucketId;
  themes: ThemeId[];
  stackmotiveHook: string;
}

export interface Theme {
  id: ThemeId;
  name: string;
  tagline: string;
  stackmotiveHook: string;
}

export interface Bucket {
  id: BucketId;
  name: string;
  purpose: string;
  color: string;
}

export interface AllocationSuggestion {
  foundation: number;
  growth: number;
  conviction: number;
  label: string;
}

export const buckets: Bucket[] = [
  {
    id: 'foundation',
    name: 'Foundation',
    purpose: 'Capital preservation with real return protection',
    color: 'var(--color-success)'
  },
  {
    id: 'growth',
    name: 'Growth',
    purpose: 'Long-term capital appreciation with debasement awareness',
    color: 'var(--color-primary)'
  },
  {
    id: 'conviction',
    name: 'Conviction',
    purpose: 'Thesis-driven, higher concentration, smaller allocation',
    color: 'var(--color-warning)'
  }
];

export const themes: Theme[] = [
  {
    id: 'debasement',
    name: 'Monetary Debasement',
    tagline: 'Hard assets: gold, miners, and Bitcoin.',
    stackmotiveHook: 'StackMotive tracks institutional flow in gold and mining equities. See where institutional money is positioned before you research further.'
  },
  {
    id: 'technology',
    name: 'Technological Transformation',
    tagline: 'AI infrastructure, platform dominance, and the businesses reshaping productivity.',
    stackmotiveHook: 'StackMotive surfaces institutional positioning in technology equities from reported filings and flow data.'
  },
  {
    id: 'energy',
    name: 'Energy Transition and Scarcity',
    tagline: 'Traditional energy with transition optionality, uranium, and renewables infrastructure.',
    stackmotiveHook: 'StackMotive monitors whale and block trades in energy equities across ASX and global markets.'
  },
  {
    id: 'digital',
    name: 'Digital Assets as Infrastructure',
    tagline: 'Bitcoin, Ethereum, and the emerging digital financial architecture.',
    stackmotiveHook: 'StackMotive tracks institutional crypto flow and on-chain signals alongside traditional market data.'
  }
];

export const instruments: Instrument[] = [
  // FOUNDATION — Gold ETFs
  {
    ticker: 'GOLD',
    name: 'Perth Mint Physical Gold ETF',
    exchange: 'ASX',
    thesis: 'Physically backed gold exposure on the ASX. The most accessible hard asset for NZ and AU investors.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional gold positioning in StackMotive'
  },
  {
    ticker: 'IAU',
    name: 'iShares Gold Trust',
    exchange: 'NYSE',
    thesis: 'Low-cost US-listed gold ETF. A lower expense ratio alternative to GLD accessible via Hatch.',
    access: ['Hatch'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional gold positioning in StackMotive'
  },
  {
    ticker: 'GLD',
    name: 'SPDR Gold Shares',
    exchange: 'NYSE',
    thesis: 'The world\'s largest gold ETF. Deep liquidity, strong institutional following, US listed.',
    access: ['Hatch'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional gold positioning in StackMotive'
  },
  {
    ticker: 'PHAU',
    name: 'WisdomTree Physical Gold',
    exchange: 'LSE',
    thesis: 'London-listed physically backed gold. Relevant for investors with UK exposure or GBP holdings.',
    access: ['Direct exchange'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional gold positioning in StackMotive'
  },
  // FOUNDATION — Inflation-Linked Bonds
  {
    ticker: 'ILB',
    name: 'VanEck Australian Government Inflation-Linked Bond ETF',
    exchange: 'ASX',
    thesis: 'Direct inflation-linked government bond exposure on the ASX. Designed specifically to preserve purchasing power.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['debasement'],
    stackmotiveHook: 'Monitor macro signals affecting bond markets in StackMotive'
  },
  {
    ticker: 'TIPS',
    name: 'iShares TIPS Bond ETF',
    exchange: 'NYSE',
    thesis: 'US Treasury Inflation-Protected Securities. The US equivalent of inflation-linked government bonds.',
    access: ['Hatch'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['debasement'],
    stackmotiveHook: 'Monitor macro signals affecting bond markets in StackMotive'
  },
  // FOUNDATION — Cash Equivalents
  {
    ticker: 'BILL',
    name: 'iShares Core Cash ETF',
    exchange: 'ASX',
    thesis: 'Near-cash exposure on the ASX. Strategic dry powder while deploying capital thoughtfully.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['debasement'],
    stackmotiveHook: 'Monitor cash rate signals in StackMotive'
  },
  {
    ticker: 'USDC',
    name: 'USD Coin (Stablecoin)',
    exchange: 'CRYPTO',
    thesis: 'Dollar-denominated stablecoin. A cash management tool for investors exploring digital asset infrastructure — not an investment.',
    access: ['Direct exchange'],
    volatility: 'Low',
    bucket: 'foundation',
    themes: ['digital'],
    stackmotiveHook: 'Track stablecoin flow signals in StackMotive'
  },
  // GROWTH — International Diversification
  {
    ticker: 'VGS',
    name: 'Vanguard MSCI International Shares ETF',
    exchange: 'ASX',
    thesis: 'Broad developed market exposure excluding Australia. The primary international diversification instrument for NZ and AU investors.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['technology'],
    stackmotiveHook: 'Track international equity flow signals in StackMotive'
  },
  {
    ticker: 'TWF',
    name: 'Smartshares Total World Fund',
    exchange: 'NZX',
    thesis: 'NZX-listed global equity exposure. Directly accessible for NZ investors without a foreign broker.',
    access: ['Sharesies', 'NZX broker'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['technology'],
    stackmotiveHook: 'Track international equity flow signals in StackMotive'
  },
  {
    ticker: 'VDHG',
    name: 'Vanguard Diversified High Growth ETF',
    exchange: 'ASX',
    thesis: 'All-in-one diversified growth portfolio in a single ASX-listed instrument.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['technology'],
    stackmotiveHook: 'Track broad market signals in StackMotive'
  },
  // GROWTH — ASX Quality Equities
  {
    ticker: 'BHP',
    name: 'BHP Group',
    exchange: 'ASX',
    thesis: 'Global resources giant with commodity exposure across copper, iron ore, and coal. Pricing power in an inflationary environment.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['debasement', 'energy'],
    stackmotiveHook: 'Track institutional positioning in BHP in StackMotive'
  },
  {
    ticker: 'RIO',
    name: 'Rio Tinto',
    exchange: 'ASX',
    thesis: 'Diversified global mining. Copper, aluminium, iron ore. Hard asset production with long-duration reserve life.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['debasement', 'energy'],
    stackmotiveHook: 'Track institutional flow in Rio Tinto in StackMotive'
  },
  {
    ticker: 'CSL',
    name: 'CSL Limited',
    exchange: 'ASX',
    thesis: 'ASX-listed global biotech with international revenue across plasma-derived therapies and vaccines. Shown to illustrate the theme, not a rating.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['technology'],
    stackmotiveHook: 'Track institutional positioning in CSL in StackMotive'
  },
  {
    ticker: 'WDS',
    name: 'Woodside Energy',
    exchange: 'ASX',
    thesis: 'Australia\'s largest oil and gas producer. Energy scarcity and transition exposure in a single ASX-listed instrument.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['energy'],
    stackmotiveHook: 'Track energy sector flow in StackMotive'
  },
  // GROWTH — NZX Quality Equities
  {
    ticker: 'AIA',
    name: 'Auckland International Airport',
    exchange: 'NZX',
    thesis: 'Long-duration infrastructure asset with inflation-linked revenue. A genuine hard asset on the NZX.',
    access: ['Sharesies', 'NZX broker'],
    volatility: 'Low',
    bucket: 'growth',
    themes: ['debasement'],
    stackmotiveHook: 'Track infrastructure sector signals in StackMotive'
  },
  {
    ticker: 'FPH',
    name: 'Fisher and Paykel Healthcare',
    exchange: 'NZX',
    thesis: 'NZ-origin global healthcare business. Genuine international revenue, pricing power, and long-term compounding.',
    access: ['Sharesies', 'NZX broker'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['technology'],
    stackmotiveHook: 'Track institutional positioning in FPH in StackMotive'
  },
  {
    ticker: 'XRO',
    name: 'Xero',
    exchange: 'NZX',
    thesis: 'NZ-origin global SaaS platform. Dual listed ASX/NZX. Subscription revenue with strong retention economics.',
    access: ['Sharesies', 'NZX broker', 'CommSec'],
    volatility: 'Medium',
    bucket: 'growth',
    themes: ['technology'],
    stackmotiveHook: 'Track institutional flow in Xero in StackMotive'
  },
  {
    ticker: 'MEL',
    name: 'Meridian Energy',
    exchange: 'NZX',
    thesis: 'Pure renewable energy infrastructure on the NZX. Inflation-linked revenue, hard asset backing, transition exposure.',
    access: ['Sharesies', 'NZX broker'],
    volatility: 'Low',
    bucket: 'growth',
    themes: ['energy'],
    stackmotiveHook: 'Track energy sector signals in StackMotive'
  },
  // CONVICTION — Theme 1 Debasement
  {
    ticker: 'GDX',
    name: 'VanEck Gold Miners ETF',
    exchange: 'NYSE',
    thesis: 'Diversified gold-miner exposure. Miners have historically moved more than gold itself, in both directions.',
    access: ['Hatch'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional flow in gold miners in StackMotive'
  },
  {
    ticker: 'GDXJ',
    name: 'VanEck Junior Gold Miners ETF',
    exchange: 'NYSE',
    thesis: 'Junior gold-miner exposure. Historically higher volatility than GDX, in both directions.',
    access: ['Hatch'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional flow in junior miners in StackMotive'
  },
  {
    ticker: 'NST',
    name: 'Northern Star Resources',
    exchange: 'ASX',
    thesis: 'ASX-listed gold miner. One of Australia\'s largest gold producers. Local access to gold mining equity.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional positioning in NST in StackMotive'
  },
  {
    ticker: 'EVN',
    name: 'Evolution Mining',
    exchange: 'ASX',
    thesis: 'Mid-tier ASX gold miner. Diversified mine portfolio across Australia and Canada.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional flow in Evolution Mining in StackMotive'
  },
  {
    ticker: 'OGC',
    name: 'OceanaGold',
    exchange: 'ASX',
    thesis: 'AU/NZ-listed gold miner with New Zealand operations. The most locally connected gold mining equity available.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['debasement'],
    stackmotiveHook: 'Track institutional flow in OceanaGold in StackMotive'
  },
  // CONVICTION — Theme 2 Technology
  {
    ticker: 'NVDA',
    name: 'NVIDIA Corporation',
    exchange: 'NYSE',
    thesis: 'The infrastructure layer of the AI transformation. GPU dominance across data centres, autonomous systems, and AI training.',
    access: ['Hatch', 'Sharesies'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology'],
    stackmotiveHook: 'Track institutional positioning in NVDA in StackMotive'
  },
  {
    ticker: 'TSLA',
    name: 'Tesla',
    exchange: 'NYSE',
    thesis: 'Energy transition technology at scale. EV platform, energy storage, and autonomous driving as converging thesis drivers.',
    access: ['Hatch', 'Sharesies'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology', 'energy'],
    stackmotiveHook: 'Track institutional flow in TSLA in StackMotive'
  },
  {
    ticker: 'AAPL',
    name: 'Apple Inc',
    exchange: 'NYSE',
    thesis: 'Platform dominance with the strongest consumer ecosystem in technology. Services revenue compounding on a billion-device installed base.',
    access: ['Hatch', 'Sharesies'],
    volatility: 'Medium',
    bucket: 'conviction',
    themes: ['technology'],
    stackmotiveHook: 'Track institutional positioning in AAPL in StackMotive'
  },
  {
    ticker: 'MSFT',
    name: 'Microsoft',
    exchange: 'NYSE',
    thesis: 'AI and cloud infrastructure at enterprise scale. The most diversified technology platform position available.',
    access: ['Hatch', 'Sharesies'],
    volatility: 'Medium',
    bucket: 'conviction',
    themes: ['technology'],
    stackmotiveHook: 'Track institutional flow in MSFT in StackMotive'
  },
  {
    ticker: 'NDQ',
    name: 'Betashares Nasdaq 100 ETF',
    exchange: 'ASX',
    thesis: 'Single ASX-listed instrument covering the full US technology theme. NVDA, AAPL, MSFT, TSLA in one position.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology'],
    stackmotiveHook: 'Track Nasdaq flow signals in StackMotive'
  },
  {
    ticker: 'USF',
    name: 'Smartshares US Tech Fund',
    exchange: 'NZX',
    thesis: 'NZX-listed US technology exposure. The most accessible technology theme instrument for NZ investors.',
    access: ['Sharesies', 'NZX broker'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology'],
    stackmotiveHook: 'Track US technology flow signals in StackMotive'
  },
  {
    ticker: 'WTC',
    name: 'WiseTech Global',
    exchange: 'ASX',
    thesis: 'ASX-listed global logistics software platform. High-quality technology business with genuine pricing power.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology'],
    stackmotiveHook: 'Track institutional flow in WiseTech in StackMotive'
  },
  // CONVICTION — Theme 3 Energy
  {
    ticker: 'STO',
    name: 'Santos',
    exchange: 'ASX',
    thesis: 'ASX-listed oil and gas producer with LNG exposure. Energy scarcity thesis with transition optionality.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'Medium',
    bucket: 'conviction',
    themes: ['energy'],
    stackmotiveHook: 'Track energy sector flow in StackMotive'
  },
  {
    ticker: 'URNM',
    name: 'Sprott Uranium Miners ETF',
    exchange: 'NYSE',
    thesis: 'Uranium miner exposure. Nuclear energy as the base load of the transition. Supply constrained, demand growing.',
    access: ['Hatch'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['energy'],
    stackmotiveHook: 'Track uranium sector signals in StackMotive'
  },
  {
    ticker: 'SHEL',
    name: 'Shell',
    exchange: 'LSE',
    thesis: 'Global energy major with transition investment. Traditional energy cash flows funding renewable transition.',
    access: ['Direct exchange'],
    volatility: 'Medium',
    bucket: 'conviction',
    themes: ['energy'],
    stackmotiveHook: 'Track global energy flow in StackMotive'
  },
  {
    ticker: 'MCY',
    name: 'Mercury Energy',
    exchange: 'NZX',
    thesis: 'NZX-listed renewable energy with hydro and geothermal generation. Pure NZ energy transition exposure.',
    access: ['Sharesies', 'NZX broker'],
    volatility: 'Low',
    bucket: 'conviction',
    themes: ['energy'],
    stackmotiveHook: 'Track NZ energy sector signals in StackMotive'
  },
  // CONVICTION — Theme 4 Digital Assets
  {
    ticker: 'EBTC',
    name: 'Global X 21Shares Bitcoin ETF',
    exchange: 'ASX',
    thesis: 'Regulated ASX-listed Bitcoin exposure. Fixed supply, no central bank, the debasement thesis in digital form.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['debasement', 'digital'],
    stackmotiveHook: 'Track institutional Bitcoin flow in StackMotive'
  },
  {
    ticker: 'BTC',
    name: 'Bitcoin (Direct)',
    exchange: 'CRYPTO',
    thesis: 'Fixed-supply digital asset held directly via a crypto exchange. Often discussed in the context of the monetary-debasement theme.',
    access: ['Direct exchange'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['debasement', 'digital'],
    stackmotiveHook: 'Track on-chain Bitcoin signals in StackMotive'
  },
  {
    ticker: 'EETH',
    name: 'Global X 21Shares Ethereum ETF',
    exchange: 'ASX',
    thesis: 'Regulated ASX-listed Ethereum exposure. Relevant to the decentralised-infrastructure theme.',
    access: ['Sharesies', 'CommSec'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology', 'digital'],
    stackmotiveHook: 'Track institutional Ethereum flow in StackMotive'
  },
  {
    ticker: 'ETH',
    name: 'Ethereum (Direct)',
    exchange: 'CRYPTO',
    thesis: 'Decentralised infrastructure platform. Not a currency — a technology transformation bet with a different thesis to Bitcoin.',
    access: ['Direct exchange'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology', 'digital'],
    stackmotiveHook: 'Track on-chain Ethereum signals in StackMotive'
  },
  {
    ticker: 'SOL',
    name: 'Solana (Direct)',
    exchange: 'CRYPTO',
    thesis: 'High-speed blockchain infrastructure. Technology transformation thesis, higher risk than ETH. Direct exchange only.',
    access: ['Direct exchange'],
    volatility: 'High',
    bucket: 'conviction',
    themes: ['technology', 'digital'],
    stackmotiveHook: 'Track Solana ecosystem signals in StackMotive'
  }
];

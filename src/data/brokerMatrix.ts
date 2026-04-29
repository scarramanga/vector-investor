/**
 * Brokerage recommendation matrix.
 * Editorial content only -- no broker relationships exist.
 * Rendered at display time from static logic, never stored in the database.
 */

interface BrokerEntry {
  name: string;
  description: string;
}

export interface BrokerRecommendation {
  primary: BrokerEntry;
  secondary?: BrokerEntry;
  philosophyOverlay?: string;
}

type BandGroup = 'emerging' | 'growing' | 'established' | 'affluent';

/**
 * Collapse the six internal capital bands into the four groupings
 * used by the broker matrix.
 */
function normaliseBand(capitalBand: string): BandGroup {
  switch (capitalBand) {
    case 'emerging':
      return 'emerging';
    case 'building':
      return 'growing';
    case 'established':
      return 'established';
    case 'concentrated':
    case 'sovereign-capital':
    case 'sovereign-concentrated':
      return 'affluent';
    default:
      return 'emerging';
  }
}

// ---------------------------------------------------------------------------
// Country matrices
// ---------------------------------------------------------------------------

function nzMatrix(band: BandGroup): Omit<BrokerRecommendation, 'philosophyOverlay'> {
  switch (band) {
    case 'emerging':
      return {
        primary: {
          name: 'Sharesies',
          description:
            'Your profile shows you are building from a smaller capital base in New Zealand. Sharesies has no minimum investment, supports fractional shares across NZ, AU, and US markets, and is NZ-domiciled with FMA oversight. Those characteristics match where you are starting from.',
        },
        secondary: {
          name: 'Kernel',
          description:
            'Kernel offers low-cost index funds with no brokerage fees per trade and a $1 minimum investment. For an Emerging capital investor focused on building a foundation, the low friction suits the early stage.',
        },
      };
    case 'growing':
      return {
        primary: {
          name: 'Hatch',
          description:
            'Your profile shows growing capital with a focus on US equities. Hatch provides direct access to the NYSE and NASDAQ with NZD deposits converted at competitive rates. The platform is straightforward and suited to investors building a US-focused position.',
        },
        secondary: {
          name: 'Sharesies',
          description:
            'Sharesies remains relevant at this capital band for NZ and AU market exposure alongside a Hatch US allocation.',
        },
      };
    case 'established':
      return {
        primary: {
          name: 'IBKR',
          description:
            'Your profile shows established capital across multiple markets. Interactive Brokers operates in over 150 countries, supports multi-currency accounts in NZD, USD, and AUD, and charges some of the lowest brokerage rates available to retail investors at this capital level. The platform complexity suits an investor who is actively managing a diversified position.',
        },
        secondary: {
          name: 'Hatch',
          description:
            'Hatch remains a simpler option for the US equities component if IBKR\'s platform depth is more than needed at this stage.',
        },
      };
    case 'affluent':
      return {
        primary: {
          name: 'IBKR',
          description:
            'Your profile shows significant capital requiring multi-currency management, global market access, and low-cost execution at scale. Interactive Brokers is built for this. It supports portfolio margin, options, bonds, and direct market access across 135+ markets. For a NZ-based investor at this capital level, it is the infrastructure that matches the complexity of the position.',
        },
      };
  }
}

function auMatrix(band: BandGroup): Omit<BrokerRecommendation, 'philosophyOverlay'> {
  switch (band) {
    case 'emerging':
      return {
        primary: {
          name: 'Stake',
          description:
            'Your profile shows you are building from a smaller capital base in Australia. Stake provides commission-free US equities trading with AUD deposits and no minimum investment. For an Emerging capital investor focused on US market access, the cost structure suits the early stage.',
        },
        secondary: {
          name: 'Pearler',
          description:
            'Pearler is designed for long-term investors building positions over time. It offers fractional shares, automatic investing, and a focus on buy-and-hold portfolios. Suited to Capital Preservation and Value and Patience philosophy profiles at the Emerging stage.',
        },
      };
    case 'growing':
      return {
        primary: {
          name: 'Stake',
          description:
            'Stake\'s commission-free structure and AUD-to-USD conversion suits a Growing capital investor building a US equities position without paying per-trade fees that erode returns at this stage.',
        },
        secondary: {
          name: 'Pearler',
          description:
            'For Growing capital investors with a long-term systematic philosophy, Pearler\'s automatic investing features and focus on index funds suits the approach.',
        },
      };
    case 'established':
      return {
        primary: {
          name: 'IBKR',
          description:
            'Your profile shows established capital requiring access beyond a single market. Interactive Brokers supports AUD accounts with access to ASX, NYSE, NASDAQ, and global markets at competitive rates. The platform suits an investor actively managing a multi-market position.',
        },
        secondary: {
          name: 'CommSec',
          description:
            'CommSec remains the most familiar platform for ASX-focused investors at this capital level with straightforward execution and integration with Commonwealth Bank accounts.',
        },
      };
    case 'affluent':
      return {
        primary: {
          name: 'IBKR',
          description:
            'Your profile shows significant capital requiring multi-currency management, global market access, and low-cost execution at scale. Interactive Brokers supports portfolio margin, AUD/USD/GBP accounts, and direct access to 135+ markets. For an AU-based investor at this capital level managing SMSF or personal capital, it is the infrastructure that matches the position.',
        },
      };
  }
}

function ukMatrix(band: BandGroup): Omit<BrokerRecommendation, 'philosophyOverlay'> {
  if (band === 'emerging' || band === 'growing') {
    return {
      primary: {
        name: 'Trading 212',
        description:
          'Your profile shows you are building capital in the United Kingdom. Trading 212 offers commission-free investing with fractional shares and an ISA wrapper, and no minimum deposit. Those characteristics suit an investor at the early stage of building a position.',
      },
      secondary: {
        name: 'Freetrade',
        description:
          'Freetrade offers a stocks and shares ISA with no platform fee on the basic plan and commission-free trading. Suited to Emerging and Growing capital investors focused on keeping costs low.',
      },
    };
  }
  // established / affluent
  return {
    primary: {
      name: 'IBKR',
      description:
        'Your profile shows established to significant capital requiring global market access and multi-currency management. Interactive Brokers supports GBP accounts with access to LSE, NYSE, NASDAQ, and 135+ global markets at institutional-grade rates. For a UK-based investor managing a diversified position, it is the infrastructure that matches the complexity.',
    },
  };
}

function caMatrix(band: BandGroup): Omit<BrokerRecommendation, 'philosophyOverlay'> {
  if (band === 'emerging' || band === 'growing') {
    return {
      primary: {
        name: 'Wealthsimple Trade',
        description:
          'Your profile shows you are building capital in Canada. Wealthsimple Trade offers commission-free investing in Canadian and US equities with CAD and USD accounts and no minimum investment. Those characteristics suit an investor at the early stage of building a position.',
      },
    };
  }
  // established / affluent
  return {
    primary: {
      name: 'IBKR',
      description:
        'Your profile shows established to significant capital requiring global market access and multi-currency management. Interactive Brokers supports CAD accounts with access to TSX, NYSE, NASDAQ, and 135+ global markets. For a Canadian investor managing a diversified position, it is the infrastructure that matches the complexity.',
    },
  };
}

function otherMatrix(): Omit<BrokerRecommendation, 'philosophyOverlay'> {
  return {
    primary: {
      name: 'IBKR',
      description:
        'Your profile is outside our primary markets. Interactive Brokers operates in most jurisdictions globally, supports multi-currency accounts, and has no minimum deposit requirement. It is the most broadly accessible institutional-grade platform available to retail investors internationally. Check availability in your specific country at ibkr.com.',
    },
  };
}

// ---------------------------------------------------------------------------
// Philosophy overlays
// ---------------------------------------------------------------------------

function getPhilosophyOverlay(brokerName: string, philosophy: string): string | undefined {
  switch (philosophy) {
    case 'Value and Patience':
      return `${brokerName}'s low-cost structure suits a long-term hold approach where minimising transaction costs compounds over time.`;
    case 'Disruptive Growth':
      return `${brokerName} provides access to the US markets where most high-growth and innovation-focused equities are listed.`;
    case 'Macro and Hard Assets':
      if (brokerName !== 'IBKR') return undefined;
      return "IBKR's multi-currency accounts and access to commodities, gold ETFs, and global fixed income suit a macro-aware portfolio.";
    case 'Rules-Based Systematic':
      if (brokerName !== 'IBKR') return undefined;
      return "IBKR's API access and algorithmic order types suit a rules-based investor who wants execution to match a written system.";
    case 'Capital Preservation':
      return `${brokerName}'s low-cost structure minimises drag on a capital preservation portfolio where every basis point matters.`;
    default:
      return undefined;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getBrokerRecommendation(
  country: string,
  capitalBand: string,
  philosophy?: string | null,
): BrokerRecommendation {
  const band = normaliseBand(capitalBand);

  let base: Omit<BrokerRecommendation, 'philosophyOverlay'>;

  switch (country) {
    case 'NZ':
      base = nzMatrix(band);
      break;
    case 'AU':
      base = auMatrix(band);
      break;
    case 'UK':
      base = ukMatrix(band);
      break;
    case 'CA':
      base = caMatrix(band);
      break;
    default:
      base = otherMatrix();
      break;
  }

  const result: BrokerRecommendation = { ...base };

  if (philosophy) {
    const overlay = getPhilosophyOverlay(base.primary.name, philosophy);
    if (overlay) {
      result.philosophyOverlay = overlay;
    }
  }

  return result;
}

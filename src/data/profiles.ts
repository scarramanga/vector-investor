import type { PersonaType, CapitalBand } from '../types';

export interface ProfileContent {
  persona: PersonaType;
  accentColor: string;
  headline: string;
  recognition: string;
  reframe: string;
  orientation: OrientationPoint[];
  bridgeText: string;
  bridgeCTA: string;
}

export interface OrientationPoint {
  title: string;
  body: string;
}

export interface CapitalOverlay {
  band: CapitalBand;
  label: string;
  description: string;
  stackmotiveTier: string;
  firstAction: string;
}

export const profiles: Record<PersonaType, ProfileContent> = {
  'awakening': {
    persona: 'awakening',
    accentColor: 'var(--profile-awakening)',
    headline: 'You can see it. Now let\'s give it direction.',
    recognition: 'Something shifted for you — a conversation, an article, a number that didn\'t add up. You\'re not sure exactly when it happened but you know the old assumptions don\'t feel as solid as they once did. You\'ve started paying attention in a different way. The problem is that paying attention and knowing what to do about it are two completely different things.',
    reframe: 'That gap — between understanding something is wrong and knowing how to respond — is exactly where most people stay. Not because they\'re not smart enough. Because nobody gives them a framework that connects the two.',
    orientation: [
      {
        title: 'Nominal returns vs real returns',
        body: 'Your money might be growing in number while shrinking in purchasing power. Understanding that distinction changes how you evaluate almost every financial decision.'
      },
      {
        title: 'What a debasement-resilient portfolio looks like',
        body: 'Not a single answer — a philosophy. Hard assets, geographic diversification, currency exposure across more than one monetary system. These are concepts worth understanding before they become decisions.'
      },
      {
        title: 'The index fund in context',
        body: 'It\'s not wrong as a starting point. But it works better as one component of a considered philosophy than as the whole answer.'
      }
    ],
    bridgeText: 'StackMotive is built for investors who want institutional-grade intelligence without institutional access. If you\'re ready to start building a portfolio that reflects what you actually believe about the world — or even just to understand what that might look like — it\'s worth exploring.',
    bridgeCTA: 'Explore StackMotive →'
  },
  'gut-trader': {
    persona: 'gut-trader',
    accentColor: 'var(--profile-gut-trader)',
    headline: 'Your instincts are telling you something. Let\'s find out what.',
    recognition: 'You\'ve been in the market doing things while others were still thinking about it. Maybe crypto, maybe some stocks, maybe both. You don\'t wait for perfect information because you\'ve learned it never arrives. You act on pattern recognition, on a feel for when something is moving, on a conviction that sitting still is its own kind of risk. The problem isn\'t your instincts. It\'s that instincts without a framework underneath them are hard to build on consistently.',
    reframe: 'The investors who perform best over time aren\'t the ones who eliminate instinct — they\'re the ones who give their instincts a coherent framework to operate within. What you\'ve been doing by feel is closer to right than you probably realise. The question is whether you can articulate why — because the ones who can articulate why make better decisions when markets get noisy.',
    orientation: [
      {
        title: 'Momentum vs conviction',
        body: 'Momentum is reading the room correctly in the short term. Conviction is understanding why something should be worth more in five years than it is today. Both are valid — but they require different position sizing, different time horizons, and different exit thinking.'
      },
      {
        title: 'Portfolio architecture',
        body: 'Most active investors accumulate positions without a conscious architecture underneath. Having one means your instincts are operating within a considered structure rather than building something random by accident.'
      },
      {
        title: 'Currency and macro context',
        body: 'Your instincts are probably already picking up signals from the broader environment. Understanding the framework those signals sit within gives your pattern recognition a much stronger foundation to work from.'
      }
    ],
    bridgeText: 'StackMotive is built for investors who are already active and want the intelligence layer to match. Real-time signals, institutional flow data, portfolio analytics that show you what you\'re actually holding and how it\'s positioned — not just what you paid for it. If you\'re going to back your instincts, back them with the best information available.',
    bridgeCTA: 'Explore StackMotive →'
  },
  'swamped-analyst': {
    persona: 'swamped-analyst',
    accentColor: 'var(--profile-swamped)',
    headline: 'You know enough. The missing piece isn\'t more information.',
    recognition: 'You\'ve done the reading. Probably more than most people in any room you walk into. You understand the arguments, you\'ve followed the debates, you can hold multiple competing views simultaneously and see the merit in each. The problem isn\'t knowledge — you have plenty of that. It\'s that somewhere between understanding everything and doing something, the decision keeps getting deferred. There\'s always one more thing to read, one more variable to consider, one more reason to wait for clarity that never quite arrives.',
    reframe: 'Here\'s the thing about perfect information — it doesn\'t exist in markets. It never has. The investors who act aren\'t the ones who know more. They\'re the ones who\'ve made peace with uncertainty and built a framework that lets them act anyway. You already have ninety percent of what you need. What\'s missing isn\'t another data point. It\'s permission to simplify.',
    orientation: [
      {
        title: 'Reduce the decision to its core question',
        body: 'Not "what is the perfect portfolio" but "what do I actually believe about the next decade and what does a portfolio that reflects that belief look like." One question. One answer. Everything else follows.'
      },
      {
        title: 'Reduce the asset class universe',
        body: 'You need a considered view on four or five things — hard assets, currency exposure, equity geography, cash equivalents, and one or two higher conviction positions. That\'s a complete portfolio philosophy. Not a compromise. A choice.'
      },
      {
        title: 'Reduce the research loop',
        body: 'Give yourself a framework and a deadline. "I will make one decision by this date based on what I already know." The research doesn\'t stop. But it stops being the reason not to act. Acting on eighty percent conviction will teach you more than reading for another six months.'
      }
    ],
    bridgeText: 'StackMotive is built for investors who want signal not noise. The platform surfaces what matters — institutional flow, real-time alerts, portfolio analytics — without requiring you to process everything yourself. For someone who has been drowning in information, that filter is the point. You bring the framework. StackMotive brings the intelligence.',
    bridgeCTA: 'Explore StackMotive →'
  },
  'comfortable-blind-spot': {
    persona: 'comfortable-blind-spot',
    accentColor: 'var(--profile-blind-spot)',
    headline: 'You\'ve built something real. Here\'s a lens worth adding.',
    recognition: 'You\'ve done what most people haven\'t. You\'ve worked hard, made considered decisions, and built genuine wealth over time. Property, retirement savings, a managed fund that\'s been ticking along — the picture looks solid because it largely is. You\'re not here because something feels wrong. You\'re here because you\'re the kind of person who stays curious, even when things are going well.',
    reframe: 'The financial decisions that got you here were made in a particular environment. That environment has been shifting — quietly, gradually, in ways that don\'t show up in your account balance but do show up in what that balance actually buys. That\'s not a reason for alarm. It\'s a reason for a second look.',
    orientation: [
      {
        title: 'Concentration risk',
        body: 'Property has been an exceptional wealth builder. The question worth sitting with is not whether it was the right decision — it clearly was — but whether the next decade rewards the same concentration as the last two. That\'s not a prediction. It\'s a question worth having a framework for.'
      },
      {
        title: 'Growing wealth vs preserving purchasing power',
        body: 'A managed fund that returns eight percent in a year where the real cost of living rises by six is a different outcome than it appears on paper. Understanding that distinction doesn\'t require changing anything immediately. It just changes how you read the numbers you\'re already looking at.'
      }
    ],
    bridgeText: 'StackMotive is used by investors who want to see their full financial picture clearly — not just individual accounts in isolation, but the whole thing in one place, through a lens that accounts for the environment those assets are sitting in. For someone at your stage, that kind of visibility isn\'t about finding problems. It\'s about confidence.',
    bridgeCTA: 'Explore StackMotive →'
  }
};

export const capitalOverlays: Record<CapitalBand, CapitalOverlay> = {
  'emerging': {
    band: 'emerging',
    label: 'Emerging',
    description: 'Your primary asset right now is time. Small, consistent, philosophically coherent positions compound in ways that matter enormously over a long horizon. The first decision matters less than the framework and habit underneath it.',
    stackmotiveTier: 'Observer',
    firstAction: 'Build your first watchlist around the asset classes you\'ve just been introduced to. See what institutional money is doing in those spaces — for free, with no commitment.'
  },
  'building': {
    band: 'building',
    label: 'Building',
    description: 'You have enough capital to diversify meaningfully across three or four asset classes. Decisions are starting to compound. A philosophy before a portfolio is the right sequence at this stage.',
    stackmotiveTier: 'Navigator',
    firstAction: 'Run your existing positions through the confluence engine. Find out whether the signals underneath your decisions confirm what you\'ve been thinking.'
  },
  'established': {
    band: 'established',
    label: 'Established',
    description: 'Real portfolio construction decisions are now relevant. Asset class mix, currency exposure, rebalancing — these all matter at your capital level. A coherent framework is worth more here than it is at any earlier stage.',
    stackmotiveTier: 'Operator',
    firstAction: 'Set alerts on positions you\'ve been watching. Let StackMotive tell you when something changes instead of monitoring it yourself.'
  },
  'concentrated': {
    band: 'concentrated',
    label: 'Concentrated',
    description: 'You have significant total wealth but it\'s concentrated — likely in property or a single asset class. The conversation isn\'t about starting from scratch. It\'s about understanding what that concentration means in the current environment and what pathways toward diversification look like without disrupting what you\'ve built.',
    stackmotiveTier: 'Operator',
    firstAction: 'Build your portfolio manually in StackMotive — property included. See your full picture in one place for the first time. No decisions required. Just visibility.'
  },
  'sovereign-capital': {
    band: 'sovereign-capital',
    label: 'Sovereign Capital',
    description: 'You have meaningful deployable capital across diversified assets. The question at your level isn\'t orientation — it\'s whether your existing portfolio reflects a coherent philosophy about the current monetary environment, or whether it was assembled without one.',
    stackmotiveTier: 'Sovereign',
    firstAction: 'Upload your full portfolio to StackMotive. The intelligence layer will surface what the institutional data says about your current positioning.'
  },
  'sovereign-concentrated': {
    band: 'sovereign-concentrated',
    label: 'Sovereign — Concentrated',
    description: 'You\'ve built significant wealth — likely property heavy, with managed funds running in the background. By conventional measures you\'ve done exceptionally well. The lens worth adding isn\'t about what you\'ve done. It\'s about whether what you\'ve built is positioned for the decade ahead as well as it was for the decade behind.',
    stackmotiveTier: 'Sovereign',
    firstAction: 'Build your full picture in StackMotive — property, managed funds, and liquid positions together. Confidence comes from visibility. Start there.'
  }
};

export const capitalBandLabels: Record<CapitalBand, string> = {
  'emerging': 'Emerging',
  'building': 'Building',
  'established': 'Established',
  'concentrated': 'Concentrated',
  'sovereign-capital': 'Sovereign Capital',
  'sovereign-concentrated': 'Sovereign — Concentrated'
};

export interface EducationConcept {
  name: string;
  description: string;
}

export const educationConcepts: Record<string, EducationConcept> = {
  'The Debasement Mechanism': {
    name: 'The Debasement Mechanism',
    description: 'How currency supply expansion quietly erodes the purchasing power of savings, wages, and fixed-income assets over time.'
  },
  'Real Returns vs Nominal Returns': {
    name: 'Real Returns vs Nominal Returns',
    description: 'The difference between what your portfolio says it earned and what that gain actually buys in the real world.'
  },
  'The Index Fund in Context': {
    name: 'The Index Fund in Context',
    description: 'A proven tool — but understanding its assumptions helps you decide whether it belongs as the whole portfolio or one part of it.'
  },
  'Momentum vs Conviction': {
    name: 'Momentum vs Conviction',
    description: 'Two valid investment approaches that require fundamentally different position sizing, time horizons, and exit strategies.'
  },
  'Portfolio Architecture': {
    name: 'Portfolio Architecture',
    description: 'The conscious structure underneath your positions — the difference between a portfolio and a collection of trades.'
  },
  'Currency Exposure and Geographic Diversification': {
    name: 'Currency Exposure and Geographic Diversification',
    description: 'Why holding assets denominated in a single currency is itself a concentrated position — and what alternatives look like.'
  },
  'The Cost of Inaction': {
    name: 'The Cost of Inaction',
    description: 'Waiting for perfect information has a measurable cost. Understanding that cost changes how you think about readiness.'
  },
  'Concentration Risk': {
    name: 'Concentration Risk',
    description: 'When most of your wealth sits in one asset class, you\'re making a single bet whether you intended to or not.'
  },
  'The Post-1971 Monetary Architecture': {
    name: 'The Post-1971 Monetary Architecture',
    description: 'The framework that governs how money works today — and why it matters for anyone holding assets denominated in fiat currency.'
  }
};

export const personaEducationCards: Record<PersonaType, string[]> = {
  'awakening': ['The Debasement Mechanism', 'Real Returns vs Nominal Returns', 'The Index Fund in Context'],
  'gut-trader': ['Momentum vs Conviction', 'Portfolio Architecture', 'Currency Exposure and Geographic Diversification'],
  'swamped-analyst': ['The Cost of Inaction', 'Portfolio Architecture', 'Real Returns vs Nominal Returns'],
  'comfortable-blind-spot': ['Concentration Risk', 'Real Returns vs Nominal Returns', 'The Post-1971 Monetary Architecture']
};

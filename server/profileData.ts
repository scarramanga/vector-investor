/**
 * Static profile data for server-side PDF generation.
 * Duplicated from src/data/ since the server tsconfig only includes server/.
 */

export type PersonaType = 'awakening' | 'gut-trader' | 'swamped-analyst' | 'comfortable-blind-spot';
export type CapitalBand = 'emerging' | 'building' | 'established' | 'concentrated' | 'sovereign-capital' | 'sovereign-concentrated';

export const profileHeadlines: Record<PersonaType, string> = {
  'awakening': 'You can see it. Now let\'s give it direction.',
  'gut-trader': 'Your instincts are telling you something. Let\'s find out what.',
  'swamped-analyst': 'You know enough. The missing piece isn\'t more information.',
  'comfortable-blind-spot': 'You\'ve built something real. Here\'s a lens worth adding.',
};

export const staticRecognition: Record<PersonaType, string> = {
  'awakening': 'Something shifted for you \u2014 a conversation, an article, a number that didn\'t add up. You\'re not sure exactly when it happened but you know the old assumptions don\'t feel as solid as they once did. You\'ve started paying attention in a different way. The problem is that paying attention and knowing what to do about it are two completely different things.',
  'gut-trader': 'You\'ve been in the market doing things while others were still thinking about it. Maybe crypto, maybe some stocks, maybe both. You don\'t wait for perfect information because you\'ve learned it never arrives. You act on pattern recognition, on a feel for when something is moving, on a conviction that sitting still is its own kind of risk. The problem isn\'t your instincts. It\'s that instincts without a framework underneath them are hard to build on consistently.',
  'swamped-analyst': 'You\'ve done the reading. Probably more than most people in any room you walk into. You understand the arguments, you\'ve followed the debates, you can hold multiple competing views simultaneously and see the merit in each. The problem isn\'t knowledge \u2014 you have plenty of that. It\'s that somewhere between understanding everything and doing something, the decision keeps getting deferred. There\'s always one more thing to read, one more variable to consider, one more reason to wait for clarity that never quite arrives.',
  'comfortable-blind-spot': 'You\'ve done what most people haven\'t. You\'ve worked hard, made considered decisions, and built genuine wealth over time. Property, retirement savings, a managed fund that\'s been ticking along \u2014 the picture looks solid because it largely is. You\'re not here because something feels wrong. You\'re here because you\'re the kind of person who stays curious, even when things are going well.',
};

export const staticReframe: Record<PersonaType, string> = {
  'awakening': 'That gap \u2014 between understanding something is wrong and knowing how to respond \u2014 is exactly where most people stay. Not because they\'re not smart enough. Because nobody gives them a framework that connects the two.',
  'gut-trader': 'The investors who perform best over time aren\'t the ones who eliminate instinct \u2014 they\'re the ones who give their instincts a coherent framework to operate within. What you\'ve been doing by feel is closer to right than you probably realise. The question is whether you can articulate why \u2014 because the ones who can articulate why make better decisions when markets get noisy.',
  'swamped-analyst': 'Here\'s the thing about perfect information \u2014 it doesn\'t exist in markets. It never has. The investors who act aren\'t the ones who know more. They\'re the ones who\'ve made peace with uncertainty and built a framework that lets them act anyway. You already have ninety percent of what you need. What\'s missing isn\'t another data point. It\'s permission to simplify.',
  'comfortable-blind-spot': 'The financial decisions that got you here were made in a particular environment. That environment has been shifting \u2014 quietly, gradually, in ways that don\'t show up in your account balance but do show up in what that balance actually buys. That\'s not a reason for alarm. It\'s a reason for a second look.',
};

export const adviserManagedRecognition: Record<PersonaType, string> = {
  'awakening': 'You have a professional managing your investments, which puts you ahead of most. Something has shifted in your thinking recently \u2014 a growing sense that the environment your adviser is operating within may be changing in ways that matter. That awareness is valuable. The question Vector raises is not whether your adviser is doing a good job. It is whether the framework they are operating within reflects what you are starting to believe about the monetary environment.',
  'gut-trader': 'You have a professional managing your investments, but you have instincts of your own \u2014 pattern recognition, a sense of when things are moving, a conviction that the environment matters. Those instincts are not in competition with your adviser. They are a signal that you want to understand what is happening underneath the decisions being made on your behalf.',
  'swamped-analyst': 'You have a professional managing your investments, and you have done plenty of your own research alongside that. You understand the arguments, you have followed the debates, and you probably have views your adviser has not heard yet. The gap is not knowledge \u2014 it is knowing how to use what you know in the context of a managed relationship.',
  'comfortable-blind-spot': 'You have a professional managing your investments, which puts you ahead of most. You have worked hard, made considered decisions, and built genuine wealth over time. The picture looks solid because it largely is. You are not here because something feels wrong. You are here because you are the kind of person who stays curious, even when things are going well \u2014 and that includes being curious about whether the framework your adviser is working within still fits the environment.',
};

export const adviserManagedReframe: Record<PersonaType, string> = {
  'awakening': 'Having an adviser does not mean stepping back from understanding. The most productive adviser relationships are the ones where the client brings a framework of their own \u2014 not to override the professional, but to ask better questions. That is what orientation looks like when someone else is managing the decisions.',
  'gut-trader': 'The most effective adviser relationships are not passive ones. They are partnerships where the client brings a considered view and the adviser brings execution. Your instincts are telling you something worth listening to. The question is whether you have a framework for articulating what you are sensing \u2014 because that is what turns a gut feeling into a productive conversation with your adviser.',
  'swamped-analyst': 'Your research is not wasted just because someone else executes. The investors who get the most from their advisers are the ones who can articulate a coherent philosophy \u2014 not to micromanage, but to ensure the portfolio reflects what they actually believe. You already have the knowledge. What is missing is a framework for translating it into the right questions.',
  'comfortable-blind-spot': 'The financial environment your adviser built your portfolio in has been shifting \u2014 quietly, gradually, in ways that do not show up in your account balance but do show up in what that balance actually buys. Having a professional in your corner does not change the question. It changes who you ask it to. And the best version of that conversation starts with your own framework for understanding the environment.',
};

export const capitalBandLabels: Record<CapitalBand, string> = {
  'emerging': 'Emerging',
  'building': 'Building',
  'established': 'Established',
  'concentrated': 'Concentrated',
  'sovereign-capital': 'Sovereign Capital',
  'sovereign-concentrated': 'Sovereign \u2014 Concentrated',
};

export const capitalOverlayDescriptions: Record<CapitalBand, string> = {
  'emerging': 'Your primary asset right now is time. Small, consistent, philosophically coherent positions compound in ways that matter enormously over a long horizon. The first decision matters less than the framework and habit underneath it.',
  'building': 'You have enough capital to diversify meaningfully across three or four asset classes. Decisions are starting to compound. A philosophy before a portfolio is the right sequence at this stage.',
  'established': 'Real portfolio construction decisions are now relevant. Asset class mix, currency exposure, rebalancing \u2014 these all matter at your capital level. A coherent framework is worth more here than it is at any earlier stage.',
  'concentrated': 'You have significant total wealth but it\'s concentrated \u2014 likely in property or a single asset class. The conversation isn\'t about starting from scratch. It\'s about understanding what that concentration means in the current environment and what pathways toward diversification look like without disrupting what you\'ve built.',
  'sovereign-capital': 'You have meaningful deployable capital across diversified assets. The question at your level isn\'t orientation \u2014 it\'s whether your existing portfolio reflects a coherent philosophy about the current monetary environment, or whether it was assembled without one.',
  'sovereign-concentrated': 'You\'ve built significant wealth \u2014 likely property heavy, with managed funds running in the background. By conventional measures you\'ve done exceptionally well. The lens worth adding isn\'t about what you\'ve done. It\'s about whether what you\'ve built is positioned for the decade ahead as well as it was for the decade behind.',
};

export const preservationOverlayDescriptions: Record<CapitalBand, string> = {
  'emerging': 'Your deployable capital is modest, but preservation still matters at every level. The priority is ensuring what you have is protected against purchasing power erosion while you evaluate how to position it most effectively for the years ahead.',
  'building': 'Your deployable capital sits in the $10,000 to $50,000 range. At this stage, the priority is ensuring what you have is working efficiently and protected against purchasing power erosion, not aggressive growth. A considered philosophy matters more than chasing returns.',
  'established': 'You have meaningful capital to work with. At this stage, the conversation shifts from accumulation to positioning. Asset class mix, currency exposure, and rebalancing all matter \u2014 not to grow aggressively, but to ensure what you have retains its real value over the decade ahead.',
  'concentrated': 'You have significant total wealth but it is concentrated \u2014 likely in property or a single asset class. The conversation is not about disrupting what you have built. It is about understanding whether that concentration is positioned to preserve your purchasing power in the current environment, and what measured diversification might look like.',
  'sovereign-capital': 'You have meaningful deployable capital across diversified assets. At your stage, the question is not orientation but whether your current positioning preserves purchasing power and generates real returns in an environment that may look quite different from the one in which this wealth was assembled.',
  'sovereign-concentrated': 'You have built significant wealth \u2014 likely property heavy, with managed funds running in the background. By conventional measures you have done exceptionally well. The lens worth adding is whether what you have built is positioned to protect and sustain your wealth for the decade ahead as well as it did for the decade behind.',
};

export interface EducationConcept {
  name: string;
  description: string;
}

export const educationConcepts: Record<string, EducationConcept> = {
  'The Debasement Mechanism': {
    name: 'The Debasement Mechanism',
    description: 'How currency supply expansion quietly erodes the purchasing power of savings, wages, and fixed-income assets over time.',
  },
  'Real Returns vs Nominal Returns': {
    name: 'Real Returns vs Nominal Returns',
    description: 'The difference between what your portfolio says it earned and what that gain actually buys in the real world.',
  },
  'The Index Fund in Context': {
    name: 'The Index Fund in Context',
    description: 'A proven tool \u2014 but understanding its assumptions helps you decide whether it belongs as the whole portfolio or one part of it.',
  },
  'Momentum vs Conviction': {
    name: 'Momentum vs Conviction',
    description: 'Two valid investment approaches that require fundamentally different position sizing, time horizons, and exit strategies.',
  },
  'Portfolio Architecture': {
    name: 'Portfolio Architecture',
    description: 'The conscious structure underneath your positions \u2014 the difference between a portfolio and a collection of trades.',
  },
  'Currency Exposure and Geographic Diversification': {
    name: 'Currency Exposure and Geographic Diversification',
    description: 'Why holding assets denominated in a single currency is itself a concentrated position \u2014 and what alternatives look like.',
  },
  'The Cost of Inaction': {
    name: 'The Cost of Inaction',
    description: 'Waiting for perfect information has a measurable cost. Understanding that cost changes how you think about readiness.',
  },
  'Concentration Risk': {
    name: 'Concentration Risk',
    description: 'When most of your wealth sits in one asset class, you\'re making a single bet whether you intended to or not.',
  },
  'The Post-1971 Monetary Architecture': {
    name: 'The Post-1971 Monetary Architecture',
    description: 'The framework that governs how money works today \u2014 and why it matters for anyone holding assets denominated in fiat currency.',
  },
};

export const personaEducationCards: Record<PersonaType, string[]> = {
  'awakening': ['The Debasement Mechanism', 'Real Returns vs Nominal Returns', 'The Index Fund in Context'],
  'gut-trader': ['Momentum vs Conviction', 'Portfolio Architecture', 'Currency Exposure and Geographic Diversification'],
  'swamped-analyst': ['The Cost of Inaction', 'Portfolio Architecture', 'Real Returns vs Nominal Returns'],
  'comfortable-blind-spot': ['Concentration Risk', 'Real Returns vs Nominal Returns', 'The Post-1971 Monetary Architecture'],
};

export const lifeStageLabels: Record<string, string> = {
  early_career: 'Early career',
  mid_career: 'Mid-career',
  established: 'Established',
  preservation: 'Approaching or in retirement',
};

export const timeHorizonLabels: Record<string, string> = {
  long: '10+ years',
  medium: '3\u201310 years',
  short: 'Shorter term with preservation focus',
  undefined: 'Not specified',
};

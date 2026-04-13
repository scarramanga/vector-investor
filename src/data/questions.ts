import type { Question } from '../types';

export const questions: Question[] = [
  {
    id: 1,
    layer: 1,
    text: "When you think about your financial future, what feeling comes up most honestly?",
    options: [
      { letter: 'A', text: "I feel reasonably settled. I've worked hard, built something, and while nothing's certain I think I'm on the right track.", personaSignal: 'comfortable-blind-spot' },
      { letter: 'B', text: "I feel like something has shifted and I'm not sure my current approach reflects that.", personaSignal: 'awakening' },
      { letter: 'C', text: "I feel like I'm doing things but I'm not sure they add up to anything coherent.", personaSignal: 'gut-trader' },
      { letter: 'D', text: "I feel like I know what I should do but I can never quite pull the trigger.", personaSignal: 'swamped-analyst' }
    ]
  },
  {
    id: 2,
    layer: 1,
    text: "Over the next ten years, which of these feels most true to you?",
    options: [
      { letter: 'A', text: "The fundamentals are sound. Property, retirement savings, steady contributions — that's a solid foundation.", personaSignal: 'comfortable-blind-spot' },
      { letter: 'B', text: "I think the rules of money are changing and I'm not sure the old playbook still works.", personaSignal: 'awakening' },
      { letter: 'C', text: "I've been hearing a lot about inflation and currency and honestly I'm not sure what to believe." },
      { letter: 'D', text: "I think there's something broken in the system but I haven't figured out what it means for me personally.", personaSignal: 'awakening' }
    ]
  },
  {
    id: 3,
    layer: 1,
    text: "Where does most of your financial worth actually sit right now?",
    options: [
      { letter: 'A', text: "Mostly in property — my home or investment properties.", capitalSignal: 'concentrated' },
      { letter: 'B', text: "Spread across a few things — retirement savings, some investments, maybe some cash.", capitalSignal: 'established' },
      { letter: 'C', text: "Mainly in a retirement or managed fund that largely runs itself.", capitalSignal: 'building' },
      { letter: 'D', text: "I have some savings and I'm building — but I wouldn't say I have a portfolio yet.", capitalSignal: 'emerging' }
    ]
  },
  {
    id: 4,
    layer: 1,
    text: "When it comes to investing, which best describes you?",
    options: [
      { letter: 'A', text: "I don't really invest actively — my money is in retirement savings or property and that feels like enough.", personaSignal: 'comfortable-blind-spot' },
      { letter: 'B', text: "I've bought some shares or ETFs, maybe some crypto — I act when something feels right.", personaSignal: 'gut-trader' },
      { letter: 'C', text: "I research a lot but I find it hard to commit. There's always more to know.", personaSignal: 'swamped-analyst' },
      { letter: 'D', text: "I've been meaning to do something differently but I haven't found the right framework yet.", personaSignal: 'awakening' }
    ]
  },
  {
    id: 5,
    layer: 1,
    text: "You've probably heard that putting money in a broad market index fund is the smart default. What's your honest reaction to that?",
    options: [
      { letter: 'A', text: "That sounds right to me. Low cost, diversified, proven track record. Makes sense.", personaSignal: 'comfortable-blind-spot' },
      { letter: 'B', text: "I do that already but I wonder if it's the whole answer or just part of one.", personaSignal: 'gut-trader' },
      { letter: 'C', text: "I've heard it but I'm not sure it accounts for everything going on in the world right now.", personaSignal: 'awakening' },
      { letter: 'D', text: "I'm not sure any single answer is right for everyone — context has to matter.", personaSignal: 'swamped-analyst' }
    ]
  },
  {
    id: 6,
    layer: 2,
    text: "If you decided tomorrow to put money to work in a new investment, how much could you realistically move without disrupting your life?",
    options: [
      { letter: 'A', text: "Honestly, not much right now — maybe a few thousand at most.", capitalSignal: 'emerging' },
      { letter: 'B', text: "I could free up somewhere between $10,000 and $50,000 if I was confident in the decision.", capitalSignal: 'building' },
      { letter: 'C', text: "I have meaningful capital available — $50,000 or more that isn't doing much right now.", capitalSignal: 'established' },
      { letter: 'D', text: "My wealth is mostly tied up in property or retirement funds — liquid cash is limited relative to my overall position.", capitalSignal: 'concentrated' }
    ]
  },
  {
    id: 7,
    layer: 2,
    text: "If you had to describe where your wealth is concentrated most heavily, which feels most accurate?",
    options: [
      { letter: 'A', text: "Property is my primary asset. It's where most of my net worth lives.", capitalSignal: 'concentrated' },
      { letter: 'B', text: "It's reasonably spread — some property, some investments, some retirement savings.", capitalSignal: 'established' },
      { letter: 'C', text: "Most of it is in managed or retirement funds that I don't actively control.", capitalSignal: 'building' },
      { letter: 'D', text: "I'm still building — I don't have significant concentration anywhere yet.", capitalSignal: 'emerging' }
    ]
  },
  {
    id: 8,
    layer: 2,
    text: "When you think about your financial goals, what timeframe feels most relevant to you right now?",
    options: [
      { letter: 'A', text: "I'm thinking long term — ten years or more. I'm in accumulation mode." },
      { letter: 'B', text: "I'm thinking medium term — five to ten years. I want to see real progress within that window." },
      { letter: 'C', text: "I'm thinking shorter term — I'm closer to or in retirement and preservation matters as much as growth." },
      { letter: 'D', text: "Honestly I haven't thought about it in specific timeframes — I just want things to be better than they are." }
    ]
  },
  {
    id: 9,
    layer: 2,
    text: "How would you describe your awareness of how inflation and currency movements might be affecting your wealth right now?",
    options: [
      { letter: 'A', text: "I'm very aware — it's something I actively think about and factor into my decisions.", personaSignal: 'awakening' },
      { letter: 'B', text: "I have a general sense it matters but I haven't connected it directly to my own situation." },
      { letter: 'C', text: "I've heard the conversation but I'm not sure how much it really applies to me personally.", personaSignal: 'comfortable-blind-spot' },
      { letter: 'D', text: "It's not something I've spent much time on — my focus has been on building assets rather than analysing the environment.", personaSignal: 'comfortable-blind-spot' }
    ]
  },
  {
    id: 10,
    layer: 3,
    text: "In the last twelve months, which of these best describes what you actually did with your money?",
    options: [
      { letter: 'A', text: "Nothing significant changed — my money sat where it was and I let it run.", personaSignal: 'comfortable-blind-spot' },
      { letter: 'B', text: "I made at least one active decision — bought something, moved something, changed an allocation.", personaSignal: 'gut-trader' },
      { letter: 'C', text: "I researched and considered changes but didn't end up doing anything materially different.", personaSignal: 'swamped-analyst' },
      { letter: 'D', text: "I'm relatively new to this — twelve months ago I wasn't really thinking about it the way I am now.", personaSignal: 'awakening' }
    ]
  },
  {
    id: 11,
    layer: 3,
    text: "When you make or consider a financial decision, what drives it most honestly?",
    options: [
      { letter: 'A', text: "A general sense of what seems sensible based on what I've read or heard from others.", personaSignal: 'comfortable-blind-spot' },
      { letter: 'B', text: "A specific view I hold about where the world is heading and what that means for capital.", personaSignal: 'awakening' },
      { letter: 'C', text: "Analysis — I look at data, compare options, and try to make the most informed decision I can.", personaSignal: 'swamped-analyst' },
      { letter: 'D', text: "Instinct — I've developed a feel for what seems right even if I can't always articulate why.", personaSignal: 'gut-trader' }
    ]
  },
  {
    id: 12,
    layer: 3,
    text: "What's the most honest reason you haven't done more with your financial position than you have?",
    options: [
      { letter: 'A', text: "I'm not sure I know enough yet to act with confidence.", personaSignal: 'awakening' },
      { letter: 'B', text: "I know what I believe but I haven't found the right vehicle or starting point.", personaSignal: 'gut-trader' },
      { letter: 'C', text: "Life gets in the way — time, complexity, other priorities.", personaSignal: 'swamped-analyst' },
      { letter: 'D', text: "I haven't felt the urgency — things have been fine and that's felt like enough.", personaSignal: 'comfortable-blind-spot' }
    ]
  },
  {
    id: 13,
    layer: 3,
    text: "What would a genuinely useful outcome from this look like for you?",
    options: [
      { letter: 'A', text: "A clear starting point — something concrete I can actually do next." },
      { letter: 'B', text: "A framework — a way of thinking about my money that I can apply going forward." },
      { letter: 'C', text: "Confirmation — I want to know whether what I'm already doing makes sense." },
      { letter: 'D', text: "Perspective — I'm curious how my situation compares to a coherent investment philosophy." }
    ]
  }
];

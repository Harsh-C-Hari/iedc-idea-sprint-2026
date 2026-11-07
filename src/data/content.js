/**
 * content.js — static copy for sections that need structured data.
 *
 * All text is verbatim from the approved spec and plan.
 * Sources:
 *   manifesto  — plan section D (About): "QUESTION. IMAGINE. EXPERIMENT. CREATE."
 *   journey    — plan section D (About): DISCOVER, IDEATE, DEVELOP, PRESENT
 *   steps      — plan section D (Challenge): 01–04
 *   facts      — plan section D (Challenge): read from eventConfig in-component;
 *                only the labels live here so they stay in sync
 */

/** About — manifesto words (plan section D) */
export const manifesto = [
  'QUESTION.',
  'IMAGINE.',
  'EXPERIMENT.',
  'CREATE.',
]

/** About — journey stages (plan section D) */
export const journey = [
  {
    number: '01',
    title: 'DISCOVER',
    description:
      'Explore the challenge space. Talk to people who live the problem every day. Find the question worth answering.',
  },
  {
    number: '02',
    title: 'IDEATE',
    description:
      'Generate without limits. Combine the unexpected. The worst idea in the room is the one that never gets said.',
  },
  {
    number: '03',
    title: 'DEVELOP',
    description:
      'Pick your strongest idea and build it out. Prototype, sketch, map the flow. Make it real enough to explain.',
  },
  {
    number: '04',
    title: 'PRESENT',
    description:
      'Tell the story of your idea clearly and honestly. Show what problem it solves and why it matters.',
  },
]

/** Challenge — four steps 01–04 (plan section D) */
export const steps = [
  {
    number: '01',
    title: 'Pick your challenge',
    description:
      'Choose one of the four challenge categories. The best ideas come from problems the team actually cares about.',
  },
  {
    number: '02',
    title: 'Define the problem',
    description:
      'Narrow it down. A sharp problem statement is half the solution. Use the Idea Spark generator to get unstuck.',
  },
  {
    number: '03',
    title: 'Build your solution',
    description:
      'Prototype, sketch or demo. It doesn\'t have to work perfectly — it has to communicate clearly.',
  },
  {
    number: '04',
    title: 'Present and defend',
    description:
      'You have three minutes and a panel of judges. Know your user, your problem and your solution cold.',
  },
]

/** Challenge — fact strip labels (values come from eventConfig, not here) */
export const factLabels = {
  hours:       '24 HOURS',
  teamSize:    'TEAM SIZE',
  eligibility: 'ELIGIBILITY',
  idea:        'ONE IDEA',
}

/** Hero — supporting copy below the headline */
export const heroSupporting =
  'A 24-hour student ideathon at College of Engineering Chengannur. ' +
  'One day to question everything, imagine freely, and build something that matters.'

/** Hero — metadata row items */
export const heroMeta = [
  'IEDC BOOTCAMP CEC',
  'College of Engineering Chengannur',
  '20–21 November 2026',
  '24 hours',
]

/** About — intro section copy */
export const aboutIntro = {
  headline: 'An ideathon is not a hackathon.',
  body:
    'There is no code deadline. No working prototype required. Just one room, one problem, ' +
    'and twenty-four hours to ask better questions, imagine bolder answers, and show that ' +
    'a student from Chengannur can change how the world thinks about something.',
}

/** Footer — closing headline (plan section D) */
export const footerHeadline = ['YOUR IDEA', 'STARTS', 'HERE.']

/**
 * schedule.js — event timeline data.
 *
 * Source: provisional schedule from the approved spec (plan section D, Timeline).
 * Labels: "THE SPARK BEGINS." and "BRING IT TO LIFE." (plan section D).
 * Note: show "Schedule subject to change" until organizers confirm (plan section D).
 *
 * Each item: { time, title }
 * time: human-readable string exactly as it will be displayed.
 */

const schedule = [
  {
    day: 1,
    label: 'THE SPARK BEGINS.',
    date: '20 November 2026',
    items: [
      { time: '5:00 PM',  title: 'Registration and check-in' },
      { time: '5:30 PM',  title: 'Inauguration ceremony' },
      { time: '6:30 PM',  title: 'Problem statement reveal' },
      { time: '7:00 PM',  title: 'Ideation begins' },
      { time: '8:00 PM',  title: 'Dinner' },
      { time: '10:30 PM', title: 'Music session' },
    ],
  },
  {
    day: 2,
    label: 'BRING IT TO LIFE.',
    date: '21 November 2026',
    items: [
      { time: '7:00 AM',  title: 'Morning refreshments' },
      { time: '9:00 AM',  title: 'Mid-review checkpoint' },
      { time: '1:00 PM',  title: 'Lunch' },
      { time: '3:00 PM',  title: 'Final submissions' },
      { time: '4:00 PM',  title: 'Presentations and judging' },
      { time: '5:00 PM',  title: 'Closing ceremony and results' },
    ],
  },
]

export default schedule

/**
 * schedule.js — event timeline data.
 *
 * Source: provisional schedule from the spec (plan section D, Timeline).
 * Labels: "THE SPARK BEGINS." / "BRING IT TO LIFE." (plan section D).
 * Total: 11 items — 7 on Day 1, 4 on Day 2 (plan section G).
 *
 * Note: show "Schedule subject to change" until organizers confirm.
 * Organizer Q2 (plan section F): confirm all times, including whether the
 * music session ends at 10:30 or 11:00 PM.
 *
 * Each item: { time, title }
 */

const schedule = [
  {
    day: 1,
    label: 'THE SPARK BEGINS.',
    date: '20 November 2026',
    items: [
      { time: '5:00 PM', title: 'Registration and check-in' },
      { time: '5:30 PM', title: 'Inauguration ceremony' },
      { time: '6:30 PM', title: 'Problem statement reveal' },
      { time: '7:00 PM', title: 'Ideation sprint begins' },
      { time: '8:00 PM', title: 'Dinner' },
      { time: '10:00 PM', title: 'Music session' },
      { time: '11:00 PM', title: 'Overnight ideation continues' },
    ],
  },
  {
    day: 2,
    label: 'BRING IT TO LIFE.',
    date: '21 November 2026',
    items: [
      { time: '7:00 AM', title: 'Morning refreshments' },
      { time: '1:00 PM', title: 'Lunch' },
      { time: '3:00 PM', title: 'Final submissions' },
      { time: '5:00 PM', title: 'Presentations, judging and closing ceremony' },
    ],
  },
]

export default schedule

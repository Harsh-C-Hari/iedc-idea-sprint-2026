/**
 * prompts.js — Idea Spark prompt data.
 *
 * Four categories, 12 prompts each, all in the "How might we…" voice.
 * Source: spec starters + 8 more per category in the same voice (plan section D, Idea Spark).
 * Used by lib/pickPrompt.js with a shuffle-bag so a prompt never repeats
 * until the bag is empty and never repeats back-to-back across refills.
 */

const prompts = {
  sustainability: {
    label: 'Sustainability',
    prompts: [
      'How might we turn food waste from college canteens into something students actually want?',
      'How might we make campus energy use visible so students choose to reduce it?',
      'How might we help small farmers track soil health without expensive equipment?',
      'How might we design a community repair culture so fewer electronics end up in landfill?',
      'How might we reimagine single-use plastics on a college campus starting today?',
      'How might we connect urban households to hyper-local composting networks?',
      'How might we make secondhand buying feel as satisfying as buying new?',
      'How might we help students understand their own carbon footprint in real time?',
      'How might we bring rainwater harvesting into everyday student life?',
      'How might we reduce textile waste in a college hostel of 500 students?',
      'How might we gamify water conservation so whole neighbourhoods compete to save more?',
      'How might we help local governments track and reduce open-air burning?',
    ],
  },

  health: {
    label: 'Health & Wellbeing',
    prompts: [
      'How might we help engineering students recognise and respond to burnout before it peaks?',
      'How might we make mental health support feel as normal as visiting a doctor?',
      'How might we help rural communities access a trusted medical second opinion instantly?',
      'How might we design sleep hygiene into student hostel environments?',
      'How might we give elderly patients a way to track their own medication adherence?',
      'How might we reduce stigma around seeking counselling in colleges?',
      'How might we help parents spot early signs of childhood nutritional deficiency?',
      'How might we make physical activity feel like play for sedentary desk workers?',
      'How might we bridge the gap between a diagnosis and a patient who can\'t afford treatment?',
      'How might we help communities respond faster when a neighbour shows signs of a health crisis?',
      'How might we give visually impaired students equal access to lab-based courses?',
      'How might we bring basic diagnostic tools to villages that see a doctor once a month?',
    ],
  },

  education: {
    label: 'Education',
    prompts: [
      'How might we help first-generation college students navigate institutional life without a guide?',
      'How might we make a lecture hall of 120 students feel as responsive as a one-on-one tutoring session?',
      'How might we give a student who failed an exam the specific feedback they need to pass the next one?',
      'How might we help rural school teachers access and adapt quality teaching materials in their own language?',
      'How might we make peer learning structured enough to be useful but free enough to be fun?',
      'How might we help students who work part-time keep up with coursework without sacrificing either?',
      'How might we reimagine homework so it builds curiosity instead of resentment?',
      'How might we help parents with low literacy support their children\'s learning at home?',
      'How might we make career guidance accessible to students in tier-3 colleges?',
      'How might we reduce dropout rates in vocational training programmes?',
      'How might we help students with dyslexia get the same reading speed benefit as their peers?',
      'How might we bring project-based learning to a school that has no lab equipment?',
    ],
  },

  community: {
    label: 'Community',
    prompts: [
      'How might we help neighbours who have never met collaborate on a shared neighbourhood problem?',
      'How might we make local governance decisions legible and actionable for young citizens?',
      'How might we help migrants settling into a new city find community and practical support quickly?',
      'How might we create a cultural archive for a village whose oldest residents are disappearing?',
      'How might we help informal waste workers be recognised, safer and better paid?',
      'How might we connect retired professionals with students who need mentorship in their field?',
      'How might we support small-town artisans in reaching buyers without losing control of their craft?',
      'How might we reduce loneliness among elderly people living alone in urban apartments?',
      'How might we help communities prepare for and recover from floods with the resources they already have?',
      'How might we make volunteering so convenient that it becomes a weekly habit?',
      'How might we give street vendors a digital presence that actually fits how they work?',
      'How might we help communities document and demand accountability for local infrastructure promises?',
    ],
  },
}

export default prompts

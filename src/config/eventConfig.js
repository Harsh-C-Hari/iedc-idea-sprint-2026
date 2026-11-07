/**
 * eventConfig.js — single source of truth for all event facts.
 *
 * Rules (plan section B + H):
 *   • Any unverified value is null and its UI is hidden, never filled with a placeholder.
 *   • Never invent URLs, emails or logos.
 *   • The explicit +05:30 offset makes the countdown correct on any device timezone.
 *   • registration.status drives CTA labels and form visibility.
 *
 * Fields to update when organizers reply (plan section F):
 *   registration.endpoint, registration.deadlineISO, registration.mode,
 *   venue.mapsUrl, venue.photo, social.instagram, social.linkedin, contact.email
 */

const eventConfig = {
  /** Full event name */
  name: 'IDEA SPRINT 2026',

  /** Tagline used in hero supporting copy */
  tagline: '24 HOURS. ONE IDEA. ENDLESS POSSIBILITIES.',

  /** Organiser unit */
  organizer: 'IEDC BOOTCAMP CEC',

  /** Host college */
  college: 'College of Engineering Chengannur',

  /** All date/time math uses this offset — never the device timezone */
  timezone: 'Asia/Kolkata',

  /**
   * Event window (plan section F Q2: confirmed 20 Nov 5:00 PM – 21 Nov 5:00 PM)
   * ISO 8601 with explicit +05:30 so the countdown is correct everywhere.
   */
  startISO: '2026-11-20T17:00:00+05:30',
  endISO:   '2026-11-21T17:00:00+05:30',

  registration: {
    /**
     * 'preview'   — full validated flow; honest "not yet connected" message;
     *               Copy summary; no success screen. Default until organizers answer.
     * 'open'      — form is live (requires endpoint to be set).
     * 'opening-soon' — form replaced by opening-soon message.
     * 'closed'    — form replaced by closed message.
     */
    status: 'preview',

    /**
     * Registration deadline ISO string.
     * null until organizers confirm the date and time (plan section F Q2).
     */
    deadlineISO: null,

    /**
     * Submission mode: 'preview' | 'endpoint'
     * Switch to 'endpoint' only when organizers supply a destination (plan section B).
     */
    mode: 'preview',

    /**
     * POST target when mode === 'endpoint'.
     * null until organizers answer (plan section F Q1).
     */
    endpoint: null,
  },

  team: {
    /** Minimum team size (plan section F Q3: spec value used) */
    min: 1,
    /** Maximum team size (plan section F Q3: spec value used) */
    max: 4,
  },

  /**
   * Eligibility string shown in the fact strip and registration page.
   * "College students" per plan section F Q3 fallback.
   */
  eligibility: 'College students',

  /**
   * Semester options for the registration form.
   * null until organizers confirm the list (plan section F Q3).
   */
  semesters: null,

  /**
   * Division / branch options for the registration form.
   * null until organizers confirm the list (plan section F Q3).
   */
  divisions: null,

  venue: {
    /** College name — verified */
    college: 'College of Engineering Chengannur',

    /**
     * Room — from spec; to be confirmed by organizers (plan section F Q4).
     */
    room: 'SPDK Room, 5th Floor',

    /**
     * Google Maps link.
     * null until organizers send the confirmed link (plan section F Q4).
     * Fallback: search URL built from college name, labelled "Search on Google Maps".
     */
    mapsUrl: null,

    /**
     * Campus photo path (relative to /public/images/).
     * null until organizers supply a photo (plan section F Q4).
     * Fallback: geometric panel from Fragments.
     */
    photo: null,
  },

  social: {
    /**
     * Instagram URL.
     * null until verified (plan section F Q5). Hidden when null.
     */
    instagram: null,

    /**
     * LinkedIn URL.
     * null until verified (plan section F Q5). Hidden when null.
     */
    linkedin: null,
  },

  contact: {
    /**
     * Contact email address.
     * null until approved by organizers (plan section F Q5). Hidden when null.
     */
    email: null,
  },
}

export default eventConfig

/**
 * eventConfig.js — single source of truth for all event facts.
 *
 * Rules (plan section B + H):
 *   • Any unverified value is null and its UI is hidden, never filled with a placeholder.
 *   • Never invent URLs, emails or logos.
 *   • The explicit +05:30 offset makes the countdown correct on any device timezone.
 *   • registration.status drives CTA labels and form visibility.
 *   • Values marked provisional:true are from the spec but unconfirmed by organizers;
 *     they are shown to users but can be corrected without touching components.
 *
 * Null fields (organizer answers pending — plan section F):
 *   registration.endpoint, venue.mapsUrl, venue.photo,
 *   social.instagram, social.linkedin, contact.email
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
  endISO: '2026-11-21T17:00:00+05:30',

  registration: {
    /**
     * 'preview'      — full validated flow; honest "not yet connected" message;
     *                  Copy summary; no success screen. Default until organizers answer.
     * 'open'         — form is live (requires endpoint to be set).
     * 'opening-soon' — form replaced by opening-soon message.
     * 'closed'       — form replaced by closed message.
     */
    status: 'preview',

    /**
     * Registration deadline ISO string.
     * Provisional: 18 Nov end-of-day (plan section F Q2 fallback).
     * Confirm date AND time with organizers.
     */
    deadlineISO: '2026-11-18T23:59:00+05:30',
    provisional_deadlineISO: true,

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
   * Provisional: S1, S3, S5, S7 (odd semesters only — confirm with organizers).
   * Comment was previously incorrect ("S1–S8 even semesters").
   * Confirm the exact list with organizers before going live.
   */
  semesters: ['S1', 'S3', 'S5', 'S7'],
  provisional_semesters: true,

  /**
   * Division / branch options for the registration form.
   * Provisional: A–G (plan section F Q3).
   * Confirm the exact list with organizers.
   */
  divisions: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  provisional_divisions: true,

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
     * cec-campus.jpg with webp alternative in public/images/.
     */
    photo: 'cec-campus.jpg',
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

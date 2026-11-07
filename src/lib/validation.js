/**
 * validation.js — pure validation functions for the registration form.
 *
 * All rules from plan section B. No side effects, no imports.
 *
 * validate*(value) returns null (valid) or an error string.
 * validateStep(step, formState, eventConfig) returns { field: errorString } or {}.
 */

/** 2–40 chars trimmed, any script */
export function validateTeamName(value) {
  const v = (value ?? '').trim()
  if (v.length < 2)  return 'Team name must be at least 2 characters.'
  if (v.length > 40) return 'Team name must be 40 characters or fewer.'
  return null
}

/** 1–4, integer */
export function validateTeamSize(value, min = 1, max = 4) {
  const n = Number(value)
  if (!Number.isInteger(n) || n < min || n > max) {
    return `Team size must be between ${min} and ${max}.`
  }
  return null
}

/**
 * Full name: 2–100 chars after NFC trim, containing ≥1 Unicode letter.
 * No character whitelist. Only control characters rejected.
 */
export function validateFullName(value) {
  const v = (value ?? '').normalize('NFC').trim()
  if (v.length < 2)   return 'Name must be at least 2 characters.'
  if (v.length > 100) return 'Name must be 100 characters or fewer.'
  // Must contain at least one Unicode letter
  if (!/\p{L}/u.test(v)) return 'Name must contain at least one letter.'
  // Reject control characters
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/u.test(v)) return 'Name contains invalid characters.'
  return null
}

/** Pragmatic email format, lowercased */
export function validateEmail(value) {
  const v = (value ?? '').trim().toLowerCase()
  if (!v) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.'
  return null
}

/**
 * Phone: strip spaces, dashes, +91, leading 0.
 * Require 10 digits starting 6–9. No international numbers.
 */
export function validatePhone(value) {
  if (!value) return 'Phone number is required.'
  let v = value.trim()
  v = v.replace(/[\s\-]/g, '')
  if (v.startsWith('+91')) v = v.slice(3)
  if (v.startsWith('0'))   v = v.slice(1)
  if (!/^[6-9]\d{9}$/.test(v)) return 'Enter a valid 10-digit Indian mobile number.'
  return null
}

/** Semester must be in the config list */
export function validateSemester(value, semesters) {
  if (!semesters) return null // not enforced if config is null
  if (!semesters.includes(value)) return 'Select a valid semester.'
  return null
}

/** Division must be in the config list */
export function validateDivision(value, divisions) {
  if (!divisions) return null // not enforced if config is null
  if (!divisions.includes(value)) return 'Select a valid division.'
  return null
}

/**
 * Check for duplicate emails and phones within the team.
 * Returns { [fieldKey]: errorString } where fieldKey = `p${i}_email` etc.
 */
export function validateDuplicates(participants) {
  const errors = {}
  const emails = {}
  const phones = {}

  participants.forEach((p, i) => {
    if (!p) return
    const email = (p.email ?? '').trim().toLowerCase()
    const phone = normalizePhone(p.phone ?? '')

    if (email) {
      if (emails[email] !== undefined) {
        errors[`p${i}_email`] = 'This email is already used by another participant.'
        errors[`p${emails[email]}_email`] = 'This email is already used by another participant.'
      } else {
        emails[email] = i
      }
    }

    if (phone) {
      if (phones[phone] !== undefined) {
        errors[`p${i}_phone`] = 'This phone number is already used by another participant.'
        errors[`p${phones[phone]}_phone`] = 'This phone number is already used by another participant.'
      } else {
        phones[phone] = i
      }
    }
  })

  return errors
}

function normalizePhone(value) {
  let v = value.trim().replace(/[\s\-]/g, '')
  if (v.startsWith('+91')) v = v.slice(3)
  if (v.startsWith('0'))   v = v.slice(1)
  return v
}

/**
 * Validate step 0 (Team): teamName, teamSize.
 * Returns { [field]: errorString }
 */
export function validateTeamStep(state) {
  const errors = {}
  const nameErr = validateTeamName(state.teamName)
  if (nameErr) errors.teamName = nameErr
  return errors
}

/**
 * Validate step 1 (Participants): each active participant slot.
 * Returns { [field]: errorString }
 */
export function validateParticipantsStep(state, eventConfig) {
  const errors = {}
  const count = Number(state.teamSize)

  for (let i = 0; i < count; i++) {
    const p = state.participants[i] ?? {}

    const nameErr = validateFullName(p.name)
    if (nameErr) errors[`p${i}_name`] = nameErr

    const emailErr = validateEmail(p.email)
    if (emailErr) errors[`p${i}_email`] = emailErr

    const phoneErr = validatePhone(p.phone)
    if (phoneErr) errors[`p${i}_phone`] = phoneErr

    if (eventConfig.semesters) {
      const semErr = validateSemester(p.semester, eventConfig.semesters)
      if (semErr) errors[`p${i}_semester`] = semErr
    }

    if (eventConfig.divisions) {
      const divErr = validateDivision(p.division, eventConfig.divisions)
      if (divErr) errors[`p${i}_division`] = divErr
    }
  }

  // Duplicate check
  const active = state.participants.slice(0, count)
  const dupErrors = validateDuplicates(active)
  Object.assign(errors, dupErrors)

  return errors
}

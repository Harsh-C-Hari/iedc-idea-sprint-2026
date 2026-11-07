/**
 * useRegistrationForm.js — form state manager via useReducer.
 *
 * State shape (plan section B):
 *   step: 0 (Team) | 1 (Participants) | 2 (Review)
 *   teamName: string
 *   teamSize: number (1–4)
 *   participants: array of 4 slots { name, email, phone, semester, division }
 *   touched: { [fieldKey]: bool }
 *   errors: { [fieldKey]: string }
 *   submitting: bool
 *   submitResult: null | { ok, preview, error }
 *
 * Data is kept if team size shrinks then grows again (plan section B).
 */
import { useReducer, useCallback } from 'react'
import eventConfig from '../config/eventConfig.js'
import { validateTeamStep, validateParticipantsStep } from '../lib/validation.js'

const EMPTY_PARTICIPANT = { name: '', email: '', phone: '', semester: '', division: '' }

const initialState = {
  step:         0,
  teamName:     '',
  teamSize:     2,
  participants: [
    { ...EMPTY_PARTICIPANT },
    { ...EMPTY_PARTICIPANT },
    { ...EMPTY_PARTICIPANT },
    { ...EMPTY_PARTICIPANT },
  ],
  touched:      {},
  errors:       {},
  submitting:   false,
  submitResult: null,
}

function reducer(state, action) {
  switch (action.type) {

    case 'SET_TEAM_NAME':
      return { ...state, teamName: action.value }

    case 'SET_TEAM_SIZE':
      return { ...state, teamSize: Number(action.value) }

    case 'SET_PARTICIPANT_FIELD': {
      const { index, field, value } = action
      const participants = state.participants.map((p, i) =>
        i === index ? { ...p, [field]: value } : p
      )
      return { ...state, participants }
    }

    case 'TOUCH':
      return { ...state, touched: { ...state.touched, [action.field]: true } }

    case 'TOUCH_ALL_STEP': {
      const extra = {}
      if (action.step === 0) {
        extra.teamName = true
      } else if (action.step === 1) {
        for (let i = 0; i < state.teamSize; i++) {
          extra[`p${i}_name`]     = true
          extra[`p${i}_email`]    = true
          extra[`p${i}_phone`]    = true
          extra[`p${i}_semester`] = true
          extra[`p${i}_division`] = true
        }
      }
      return { ...state, touched: { ...state.touched, ...extra } }
    }

    case 'SET_ERRORS':
      return { ...state, errors: action.errors }

    case 'NEXT_STEP':
      return { ...state, step: state.step + 1, errors: {} }

    case 'GO_TO_STEP':
      return { ...state, step: action.step, errors: {} }

    case 'SET_SUBMITTING':
      return { ...state, submitting: action.value }

    case 'SET_SUBMIT_RESULT':
      return { ...state, submitResult: action.result, submitting: false }

    default:
      return state
  }
}

export default function useRegistrationForm() {
  const [state, dispatch] = useReducer(reducer, initialState)

  const setTeamName  = useCallback((v) => dispatch({ type: 'SET_TEAM_NAME', value: v }), [])
  const setTeamSize  = useCallback((v) => dispatch({ type: 'SET_TEAM_SIZE', value: v }), [])

  const setParticipantField = useCallback((index, field, value) =>
    dispatch({ type: 'SET_PARTICIPANT_FIELD', index, field, value }), [])

  const touch = useCallback((field) => dispatch({ type: 'TOUCH', field }), [])

  /** Validate the current step. Returns true if valid, moves forward if so. */
  const tryNext = useCallback((focusErrorRef) => {
    dispatch({ type: 'TOUCH_ALL_STEP', step: state.step })

    let errors = {}
    if (state.step === 0) errors = validateTeamStep(state)
    if (state.step === 1) errors = validateParticipantsStep(state, eventConfig)

    if (Object.keys(errors).length > 0) {
      dispatch({ type: 'SET_ERRORS', errors })
      // Move focus to error summary
      setTimeout(() => focusErrorRef?.current?.focus(), 50)
      return false
    }

    dispatch({ type: 'NEXT_STEP' })
    return true
  }, [state])

  const goToStep = useCallback((step) => dispatch({ type: 'GO_TO_STEP', step }), [])

  const setSubmitting   = useCallback((v) => dispatch({ type: 'SET_SUBMITTING', value: v }), [])
  const setSubmitResult = useCallback((r) => dispatch({ type: 'SET_SUBMIT_RESULT', result: r }), [])

  return {
    state,
    setTeamName,
    setTeamSize,
    setParticipantField,
    touch,
    tryNext,
    goToStep,
    setSubmitting,
    setSubmitResult,
  }
}

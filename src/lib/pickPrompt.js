/**
 * pickPrompt.js — shuffle-bag prompt picker.
 *
 * Rules (plan section B, Idea Spark):
 *   • A prompt never repeats until the bag is empty.
 *   • After the bag empties, it refills and a new pick is made — but it is
 *     never the same as the last pick across refills.
 *   • One bag object per category, stored in the caller's ref.
 *
 * Usage:
 *   const bag = createBag(prompts.sustainability.prompts)
 *   const { prompt, bag: nextBag } = pick(bag, lastPrompt)
 */

/** Create a fresh shuffled bag from an array of prompts. */
export function createBag(prompts) {
  return shuffle([...prompts])
}

/** Fisher-Yates shuffle — returns a new array. */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/**
 * Pick the next prompt from the bag.
 * Returns { prompt: string, bag: string[] } — the remaining bag after the pick.
 * If the bag is empty, it is refilled (never returning the same prompt back-to-back).
 *
 * @param {string[]} bag      — current remaining bag
 * @param {string[]} allPrompts — full prompt list for the category (used to refill)
 * @param {string|null} last  — last prompt shown (to avoid back-to-back repeat on refill)
 * @returns {{ prompt: string, bag: string[] }}
 */
export function pick(bag, allPrompts, last = null) {
  let remaining = bag.length > 0 ? bag : shuffle([...allPrompts])

  // If refilled and the first item matches the last shown, rotate it to the end
  if (last !== null && remaining[0] === last && remaining.length > 1) {
    remaining = [...remaining.slice(1), remaining[0]]
  }

  const [prompt, ...rest] = remaining
  return { prompt, bag: rest }
}

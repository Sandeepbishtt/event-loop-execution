/**
 * Normalize user answer lines for comparison.
 * @param {string} input
 * @returns {string[]}
 */
export function normalizeAnswer(input) {
  return input
    .split(/[\n\s,]+/)
    .map((line) => line.trim())
    .filter(Boolean)
}

/**
 * @param {string} userAnswer
 * @param {string[]} expectedOutput
 * @returns {{ correct: boolean, expected: string[], actual: string[], diffLines: string[] }}
 */
export function checkAnswer(userAnswer, expectedOutput) {
  const actual = normalizeAnswer(userAnswer)
  const expected = expectedOutput.map(String)

  const correct =
    actual.length === expected.length &&
    actual.every((line, index) => line === expected[index])

  const diffLines = expected.map((line, index) => {
    const userLine = actual[index]
    if (userLine === line) return `✓ ${line}`
    if (userLine === undefined) return `✗ expected "${line}", got nothing`
    return `✗ expected "${line}", got "${userLine}"`
  })

  if (actual.length > expected.length) {
    for (let i = expected.length; i < actual.length; i += 1) {
      diffLines.push(`✗ extra "${actual[i]}"`)
    }
  }

  return { correct, expected, actual, diffLines }
}

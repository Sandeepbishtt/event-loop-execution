/* eslint-disable preserve-caught-error */
import * as acorn from 'acorn'

/**
 * Parse JavaScript source into an AST.
 * @param {string} source
 * @returns {import('acorn').Program}
 */
export function parseCode(source) {
  if (!source?.trim()) {
    throw new Error('Please paste some JavaScript code.')
  }

  try {
    return acorn.parse(source, {
      ecmaVersion: 'latest',
      sourceType: 'script',
      locations: true,
    })
  } catch (error) {
    throw new Error(`Parse error: ${error.message}`)
  }
}

/**
 * @param {import('acorn').Node} node
 * @returns {number | undefined}
 */
export function getLine(node) {
  return node?.loc?.start?.line
}

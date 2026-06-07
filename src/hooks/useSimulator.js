import { useCallback, useMemo, useState } from 'react'
import { simulate } from '../engine/simulator.js'

/**
 * Run the event-loop simulator against pasted code.
 * @param {string} code
 */
export function useSimulator(code) {
  const [steps, setSteps] = useState([])
  const [output, setOutput] = useState([])
  const [error, setError] = useState(null)
  const [hasRun, setHasRun] = useState(false)

  const run = useCallback(() => {
    try {
      const result = simulate(code)
      setSteps(result.steps)
      setOutput(result.output)
      setError(null)
      setHasRun(true)
      return result
    } catch (err) {
      setSteps([])
      setOutput([])
      setError(err instanceof Error ? err.message : String(err))
      setHasRun(false)
      return null
    }
  }, [code])

  const reset = useCallback(() => {
    setSteps([])
    setOutput([])
    setError(null)
    setHasRun(false)
  }, [])

  return useMemo(
    () => ({ steps, output, error, hasRun, run, reset }),
    [steps, output, error, hasRun, run, reset],
  )
}

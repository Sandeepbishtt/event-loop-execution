import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const SPEEDS = { slow: 2500, normal: 1500, fast: 800 }

/**
 * Step-through playback for execution snapshots.
 * @param {import('../engine/simulator.js').ExecutionStep[]} steps
 * @param {keyof typeof SPEEDS} [speed]
 * @param {'manual'|'auto'} [playbackMode]
 */
export function usePlayback(steps, speed = 'normal', playbackMode = 'manual') {
  const [index, setIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const intervalRef = useRef(null)

  const currentStep = steps[index] ?? null
  const isAtEnd = steps.length > 0 && index >= steps.length - 1

  const stop = useCallback(() => {
    setIsPlaying(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const reset = useCallback(() => {
    stop()
    setIndex(0)
  }, [stop])

  const stepForward = useCallback(() => {
    stop()
    setIndex((prev) => Math.min(prev + 1, Math.max(steps.length - 1, 0)))
  }, [steps.length, stop])

  const stepBack = useCallback(() => {
    stop()
    setIndex((prev) => Math.max(prev - 1, 0))
  }, [stop])

  const play = useCallback(() => {
    if (playbackMode !== 'auto' || steps.length === 0) return
    if (index >= steps.length - 1) {
      setIndex(0)
    }
    setIsPlaying(true)
  }, [playbackMode, index, steps.length])

  const pause = useCallback(() => {
    stop()
  }, [stop])

  useEffect(() => {
    if (playbackMode === 'manual') {
      stop()
    }
  }, [playbackMode, stop])

  useEffect(() => {
    if (!isPlaying || steps.length === 0 || playbackMode !== 'auto') return undefined

    intervalRef.current = setInterval(() => {
      setIndex((prev) => {
        if (prev >= steps.length - 1) {
          stop()
          return prev
        }
        return prev + 1
      })
    }, SPEEDS[speed] ?? SPEEDS.normal)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed, steps.length, playbackMode, stop])

  useEffect(() => {
    reset()
  }, [steps, reset])

  return useMemo(
    () => ({
      index,
      currentStep,
      isPlaying,
      isAtEnd,
      play,
      pause,
      stepForward,
      stepBack,
      reset,
    }),
    [index, currentStep, isPlaying, isAtEnd, play, pause, stepForward, stepBack, reset],
  )
}

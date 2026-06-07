import { useCallback, useState } from 'react'
import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Alert,
} from '@chakra-ui/react'
import { AnswerPanel } from './components/AnswerPanel.jsx'
import { ExecutionWorkspace } from './components/ExecutionWorkspace.jsx'
import { DEFAULT_CODE } from './data/defaultCode.js'
import { useSimulator } from './hooks/useSimulator.js'
import { usePlayback } from './hooks/usePlayback.js'
import { checkAnswer } from './utils/answerChecker.js'

/**
 * Main application for JavaScript event loop learning.
 */
function App() {
  const [code, setCode] = useState(DEFAULT_CODE)
  const [userAnswer, setUserAnswer] = useState('')
  const [submitResult, setSubmitResult] = useState(null)
  const [speed, setSpeed] = useState('slow')
  const [playbackMode, setPlaybackMode] = useState('manual')
  const [isEditing, setIsEditing] = useState(true)

  const { steps, output, error, run, hasRun } = useSimulator(code)
  const playback = usePlayback(steps, speed, playbackMode)

  const handleSubmit = useCallback(() => {
    const result = run()
    if (!result) return

    const checked = checkAnswer(userAnswer, result.output)
    setSubmitResult(checked)
  }, [run, userAnswer])

  const handleVisualize = useCallback(() => {
    setSubmitResult(null)
    setIsEditing(false)
    run()
  }, [run])

  return (
    <Box minH="100vh" bg="gray.950" color="gray.100">
      <Container maxW="container.2xl" py={4}>
        <Box mb={4}>
          <Heading
            as="h1"
            size="lg"
            bgGradient="to-r"
            gradientFrom="cyan.300"
            gradientTo="purple.400"
            bgClip="text"
            mb={1}
          >
            JS Event Loop Visualizer
          </Heading>
          <Text color="gray.400" fontSize="sm">
            Paste your interview question in the code panel. Watch the ▶ pointer track each
            executing line alongside the call stack and queues.
          </Text>
        </Box>

        <Flex as="main" direction="column" gap={3}>
          <ExecutionWorkspace
            code={code}
            onCodeChange={setCode}
            currentStep={playback.currentStep}
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing((v) => !v)}
            hasSteps={hasRun && steps.length > 0}
            playback={playback}
            speed={speed}
            onSpeedChange={setSpeed}
            playbackMode={playbackMode}
            onPlaybackModeChange={setPlaybackMode}
            onVisualize={handleVisualize}
            totalSteps={steps.length}
          />

          {error && (
            <Alert.Root status="error" borderRadius="lg">
              <Alert.Indicator />
              <Alert.Title>{error}</Alert.Title>
            </Alert.Root>
          )}

          <AnswerPanel
            userAnswer={userAnswer}
            onAnswerChange={setUserAnswer}
            onSubmit={handleSubmit}
            result={submitResult}
            expectedOutput={output}
          />
        </Flex>
      </Container>
    </Box>
  )
}

export default App

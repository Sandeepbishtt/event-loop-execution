import PropTypes from 'prop-types'
import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import { CodeViewer } from './CodeViewer.jsx'
import { LearningInsight } from './LearningInsight.jsx'
import { EventLoopVisualizer } from './EventLoopVisualizer/EventLoopVisualizer.jsx'
import { PlaybackControls } from './PlaybackControls.jsx'

/**
 * Side-by-side code + stacks in a single viewport.
 * @param {object} props
 */
export function ExecutionWorkspace({
  code,
  onCodeChange,
  currentStep,
  isEditing,
  onToggleEdit,
  hasSteps,
  playback,
  speed,
  onSpeedChange,
  playbackMode,
  onPlaybackModeChange,
  onVisualize,
  totalSteps,
}) {
  const highlightLine = currentStep?.highlightLine
  const activeStackFrame =
    currentStep?.callStack?.length > 0
      ? currentStep.callStack[currentStep.callStack.length - 1]
      : null

  return (
    <Box
      h={{ base: 'auto', lg: 'calc(100vh - 160px)' }}
      minH={{ base: '640px', lg: '560px' }}
      borderWidth="1px"
      borderColor="gray.700"
      borderRadius="xl"
      overflow="hidden"
      bg="gray.950"
    >
      <Grid
        templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
        h="100%"
        gap={0}
      >
        {/* Code panel */}
        <Flex
          direction="column"
          p={4}
          borderRightWidth={{ lg: '1px' }}
          borderColor="gray.700"
          minH="0"
          overflow="hidden"
        >
          <Text fontWeight="semibold" color="gray.200" mb={2} flexShrink={0}>
            Source Code
          </Text>
          <Box flex={1} minH="0" overflow="hidden">
            <CodeViewer
              code={code}
              onChange={onCodeChange}
              highlightLine={highlightLine}
              activeStackFrame={highlightLine ? activeStackFrame : null}
              isEditing={isEditing}
              onToggleEdit={onToggleEdit}
              hasSteps={hasSteps}
            />
          </Box>
          <Box mt={3}>
            <LearningInsight insight={currentStep?.insight} phase={currentStep?.phase} />
          </Box>
        </Flex>

        {/* Visualizer panel */}
        <Flex direction="column" p={4} minH="0" overflow="hidden" gap={3}>
          <Text fontWeight="semibold" color="gray.200" flexShrink={0}>
            Event Loop
          </Text>

          <Box flexShrink={0}>
            <PlaybackControls
              onVisualize={onVisualize}
              onStepBack={playback.stepBack}
              onStepForward={playback.stepForward}
              onPlay={playback.play}
              onPause={playback.pause}
              onReset={playback.reset}
              isPlaying={playback.isPlaying}
              stepIndex={playback.index}
              totalSteps={totalSteps}
              speed={speed}
              onSpeedChange={onSpeedChange}
              playbackMode={playbackMode}
              onPlaybackModeChange={onPlaybackModeChange}
            />
          </Box>

          <Box flex={1} minH="0" overflowY="auto">
            <EventLoopVisualizer step={currentStep} compact />
          </Box>
        </Flex>
      </Grid>
    </Box>
  )
}

ExecutionWorkspace.propTypes = {
  code: PropTypes.string.isRequired,
  onCodeChange: PropTypes.func.isRequired,
  currentStep: PropTypes.object,
  isEditing: PropTypes.bool.isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  hasSteps: PropTypes.bool,
  playback: PropTypes.shape({
    stepBack: PropTypes.func.isRequired,
    stepForward: PropTypes.func.isRequired,
    play: PropTypes.func.isRequired,
    pause: PropTypes.func.isRequired,
    reset: PropTypes.func.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,
  }).isRequired,
  speed: PropTypes.string.isRequired,
  onSpeedChange: PropTypes.func.isRequired,
  playbackMode: PropTypes.oneOf(['manual', 'auto']).isRequired,
  onPlaybackModeChange: PropTypes.func.isRequired,
  onVisualize: PropTypes.func.isRequired,
  totalSteps: PropTypes.number.isRequired,
}

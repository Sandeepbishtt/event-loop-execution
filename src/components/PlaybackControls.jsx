import PropTypes from 'prop-types'
import { Box, Button, Flex, NativeSelect, Text } from '@chakra-ui/react'

const transportButtonProps = {
  size: 'sm',
  minW: '36px',
  h: '36px',
  fontSize: 'md',
  borderRadius: 'md',
  color: 'gray.100',
  bg: 'gray.700',
  borderWidth: '1px',
  borderColor: 'gray.500',
  flexShrink: 0,
  _hover: {
    bg: 'gray.600',
    borderColor: 'cyan.400',
    color: 'cyan.200',
  },
  _disabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
    bg: 'gray.800',
    borderColor: 'gray.700',
    color: 'gray.500',
    _hover: { bg: 'gray.800', borderColor: 'gray.700', color: 'gray.500' },
  },
}

/**
 * Playback controls for step-by-step visualization — single-row toolbar.
 * @param {object} props
 */
export function PlaybackControls({
  onVisualize,
  onStepBack,
  onStepForward,
  onPlay,
  onPause,
  onReset,
  isPlaying,
  stepIndex,
  totalSteps,
  speed,
  onSpeedChange,
  playbackMode,
  onPlaybackModeChange,
  disabled,
}) {
  const isManual = playbackMode === 'manual'
  const isAuto = playbackMode === 'auto'

  return (
    <Flex
      align="center"
      gap={2}
      flexWrap="nowrap"
      overflowX="auto"
      py={1}
      css={{
        '&::-webkit-scrollbar': { height: '4px' },
        '&::-webkit-scrollbar-thumb': { background: '#4A5568', borderRadius: '4px' },
      }}
    >
      <Button
        colorPalette="purple"
        onClick={onVisualize}
        disabled={disabled}
        size="sm"
        fontWeight="semibold"
        flexShrink={0}
      >
        Visualize
      </Button>

      <Box w="1px" h="28px" bg="gray.600" flexShrink={0} aria-hidden="true" />

      <Flex
        role="group"
        aria-label="Execution mode"
        gap={0}
        borderRadius="lg"
        overflow="hidden"
        borderWidth="1px"
        borderColor="gray.600"
        flexShrink={0}
      >
        <Button
          size="sm"
          h="36px"
          borderRadius={0}
          fontSize="xs"
          fontWeight="semibold"
          colorPalette={isManual ? 'cyan' : 'gray'}
          variant={isManual ? 'solid' : 'ghost'}
          onClick={() => onPlaybackModeChange('manual')}
          aria-pressed={isManual}
        >
          Manual
        </Button>
        <Button
          size="sm"
          h="36px"
          borderRadius={0}
          fontSize="xs"
          fontWeight="semibold"
          colorPalette={isAuto ? 'cyan' : 'gray'}
          variant={isAuto ? 'solid' : 'ghost'}
          onClick={() => onPlaybackModeChange('auto')}
          aria-pressed={isAuto}
        >
          Auto
        </Button>
      </Flex>

      <Box w="1px" h="28px" bg="gray.600" flexShrink={0} aria-hidden="true" />

      <Flex
        as="section"
        aria-label="Playback transport controls"
        align="center"
        gap={1.5}
        px={2}
        py={1}
        borderRadius="lg"
        bg="gray.800"
        borderWidth="1px"
        borderColor="gray.600"
        flexShrink={0}
      >
        {isManual && (
          <>
            <Button
              {...transportButtonProps}
              onClick={onStepBack}
              disabled={stepIndex <= 0}
              aria-label="Step back"
              title="Step back"
            >
              ⏮
            </Button>
            <Button
              {...transportButtonProps}
              onClick={onStepForward}
              disabled={totalSteps === 0 || stepIndex >= totalSteps - 1}
              aria-label="Step forward"
              title="Step forward"
            >
              ⏭
            </Button>
          </>
        )}

        {isAuto && (
          <>
            {isPlaying ? (
              <Button
                {...transportButtonProps}
                onClick={onPause}
                aria-label="Pause"
                title="Pause"
                minW="40px"
                bg="cyan.600"
                borderColor="cyan.400"
                color="white"
                _hover={{ bg: 'cyan.500', borderColor: 'cyan.300', color: 'white' }}
              >
                ⏸
              </Button>
            ) : (
              <Button
                {...transportButtonProps}
                onClick={onPlay}
                disabled={totalSteps === 0}
                aria-label="Play"
                title="Play"
                minW="40px"
                bg="cyan.600"
                borderColor="cyan.400"
                color="white"
                _hover={{ bg: 'cyan.500', borderColor: 'cyan.300', color: 'white' }}
                _disabled={{
                  opacity: 0.35,
                  cursor: 'not-allowed',
                  bg: 'gray.800',
                  borderColor: 'gray.700',
                  color: 'gray.500',
                }}
              >
                ▶
              </Button>
            )}
          </>
        )}

        <Box w="1px" h="24px" bg="gray.600" mx={0.5} aria-hidden="true" />

        <Button
          {...transportButtonProps}
          onClick={onReset}
          disabled={totalSteps === 0}
          aria-label="Reset playback"
          title="Reset"
          fontSize="xs"
          fontWeight="semibold"
          minW="48px"
        >
          Reset
        </Button>
      </Flex>

      {isAuto && (
        <>
          <Box w="1px" h="28px" bg="gray.600" flexShrink={0} aria-hidden="true" />

          <Flex
            align="center"
            gap={2}
            px={2}
            py={1}
            borderRadius="lg"
            bg="gray.800"
            borderWidth="1px"
            borderColor="gray.600"
            flexShrink={0}
          >
            <Text fontSize="xs" color="gray.400" fontWeight="medium" whiteSpace="nowrap">
              Speed
            </Text>
            <NativeSelect.Root size="sm" width="88px">
              <NativeSelect.Field
                value={speed}
                onChange={(e) => onSpeedChange(e.target.value)}
                aria-label="Playback speed"
                bg="gray.700"
                borderColor="gray.500"
                color="gray.100"
                fontSize="xs"
                _focus={{ borderColor: 'cyan.400' }}
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </NativeSelect.Field>
            </NativeSelect.Root>
          </Flex>
        </>
      )}

      {totalSteps > 0 && (
        <Text
          fontSize="xs"
          color="gray.400"
          fontFamily="mono"
          whiteSpace="nowrap"
          flexShrink={0}
          ml="auto"
        >
          Step {stepIndex + 1}/{totalSteps}
        </Text>
      )}
    </Flex>
  )
}

PlaybackControls.propTypes = {
  onVisualize: PropTypes.func.isRequired,
  onStepBack: PropTypes.func.isRequired,
  onStepForward: PropTypes.func.isRequired,
  onPlay: PropTypes.func.isRequired,
  onPause: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  isPlaying: PropTypes.bool.isRequired,
  stepIndex: PropTypes.number.isRequired,
  totalSteps: PropTypes.number.isRequired,
  speed: PropTypes.string.isRequired,
  onSpeedChange: PropTypes.func.isRequired,
  playbackMode: PropTypes.oneOf(['manual', 'auto']).isRequired,
  onPlaybackModeChange: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
}

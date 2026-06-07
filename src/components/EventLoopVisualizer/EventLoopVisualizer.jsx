import PropTypes from 'prop-types'
import { Box, Flex, Grid, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { StackPanel } from './StackPanel.jsx'
import { ConsoleOutput } from './ConsoleOutput.jsx'

const MotionBox = motion.create(Box)

/**
 * Main event loop visualization with call stack, queues, and console.
 * @param {{ step: object | null, compact?: boolean }} props
 */
export function EventLoopVisualizer({ step, compact = false }) {
  const phase = step?.phase ?? 'sync'
  const description = step?.description ?? 'Press "Visualize Execution" to begin'

  return (
    <Box>
      <MotionBox
        key={description}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        mb={3}
        px={3}
        py={2}
        borderRadius="lg"
        bg="purple.950"
        borderWidth="1px"
        borderColor="purple.700"
      >
        <Flex align="center" gap={2} flexWrap="wrap">
          <Box
            px={2}
            py={0.5}
            borderRadius="md"
            bg="purple.800"
            fontSize="xs"
            fontWeight="bold"
            color="purple.200"
            textTransform="uppercase"
            flexShrink={0}
          >
            {phase}
          </Box>
          <Text fontSize="xs" color="gray.200" lineHeight="1.4">
            {description}
          </Text>
        </Flex>
      </MotionBox>

      <Grid
        templateColumns={compact ? '1fr 1fr' : { base: '1fr', md: '1fr 1fr', lg: 'repeat(5, 1fr)' }}
        gap={2}
      >
        <StackPanel
          title="Call Stack"
          items={step?.callStack ?? []}
          color="orange"
          emptyLabel="Empty"
          highlightTop
        />
        <StackPanel
          title="Microtask Queue"
          items={step?.microtaskQueue ?? []}
          color="cyan"
          emptyLabel="Empty"
        />
        <StackPanel
          title="Macrotask Queue"
          items={step?.macrotaskQueue ?? []}
          color="pink"
          emptyLabel="Empty"
        />
        <StackPanel
          title="Web APIs"
          items={(step?.webApis ?? []).map((t) => t.label)}
          color="yellow"
          emptyLabel="Empty"
        />
        <Box gridColumn={compact ? '1 / -1' : undefined}>
          <ConsoleOutput output={step?.consoleOutput ?? []} compact={compact} />
        </Box>
      </Grid>
    </Box>
  )
}

EventLoopVisualizer.propTypes = {
  step: PropTypes.shape({
    phase: PropTypes.string,
    description: PropTypes.string,
    callStack: PropTypes.arrayOf(PropTypes.string),
    microtaskQueue: PropTypes.arrayOf(PropTypes.string),
    macrotaskQueue: PropTypes.arrayOf(PropTypes.string),
    webApis: PropTypes.arrayOf(PropTypes.shape({ label: PropTypes.string })),
    consoleOutput: PropTypes.arrayOf(PropTypes.string),
  }),
  compact: PropTypes.bool,
}

import PropTypes from 'prop-types'
import { Box, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'

const MotionText = motion.create(Text)

/**
 * Console output panel with live region for accessibility.
 * @param {{ output: string[] }} props
 */
export function ConsoleOutput({ output, compact = false }) {
  return (
    <Box
      as="section"
      aria-label="Console output"
      aria-live="polite"
      flex={1}
      minW="140px"
      p={compact ? 3 : 4}
      borderRadius="xl"
      borderWidth="1px"
      borderColor="gray.700"
      bg="gray.950"
    >
      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.400" mb={3}>
        Console
      </Text>

      <VStack align="stretch" gap={1} minH={compact ? '60px' : '160px'} fontFamily="mono" fontSize="sm">
        <AnimatePresence>
          {output.length === 0 ? (
            <Text fontSize="xs" color="gray.600" fontStyle="italic">
              No output yet
            </Text>
          ) : (
            output.map((line, i) => (
              <MotionText
                key={`${line}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                color="green.300"
              >
                {line}
              </MotionText>
            ))
          )}
        </AnimatePresence>
      </VStack>
    </Box>
  )
}

ConsoleOutput.propTypes = {
  output: PropTypes.arrayOf(PropTypes.string).isRequired,
  compact: PropTypes.bool,
}

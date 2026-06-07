import PropTypes from 'prop-types'
import { Box, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)

/**
 * Explains the tricky "why" behind the current execution step.
 * @param {{ insight?: string, phase?: string }} props
 */
export function LearningInsight({ insight, phase }) {
  if (!insight) {
    return (
      <Box
        p={3}
        borderRadius="lg"
        bg="gray.900"
        borderWidth="1px"
        borderColor="gray.800"
        flexShrink={0}
      >
        <Text fontSize="xs" color="gray.500">
          Step through execution to see why each line runs when it does.
        </Text>
      </Box>
    )
  }

  return (
    <MotionBox
      key={insight}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      p={3}
      borderRadius="lg"
      bg="blue.950"
      borderWidth="1px"
      borderColor="blue.700"
      flexShrink={0}
    >
      <Text fontSize="xs" fontWeight="bold" color="blue.300" mb={1} textTransform="uppercase">
        Why? {phase && `(${phase})`}
      </Text>
      <Text fontSize="sm" color="blue.100" lineHeight="1.5">
        {insight}
      </Text>
    </MotionBox>
  )
}

LearningInsight.propTypes = {
  insight: PropTypes.string,
  phase: PropTypes.string,
}

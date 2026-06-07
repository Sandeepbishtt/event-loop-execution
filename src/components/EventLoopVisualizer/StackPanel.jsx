import PropTypes from 'prop-types'
import { Box, Text, VStack } from '@chakra-ui/react'
import { AnimatePresence, motion } from 'framer-motion'

const MotionBox = motion.create(Box)

/**
 * Animated vertical stack panel (call stack or queue).
 * @param {{ title: string, items: string[], color: string, emptyLabel: string, highlightTop?: boolean }} props
 */
export function StackPanel({ title, items, color, emptyLabel, highlightTop = false }) {
  const displayItems = [...items].reverse()

  return (
    <Box
      as="section"
      aria-label={title}
      p={3}
      borderRadius="lg"
      borderWidth="1px"
      borderColor="gray.700"
      bg="gray.900"
      minH="120px"
    >
      <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.400" mb={2}>
        {title}
      </Text>

      <VStack gap={1.5} align="stretch" justify="flex-end" minH="90px">
        <AnimatePresence mode="popLayout">
          {items.length === 0 ? (
            <Text fontSize="xs" color="gray.600" fontStyle="italic">
              {emptyLabel}
            </Text>
          ) : (
            displayItems.map((item, i) => {
              const isTop = highlightTop && i === 0
              return (
                <MotionBox
                  key={`${item}-${items.length - i}`}
                  layout
                  initial={{ opacity: 0, x: -16, scale: 0.92 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 16, scale: 0.92 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  px={2}
                  py={1.5}
                  borderRadius="md"
                  bg={isTop ? `${color}.800` : `${color}.950`}
                  borderWidth="2px"
                  borderColor={isTop ? `${color}.400` : `${color}.700`}
                  boxShadow={isTop ? '0 0 8px rgba(251, 146, 60, 0.35)' : 'none'}
                >
                  <Text fontSize="xs" fontFamily="mono" color={`${color}.200`} noOfLines={2}>
                    {isTop && '▶ '}
                    {item}
                  </Text>
                </MotionBox>
              )
            })
          )}
        </AnimatePresence>
      </VStack>
    </Box>
  )
}

StackPanel.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
  color: PropTypes.string.isRequired,
  emptyLabel: PropTypes.string.isRequired,
  highlightTop: PropTypes.bool,
}

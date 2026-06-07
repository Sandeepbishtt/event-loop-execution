import { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { Box, Button, Flex, Text, Textarea } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionBox = motion.create(Box)

/**
 * Line-by-line code view with execution pointer, or edit mode.
 * @param {object} props
 */
export function CodeViewer({
  code,
  onChange,
  highlightLine,
  activeStackFrame,
  isEditing,
  onToggleEdit,
  hasSteps,
}) {
  const lines = code.split('\n')
  const scrollRef = useRef(null)
  const activeLineRef = useRef(null)
  const isOnStack = Boolean(highlightLine && activeStackFrame)

  useEffect(() => {
    if (highlightLine && activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' })
    }
  }, [highlightLine])

  if (isEditing) {
    return (
      <Box h="100%" display="flex" flexDirection="column">
        <Flex justify="flex-end" mb={2}>
          <Button size="xs" variant="outline" onClick={onToggleEdit}>
            Done editing
          </Button>
        </Flex>
        <Textarea
          value={code}
          onChange={(e) => onChange(e.target.value)}
          aria-label="JavaScript code input"
          flex={1}
          minH="0"
          bg="gray.900"
          borderColor="gray.600"
          color="gray.100"
          fontFamily="mono"
          fontSize="sm"
          lineHeight="1.6"
          resize="none"
          spellCheck={false}
        />
      </Box>
    )
  }

  return (
    <Box h="100%" display="flex" flexDirection="column" minH="0">
      <Flex justify="space-between" align="center" mb={2} flexShrink={0}>
        <Text fontSize="xs" color="gray.400" fontWeight="medium">
          {hasSteps ? '▶ = currently executing line' : 'Paste your question, then visualize'}
        </Text>
        <Button size="xs" variant="ghost" color="cyan.300" onClick={onToggleEdit}>
          Edit code
        </Button>
      </Flex>

      <Box
        ref={scrollRef}
        flex={1}
        minH="0"
        overflowY="auto"
        borderWidth="1px"
        borderColor="gray.700"
        borderRadius="lg"
        bg="gray.900"
        fontFamily="mono"
        fontSize="sm"
        role="region"
        aria-label="JavaScript source code"
      >
        {lines.map((lineText, i) => {
          const lineNum = i + 1
          const isActive = highlightLine === lineNum

          return (
            <MotionBox
              key={lineNum}
              ref={isActive ? activeLineRef : undefined}
              display="grid"
              gridTemplateColumns="32px 28px 1fr"
              alignItems="stretch"
              lineHeight="1.6"
              animate={{
                backgroundColor: isActive ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              }}
              borderLeftWidth={isActive ? '3px' : '3px'}
              borderLeftColor={isActive ? 'cyan.400' : 'transparent'}
            >
              <Text
                px={2}
                py={0.5}
                textAlign="right"
                color={isActive ? 'cyan.300' : 'gray.600'}
                fontWeight={isActive ? 'bold' : 'normal'}
                userSelect="none"
                aria-hidden="true"
              >
                {lineNum}
              </Text>

              <Flex align="center" justify="center" aria-hidden="true">
                {isActive && (
                  <MotionBox
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    color="cyan.300"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    ▶
                  </MotionBox>
                )}
              </Flex>

              <Text
                px={2}
                py={0.5}
                color={isActive ? 'white' : 'gray.300'}
                fontWeight={isActive ? 'semibold' : 'normal'}
                whiteSpace="pre"
              >
                {lineText || ' '}
              </Text>
            </MotionBox>
          )
        })}
      </Box>

      {isOnStack && (
        <Box
          mt={2}
          px={3}
          py={2}
          borderRadius="md"
          bg="orange.950"
          borderWidth="1px"
          borderColor="orange.700"
          flexShrink={0}
        >
          <Text fontSize="xs" color="orange.200">
            On call stack:{' '}
            <Text as="span" fontFamily="mono" fontWeight="bold">
              {activeStackFrame}
            </Text>
          </Text>
        </Box>
      )}
    </Box>
  )
}

CodeViewer.propTypes = {
  code: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  highlightLine: PropTypes.number,
  activeStackFrame: PropTypes.string,
  isEditing: PropTypes.bool.isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  hasSteps: PropTypes.bool,
}

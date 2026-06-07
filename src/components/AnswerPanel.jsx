import PropTypes from 'prop-types'
import {
  Badge,
  Box,
  Button,
  HStack,
  Text,
  Textarea,
  VStack,
} from '@chakra-ui/react'

/**
 * User answer input and submission feedback.
 * @param {object} props
 */
export function AnswerPanel({
  userAnswer,
  onAnswerChange,
  onSubmit,
  result,
  expectedOutput,
}) {
  return (
    <VStack align="stretch" gap={3}>
      <HStack justify="space-between">
        <Text fontWeight="semibold" color="gray.200">
          Your predicted output
        </Text>
        <Text fontSize="xs" color="gray.500">
          Separate values with spaces or new lines
        </Text>
      </HStack>

      <Textarea
        value={userAnswer}
        onChange={(e) => onAnswerChange(e.target.value)}
        placeholder="e.g. 1 2 3 4 7 5 6 9 8"
        aria-label="Your predicted console output"
        bg="gray.900"
        borderColor="gray.700"
        color="gray.100"
        minH="80px"
        fontFamily="mono"
        _focus={{ borderColor: 'cyan.400' }}
      />

      <Button colorPalette="cyan" onClick={onSubmit} alignSelf="flex-start">
        Submit Answer
      </Button>

      {result && (
        <Box
          p={4}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={result.correct ? 'green.600' : 'red.600'}
          bg={result.correct ? 'green.950' : 'red.950'}
        >
          <HStack mb={2}>
            <Badge colorPalette={result.correct ? 'green' : 'red'}>
              {result.correct ? 'Correct' : 'Incorrect'}
            </Badge>
            <Text fontSize="sm" color="gray.300">
              Expected: {expectedOutput.join(' ')}
            </Text>
          </HStack>

          {!result.correct && (
            <VStack align="stretch" gap={1} fontFamily="mono" fontSize="sm">
              {result.diffLines.map((line) => (
                <Text key={line} color="gray.300">
                  {line}
                </Text>
              ))}
            </VStack>
          )}

        </Box>
      )}
    </VStack>
  )
}

AnswerPanel.propTypes = {
  userAnswer: PropTypes.string.isRequired,
  onAnswerChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  result: PropTypes.shape({
    correct: PropTypes.bool,
    diffLines: PropTypes.arrayOf(PropTypes.string),
  }),
  expectedOutput: PropTypes.arrayOf(PropTypes.string),
}

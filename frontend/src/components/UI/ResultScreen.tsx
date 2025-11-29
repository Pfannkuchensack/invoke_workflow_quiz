import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Card,
  CardBody,
} from '@chakra-ui/react';
import { useQuizStore } from '../../store/quizStore';

export function ResultScreen() {
  const {
    currentQuiz,
    hintsUsed,
    lastValidationResult,
    resetQuiz,
  } = useQuizStore();

  return (
    <Container maxW="container.md" py={20}>
      <VStack spacing={8}>
        <Heading size="2xl" textAlign="center">
          Quiz Complete!
        </Heading>

        <Card bg="gray.800" w="full">
          <CardBody>
            <VStack spacing={6}>
              <Text fontSize="xl" fontWeight="bold">
                {currentQuiz?.name}
              </Text>

              <StatGroup w="full">
                <Stat textAlign="center">
                  <StatLabel>Correct Edges</StatLabel>
                  <StatNumber color="green.400">
                    {lastValidationResult?.correctEdges || 0}/
                    {lastValidationResult?.totalEdges || 0}
                  </StatNumber>
                </Stat>

                <Stat textAlign="center">
                  <StatLabel>Hints Used</StatLabel>
                  <StatNumber color={hintsUsed > 0 ? 'yellow.400' : 'green.400'}>
                    {hintsUsed}
                  </StatNumber>
                </Stat>
              </StatGroup>

              {/* Score calculation */}
              <Box textAlign="center" pt={4}>
                <Text fontSize="sm" color="gray.500">
                  Score
                </Text>
                <Text fontSize="4xl" fontWeight="bold" color="blue.400">
                  {calculateScore(
                    lastValidationResult?.correctEdges || 0,
                    lastValidationResult?.totalEdges || 1,
                    hintsUsed
                  )}
                </Text>
              </Box>
            </VStack>
          </CardBody>
        </Card>

        <Button colorScheme="blue" size="lg" onClick={resetQuiz}>
          Back to Quiz Selection
        </Button>
      </VStack>
    </Container>
  );
}

function calculateScore(
  correctEdges: number,
  totalEdges: number,
  hintsUsed: number
): number {
  // Base score: 100 points per correct edge
  const baseScore = correctEdges * 100;

  // Hint penalty: -20 points per hint
  const hintPenalty = hintsUsed * 20;

  // Completion bonus: 200 points if all edges correct
  const completionBonus = correctEdges === totalEdges ? 200 : 0;

  return Math.max(0, baseScore - hintPenalty + completionBonus);
}

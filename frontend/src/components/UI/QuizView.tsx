import {
  Box,
  HStack,
  VStack,
  Button,
  Text,
  Progress,
  useToast,
} from '@chakra-ui/react';
import { useQuizStore } from '../../store/quizStore';
import { apiFetch } from '../../utils/api';
import { QuizCanvas } from '../QuizCanvas/QuizCanvas';
import type { ValidateQuizResponse } from '../../types';

export function QuizView() {
  const {
    currentQuiz,
    playerEdges,
    playerNodes,
    hintsUsed,
    isValidating,
    lastValidationResult,
    setValidating,
    setValidationResult,
    incrementHints,
    completeQuiz,
    resetQuiz,
    clearPlayerEdges,
    clearPlayerNodes,
  } = useQuizStore();

  const handleClear = () => {
    clearPlayerEdges();
    clearPlayerNodes();
  };
  const toast = useToast();

  if (!currentQuiz) {
    return null;
  }

  const handleValidate = async () => {
    setValidating(true);
    try {
      // Send all edges along with player node mappings
      // The backend will resolve player-node IDs to hidden node IDs based on type
      const response = await apiFetch(`/quizzes/${currentQuiz.id}/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposedEdges: playerEdges,
          playerNodeMappings: playerNodes,
        }),
      });

      const result: ValidateQuizResponse = await response.json();
      setValidationResult(result);

      if (result.completed) {
        toast({
          title: 'Congratulations!',
          description: 'You completed the quiz!',
          status: 'success',
          duration: 3000,
        });
        setTimeout(() => completeQuiz(), 1500);
      } else if (result.correctEdges === result.totalEdges) {
        toast({
          title: 'All correct!',
          description: 'But there are some extra edges that are not needed.',
          status: 'warning',
          duration: 3000,
        });
      } else {
        toast({
          title: `${result.correctEdges}/${result.totalEdges} correct`,
          description: 'Keep trying!',
          status: 'info',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Validation failed',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setValidating(false);
    }
  };

  const handleHint = async () => {
    try {
      const response = await apiFetch(`/quizzes/${currentQuiz.id}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ connectedEdgeIds: playerEdges.map((e) => e.id) }),
      });

      const data = await response.json();

      if (data.hint) {
        incrementHints();
        toast({
          title: 'Hint',
          description: `Connect "${data.hint.sourceFieldName}" from "${data.hint.sourceNodeLabel}" to "${data.hint.targetFieldName}" on "${data.hint.targetNodeLabel}"`,
          status: 'info',
          duration: 10000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'No more hints',
          description: 'All edges have been connected!',
          status: 'info',
          duration: 3000,
        });
      }
    } catch (error) {
      toast({
        title: 'Failed to get hint',
        status: 'error',
        duration: 3000,
      });
    }
  };

  // Count all edges for progress (backend will handle type mapping)
  const progressPercent = lastValidationResult
    ? (lastValidationResult.correctEdges / lastValidationResult.totalEdges) * 100
    : (playerEdges.length / currentQuiz.hiddenEdgeCount) * 100;

  return (
    <Box h="100vh" display="flex" flexDirection="column">
      {/* Header */}
      <HStack
        p={4}
        bg="gray.800"
        borderBottom="1px"
        borderColor="gray.700"
        justify="space-between"
      >
        <VStack align="start" spacing={0}>
          <Text fontWeight="bold" fontSize="lg">
            {currentQuiz.name}
          </Text>
          <Text fontSize="sm" color="gray.400">
            Connect {currentQuiz.hiddenEdgeCount} missing edges
          </Text>
        </VStack>

        <HStack spacing={4}>
          <VStack spacing={1} align="center">
            <Text fontSize="xs" color="gray.500">
              Progress
            </Text>
            <HStack>
              <Progress
                value={progressPercent}
                size="sm"
                colorScheme="blue"
                w="100px"
                borderRadius="full"
              />
              <Text fontSize="sm">
                {playerEdges.length}/{currentQuiz.hiddenEdgeCount}
              </Text>
            </HStack>
          </VStack>

          <VStack spacing={1} align="center">
            <Text fontSize="xs" color="gray.500">
              Hints Used
            </Text>
            <Text fontSize="sm">{hintsUsed}</Text>
          </VStack>

          <Button size="sm" onClick={handleHint}>
            Get Hint
          </Button>

          <Button
            size="sm"
            colorScheme="blue"
            onClick={handleValidate}
            isLoading={isValidating}
          >
            Validate
          </Button>

          <Button size="sm" variant="outline" onClick={handleClear}>
            Clear
          </Button>

          <Button size="sm" variant="ghost" colorScheme="red" onClick={resetQuiz}>
            Exit
          </Button>
        </HStack>
      </HStack>

      {/* Canvas */}
      <Box flex={1}>
        <QuizCanvas />
      </Box>
    </Box>
  );
}

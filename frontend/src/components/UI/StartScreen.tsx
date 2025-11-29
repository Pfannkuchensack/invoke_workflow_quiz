import { useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Badge,
  Button,
  Spinner,
  useToast,
} from '@chakra-ui/react';
import { useQuizStore } from '../../store/quizStore';
import { apiFetch } from '../../utils/api';
import type { QuizMetadata, QuizWorkflow } from '../../types';

const difficultyColors: Record<string, string> = {
  easy: 'green',
  medium: 'yellow',
  hard: 'red',
};

export function StartScreen() {
  const { availableQuizzes, setAvailableQuizzes, loadQuiz, progress } = useQuizStore();
  const toast = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await apiFetch('/quizzes');
      const data = await response.json();
      setAvailableQuizzes(data.quizzes);
    } catch (error) {
      toast({
        title: 'Failed to load quizzes',
        description: 'Please make sure the backend is running.',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleStartQuiz = async (quizId: string) => {
    try {
      const response = await apiFetch(`/quizzes/${quizId}`);
      const data = await response.json();
      loadQuiz(data.quiz as QuizWorkflow);
    } catch (error) {
      toast({
        title: 'Failed to load quiz',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const isCompleted = (quizId: string) => progress.completedQuizzes.includes(quizId);

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="2xl" mb={4}>
            Workflow Quiz
          </Heading>
          <Text fontSize="lg" color="gray.400">
            Learn InvokeAI workflows by connecting the missing edges!
          </Text>
        </Box>

        {availableQuizzes.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading quizzes...</Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {availableQuizzes.map((quiz: QuizMetadata) => (
              <Card
                key={quiz.id}
                bg="gray.800"
                borderColor={isCompleted(quiz.id) ? 'green.500' : 'gray.700'}
                borderWidth={2}
              >
                <CardHeader pb={2}>
                  <Heading size="md">{quiz.name}</Heading>
                  <Badge colorScheme={difficultyColors[quiz.difficulty]} mt={2}>
                    {quiz.difficulty}
                  </Badge>
                  {isCompleted(quiz.id) && (
                    <Badge colorScheme="green" ml={2}>
                      Completed
                    </Badge>
                  )}
                </CardHeader>
                <CardBody>
                  <Text color="gray.400" mb={4}>
                    {quiz.description}
                  </Text>
                  <Text fontSize="sm" color="gray.500" mb={4}>
                    {quiz.hiddenEdgeCount} edges to connect
                  </Text>
                  <Button
                    colorScheme="blue"
                    width="full"
                    onClick={() => handleStartQuiz(quiz.id)}
                  >
                    {isCompleted(quiz.id) ? 'Play Again' : 'Start Quiz'}
                  </Button>
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        )}

        {progress.completedQuizzes.length > 0 && (
          <Box textAlign="center" pt={4}>
            <Text color="gray.500">
              Completed: {progress.completedQuizzes.length} / {availableQuizzes.length} quizzes
            </Text>
          </Box>
        )}
      </VStack>
    </Container>
  );
}

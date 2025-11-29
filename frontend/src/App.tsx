import { Box } from '@chakra-ui/react';
import { useQuizStore } from './store/quizStore';
import { StartScreen } from './components/UI/StartScreen';
import { QuizView } from './components/UI/QuizView';
import { ResultScreen } from './components/UI/ResultScreen';

function App() {
  const { currentView } = useQuizStore();

  return (
    <Box minH="100vh" bg="gray.900">
      {currentView === 'start' && <StartScreen />}
      {currentView === 'quiz' && <QuizView />}
      {currentView === 'result' && <ResultScreen />}
    </Box>
  );
}

export default App;

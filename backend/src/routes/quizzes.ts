import { Router, type IRouter } from 'express';
import { QuizService } from '../services/quizService.js';
import { ValidationService } from '../services/validationService.js';
import type { ValidateEdgeRequest, ValidateQuizRequest } from '../types/index.js';

const router: IRouter = Router();
const quizService = new QuizService();
const validationService = new ValidationService();

// GET /api/quizzes - List all available quizzes
router.get('/', (req, res) => {
  try {
    const quizzes = quizService.listQuizzes();
    res.json({ quizzes });
  } catch (error) {
    res.status(500).json({ error: 'Failed to list quizzes' });
  }
});

// GET /api/quizzes/:id - Get a specific quiz (with hidden edges removed)
router.get('/:id', (req, res) => {
  try {
    const quiz = quizService.getQuiz(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }
    res.json({ quiz });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get quiz' });
  }
});

// POST /api/quizzes/:id/check-edge - Check if a single edge is valid
router.post('/:id/check-edge', (req, res) => {
  try {
    const quiz = quizService.getQuizFull(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const edgeRequest: ValidateEdgeRequest = req.body;
    const result = validationService.validateSingleEdge(
      quiz.workflow,
      quiz.nodeSchemas,
      edgeRequest
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate edge' });
  }
});

// POST /api/quizzes/:id/validate - Validate all proposed edges
router.post('/:id/validate', (req, res) => {
  try {
    const quiz = quizService.getQuizFull(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const validateRequest: ValidateQuizRequest = req.body;
    const result = validationService.validateQuiz(
      quiz,
      validateRequest.proposedEdges,
      validateRequest.playerNodeMappings
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate quiz' });
  }
});

// POST /api/quizzes/:id/hint - Get a hint for the next edge
router.post('/:id/hint', (req, res) => {
  try {
    const quiz = quizService.getQuizFull(req.params.id);
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const { connectedEdgeIds } = req.body as { connectedEdgeIds: string[] };
    const hint = quizService.getHint(quiz, connectedEdgeIds || []);

    res.json({ hint });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get hint' });
  }
});

export { router as quizRoutes };

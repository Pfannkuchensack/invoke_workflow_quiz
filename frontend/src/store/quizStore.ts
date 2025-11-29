import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  QuizWorkflow,
  QuizMetadata,
  WorkflowEdgeDefault,
  GameProgress,
} from '../types';

type View = 'start' | 'quiz' | 'result';

// Track player-added nodes with their types for validation
export interface PlayerNodeInfo {
  id: string;
  nodeType: string;
}

interface QuizState {
  // UI State
  currentView: View;

  // Quiz Data
  availableQuizzes: QuizMetadata[];
  currentQuiz: QuizWorkflow | null;

  // Game State
  playerEdges: WorkflowEdgeDefault[];
  playerNodes: PlayerNodeInfo[]; // Track player-added nodes
  hintsUsed: number;
  isValidating: boolean;
  lastValidationResult: {
    valid: boolean;
    correctEdges: number;
    totalEdges: number;
    completed: boolean;
  } | null;

  // Progress (persisted)
  progress: GameProgress;

  // Actions
  setView: (view: View) => void;
  setAvailableQuizzes: (quizzes: QuizMetadata[]) => void;
  loadQuiz: (quiz: QuizWorkflow) => void;
  addPlayerEdge: (edge: WorkflowEdgeDefault) => void;
  removePlayerEdge: (edgeId: string) => void;
  clearPlayerEdges: () => void;
  addPlayerNode: (node: PlayerNodeInfo) => void;
  removePlayerNode: (nodeId: string) => void;
  clearPlayerNodes: () => void;
  incrementHints: () => void;
  setValidating: (isValidating: boolean) => void;
  setValidationResult: (result: QuizState['lastValidationResult']) => void;
  completeQuiz: () => void;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizState>()(
  persist(
    (set, get) => ({
      // Initial UI State
      currentView: 'start',

      // Initial Quiz Data
      availableQuizzes: [],
      currentQuiz: null,

      // Initial Game State
      playerEdges: [],
      playerNodes: [],
      hintsUsed: 0,
      isValidating: false,
      lastValidationResult: null,

      // Initial Progress
      progress: {
        completedQuizzes: [],
        currentQuizId: null,
        currentQuizProgress: null,
      },

      // Actions
      setView: (view) => set({ currentView: view }),

      setAvailableQuizzes: (quizzes) => set({ availableQuizzes: quizzes }),

      loadQuiz: (quiz) =>
        set({
          currentQuiz: quiz,
          currentView: 'quiz',
          playerEdges: [],
          playerNodes: [],
          hintsUsed: 0,
          lastValidationResult: null,
          progress: {
            ...get().progress,
            currentQuizId: quiz.id,
            currentQuizProgress: {
              connectedEdges: [],
              hintsUsed: 0,
            },
          },
        }),

      addPlayerEdge: (edge) => {
        const newEdges = [...get().playerEdges, edge];
        set({
          playerEdges: newEdges,
          progress: {
            ...get().progress,
            currentQuizProgress: {
              ...get().progress.currentQuizProgress!,
              connectedEdges: newEdges,
            },
          },
        });
      },

      removePlayerEdge: (edgeId) => {
        const newEdges = get().playerEdges.filter((e) => e.id !== edgeId);
        set({
          playerEdges: newEdges,
          progress: {
            ...get().progress,
            currentQuizProgress: {
              ...get().progress.currentQuizProgress!,
              connectedEdges: newEdges,
            },
          },
        });
      },

      clearPlayerEdges: () =>
        set({
          playerEdges: [],
          progress: {
            ...get().progress,
            currentQuizProgress: {
              ...get().progress.currentQuizProgress!,
              connectedEdges: [],
            },
          },
        }),

      addPlayerNode: (node) => {
        set({ playerNodes: [...get().playerNodes, node] });
      },

      removePlayerNode: (nodeId) => {
        set({ playerNodes: get().playerNodes.filter((n) => n.id !== nodeId) });
      },

      clearPlayerNodes: () => {
        set({ playerNodes: [] });
      },

      incrementHints: () => {
        const newHintsUsed = get().hintsUsed + 1;
        set({
          hintsUsed: newHintsUsed,
          progress: {
            ...get().progress,
            currentQuizProgress: {
              ...get().progress.currentQuizProgress!,
              hintsUsed: newHintsUsed,
            },
          },
        });
      },

      setValidating: (isValidating) => set({ isValidating }),

      setValidationResult: (result) => set({ lastValidationResult: result }),

      completeQuiz: () => {
        const currentQuiz = get().currentQuiz;
        if (!currentQuiz) return;

        const completedQuizzes = get().progress.completedQuizzes;
        if (!completedQuizzes.includes(currentQuiz.id)) {
          set({
            currentView: 'result',
            progress: {
              ...get().progress,
              completedQuizzes: [...completedQuizzes, currentQuiz.id],
              currentQuizId: null,
              currentQuizProgress: null,
            },
          });
        } else {
          set({
            currentView: 'result',
            progress: {
              ...get().progress,
              currentQuizId: null,
              currentQuizProgress: null,
            },
          });
        }
      },

      resetQuiz: () =>
        set({
          currentQuiz: null,
          currentView: 'start',
          playerEdges: [],
          playerNodes: [],
          hintsUsed: 0,
          lastValidationResult: null,
          progress: {
            ...get().progress,
            currentQuizId: null,
            currentQuizProgress: null,
          },
        }),
    }),
    {
      name: 'workflow-quiz-storage',
      partialize: (state) => ({ progress: state.progress }),
    }
  )
);

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type {
  Quiz,
  QuizMetadata,
  QuizWorkflow,
  WorkflowEdgeDefault,
  NodeSchema,
  WorkflowV3,
  WorkflowInvocationNode,
  HintInfo,
  QuizFile,
} from '../types/index.js';
import { nodeSchemas } from '../schemas/nodeSchemas.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class QuizService {
  private quizzesDir: string;
  private quizCache: Map<string, QuizFile> = new Map();

  constructor() {
    this.quizzesDir = path.join(__dirname, '../../quizzes');
    this.loadQuizzes();
  }

  private loadQuizzes(): void {
    if (!fs.existsSync(this.quizzesDir)) {
      fs.mkdirSync(this.quizzesDir, { recursive: true });
      return;
    }

    const files = fs.readdirSync(this.quizzesDir).filter(f => f.endsWith('.json'));

    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.quizzesDir, file), 'utf-8');
        const quiz: QuizFile = JSON.parse(content);
        this.quizCache.set(quiz.id, quiz);
      } catch (error) {
        console.error(`Failed to load quiz file: ${file}`, error);
      }
    }
  }

  listQuizzes(): QuizMetadata[] {
    const quizzes: QuizMetadata[] = [];

    for (const quiz of this.quizCache.values()) {
      quizzes.push({
        id: quiz.id,
        name: quiz.name,
        description: quiz.description,
        difficulty: quiz.difficulty,
        edgeCount: quiz.workflow.edges.length,
        hiddenEdgeCount: quiz.hiddenEdges.length,
        hiddenNodeCount: quiz.hiddenNodes?.length || 0,
      });
    }

    // Sort by difficulty
    const difficultyOrder = { easy: 0, medium: 1, hard: 2 };
    return quizzes.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
  }

  getQuiz(id: string): QuizWorkflow | null {
    const quiz = this.quizCache.get(id);
    if (!quiz) return null;

    const hiddenNodeIds = quiz.hiddenNodes || [];

    // Create a copy of the workflow with hidden edges and hidden nodes removed
    const visibleEdges = quiz.workflow.edges.filter(
      edge => !quiz.hiddenEdges.includes(edge.id)
    );

    const visibleNodes = quiz.workflow.nodes.filter(
      node => !hiddenNodeIds.includes(node.id)
    );

    const workflowWithoutHidden: WorkflowV3 = {
      ...quiz.workflow,
      nodes: visibleNodes,
      edges: visibleEdges,
    };

    // Get node schemas for all nodes in this workflow (including hidden nodes so player can add them)
    const relevantSchemas: Record<string, NodeSchema> = {};
    for (const node of quiz.workflow.nodes) {
      if (node.type === 'invocation') {
        const nodeType = node.data.type;
        if (nodeSchemas[nodeType]) {
          relevantSchemas[nodeType] = nodeSchemas[nodeType];
        }
      }
    }

    return {
      id: quiz.id,
      name: quiz.name,
      description: quiz.description,
      difficulty: quiz.difficulty,
      workflow: workflowWithoutHidden,
      hiddenEdgeCount: quiz.hiddenEdges.length,
      hiddenNodeCount: hiddenNodeIds.length,
      nodeSchemas: relevantSchemas,
    };
  }

  getQuizFull(id: string): (Quiz & { nodeSchemas: Record<string, NodeSchema> }) | null {
    const quiz = this.quizCache.get(id);
    if (!quiz) return null;

    // Get node schemas for all nodes in this workflow
    const relevantSchemas: Record<string, NodeSchema> = {};
    for (const node of quiz.workflow.nodes) {
      if (node.type === 'invocation') {
        const nodeType = node.data.type;
        if (nodeSchemas[nodeType]) {
          relevantSchemas[nodeType] = nodeSchemas[nodeType];
        }
      }
    }

    return {
      ...quiz,
      nodeSchemas: relevantSchemas,
    };
  }

  getHint(quiz: Quiz & { nodeSchemas: Record<string, NodeSchema> }, connectedEdgeIds: string[]): HintInfo | null {
    // Find a hidden edge that hasn't been connected yet
    const remainingHiddenEdges = quiz.hiddenEdges.filter(
      edgeId => !connectedEdgeIds.includes(edgeId)
    );

    if (remainingHiddenEdges.length === 0) {
      return null;
    }

    // Get the first remaining hidden edge
    const targetEdgeId = remainingHiddenEdges[0];
    const targetEdge = quiz.workflow.edges.find(e => e.id === targetEdgeId) as WorkflowEdgeDefault | undefined;

    if (!targetEdge || targetEdge.type !== 'default') {
      return null;
    }

    // Find the source and target nodes
    const sourceNode = quiz.workflow.nodes.find(n => n.id === targetEdge.source) as WorkflowInvocationNode | undefined;
    const targetNode = quiz.workflow.nodes.find(n => n.id === targetEdge.target) as WorkflowInvocationNode | undefined;

    if (!sourceNode || !targetNode || sourceNode.type !== 'invocation' || targetNode.type !== 'invocation') {
      return null;
    }

    return {
      sourceNodeId: sourceNode.id,
      sourceNodeLabel: sourceNode.data.label || sourceNode.data.type,
      sourceFieldName: targetEdge.sourceHandle,
      targetNodeId: targetNode.id,
      targetNodeLabel: targetNode.data.label || targetNode.data.type,
      targetFieldName: targetEdge.targetHandle,
    };
  }

  reloadQuizzes(): void {
    this.quizCache.clear();
    this.loadQuizzes();
  }
}

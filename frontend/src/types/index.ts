/**
 * Shared types for Workflow Quiz Game
 * Simplified version of InvokeAI workflow types
 */

// #region Field Types
export type Cardinality = 'SINGLE' | 'COLLECTION' | 'SINGLE_OR_COLLECTION';

export interface FieldType {
  name: string;
  cardinality: Cardinality;
  batch: boolean;
  originalType?: FieldType;
}

export interface FieldIdentifier {
  nodeId: string;
  fieldName: string;
}

// #region Position
export interface XYPosition {
  x: number;
  y: number;
}

// #region Workflow Nodes
export interface InvocationNodeData {
  id: string;
  type: string;
  version: string;
  label: string;
  notes: string;
  isOpen: boolean;
  isIntermediate: boolean;
  useCache: boolean;
  inputs: Record<string, FieldInputInstance>;
}

export interface NotesNodeData {
  id: string;
  type: 'notes';
  label: string;
  isOpen: boolean;
  notes: string;
}

export interface WorkflowInvocationNode {
  id: string;
  type: 'invocation';
  data: InvocationNodeData;
  position: XYPosition;
}

export interface WorkflowNotesNode {
  id: string;
  type: 'notes';
  data: NotesNodeData;
  position: XYPosition;
}

export type WorkflowNode = WorkflowInvocationNode | WorkflowNotesNode;

// #region Workflow Edges
export interface WorkflowEdgeBase {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowEdgeDefault extends WorkflowEdgeBase {
  type: 'default';
  sourceHandle: string;
  targetHandle: string;
  hidden?: boolean;
}

export interface WorkflowEdgeCollapsed extends WorkflowEdgeBase {
  type: 'collapsed';
}

export type WorkflowEdge = WorkflowEdgeDefault | WorkflowEdgeCollapsed;

// #region Field Input Instance
export interface FieldInputInstance {
  name: string;
  label: string;
  description: string;
  value?: unknown;
}

// #region Workflow V3 (Simplified)
export interface WorkflowV3 {
  id?: string;
  name: string;
  author: string;
  description: string;
  version: string;
  contact: string;
  tags: string;
  notes: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  exposedFields: FieldIdentifier[];
  meta: {
    category: 'user' | 'default';
    version: '3.0.0';
  };
}

// #region Node Schema (for validation)
export interface NodeFieldSchema {
  name: string;
  title: string;
  description: string;
  type: FieldType;
  input: 'connection' | 'direct' | 'any';
  required: boolean;
}

export interface NodeSchema {
  type: string;
  title: string;
  description: string;
  version: string;
  category: string;
  inputs: Record<string, NodeFieldSchema>;
  outputs: Record<string, NodeFieldSchema>;
}

// #region Quiz Types
export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizMetadata {
  id: string;
  name: string;
  description: string;
  difficulty: QuizDifficulty;
  edgeCount: number;
  hiddenEdgeCount: number;
  hiddenNodeCount: number;
}

export interface Quiz {
  id: string;
  name: string;
  description: string;
  difficulty: QuizDifficulty;
  workflow: WorkflowV3;
  hiddenEdges: string[]; // Edge IDs that player needs to connect
  hiddenNodes?: string[]; // Node IDs that player needs to add (for hard quizzes)
}

export interface QuizWorkflow {
  id: string;
  name: string;
  description: string;
  difficulty: QuizDifficulty;
  workflow: WorkflowV3; // Workflow with hidden edges and nodes removed
  hiddenEdgeCount: number;
  hiddenNodeCount: number; // Number of nodes player needs to add
  nodeSchemas: Record<string, NodeSchema>; // Schemas for nodes in this workflow (including hidden node types)
}

// #region Validation Types
export interface ValidationError {
  type: 'invalid_connection' | 'self_connection' | 'cycle' | 'duplicate' | 'missing_node' | 'missing_field' | 'type_mismatch';
  message: string;
  edge?: WorkflowEdgeDefault;
}

export interface ValidateEdgeRequest {
  sourceNode: string;
  sourceHandle: string;
  targetNode: string;
  targetHandle: string;
}

export interface ValidateEdgeResponse {
  valid: boolean;
  error?: string;
}

export interface ValidateQuizRequest {
  proposedEdges: WorkflowEdgeDefault[];
}

export interface ValidateQuizResponse {
  valid: boolean;
  errors: ValidationError[];
  correctEdges: number;
  totalEdges: number;
  completed: boolean;
}

// #region Game Progress (for LocalStorage)
export interface GameProgress {
  completedQuizzes: string[];
  currentQuizId: string | null;
  currentQuizProgress: {
    connectedEdges: WorkflowEdgeDefault[];
    hintsUsed: number;
  } | null;
}

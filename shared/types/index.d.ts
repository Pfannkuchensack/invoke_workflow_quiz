/**
 * Shared types for Workflow Quiz Game
 * Simplified version of InvokeAI workflow types
 */
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
export interface XYPosition {
    x: number;
    y: number;
}
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
export interface FieldInputInstance {
    name: string;
    label: string;
    description: string;
    value?: unknown;
}
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
export type QuizDifficulty = 'easy' | 'medium' | 'hard';
export interface QuizMetadata {
    id: string;
    name: string;
    description: string;
    difficulty: QuizDifficulty;
    edgeCount: number;
    hiddenEdgeCount: number;
}
export interface Quiz {
    id: string;
    name: string;
    description: string;
    difficulty: QuizDifficulty;
    workflow: WorkflowV3;
    hiddenEdges: string[];
}
export interface QuizWorkflow {
    id: string;
    name: string;
    description: string;
    difficulty: QuizDifficulty;
    workflow: WorkflowV3;
    hiddenEdgeCount: number;
    nodeSchemas: Record<string, NodeSchema>;
}
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
export interface GameProgress {
    completedQuizzes: string[];
    currentQuizId: string | null;
    currentQuizProgress: {
        connectedEdges: WorkflowEdgeDefault[];
        hintsUsed: number;
        startTime: number;
    } | null;
}
//# sourceMappingURL=index.d.ts.map
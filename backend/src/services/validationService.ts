import graphlib from '@dagrejs/graphlib';
import type {
  WorkflowV3,
  WorkflowEdgeDefault,
  NodeSchema,
  ValidateEdgeRequest,
  ValidateEdgeResponse,
  ValidateQuizResponse,
  ValidationError,
  Quiz,
  FieldType,
  WorkflowInvocationNode,
  PlayerNodeMapping,
} from '../types/index.js';

export class ValidationService {

  validateSingleEdge(
    workflow: WorkflowV3,
    nodeSchemas: Record<string, NodeSchema>,
    edge: ValidateEdgeRequest
  ): ValidateEdgeResponse {
    const { sourceNode, sourceHandle, targetNode, targetHandle } = edge;

    // Check self-connection
    if (sourceNode === targetNode) {
      return { valid: false, error: 'Cannot connect a node to itself' };
    }

    // Check if nodes exist
    const source = workflow.nodes.find(n => n.id === sourceNode);
    const target = workflow.nodes.find(n => n.id === targetNode);

    if (!source || !target) {
      return { valid: false, error: 'Source or target node not found' };
    }

    if (source.type !== 'invocation' || target.type !== 'invocation') {
      return { valid: false, error: 'Can only connect invocation nodes' };
    }

    // Get node schemas
    const sourceSchema = nodeSchemas[source.data.type];
    const targetSchema = nodeSchemas[target.data.type];

    if (!sourceSchema || !targetSchema) {
      // If schema not found, allow connection (permissive mode)
      return { valid: true };
    }

    // Check if fields exist
    const sourceField = sourceSchema.outputs[sourceHandle];
    const targetField = targetSchema.inputs[targetHandle];

    if (!sourceField) {
      return { valid: false, error: `Output field '${sourceHandle}' not found on source node` };
    }

    if (!targetField) {
      return { valid: false, error: `Input field '${targetHandle}' not found on target node` };
    }

    // Check if target accepts connections
    if (targetField.input === 'direct') {
      return { valid: false, error: 'This input does not accept connections' };
    }

    // Check type compatibility
    if (!this.areTypesCompatible(sourceField.type, targetField.type)) {
      const sourceDesc = `${sourceField.type.name} (${sourceField.type.cardinality})`;
      const targetDesc = `${targetField.type.name} (${targetField.type.cardinality})`;
      return {
        valid: false,
        error: `Type mismatch: ${sourceDesc} cannot connect to ${targetDesc}`
      };
    }

    // Check for cycles
    const currentEdges = workflow.edges.filter(e => e.type === 'default') as WorkflowEdgeDefault[];
    if (this.wouldCreateCycle(sourceNode, targetNode, workflow.nodes.map(n => n.id), currentEdges)) {
      return { valid: false, error: 'This connection would create a cycle' };
    }

    return { valid: true };
  }

  validateQuiz(
    quiz: Quiz & { nodeSchemas: Record<string, NodeSchema> },
    proposedEdges: WorkflowEdgeDefault[],
    playerNodeMappings?: PlayerNodeMapping[]
  ): ValidateQuizResponse {
    const errors: ValidationError[] = [];
    let correctEdges = 0;

    // Get the hidden edges that need to be connected
    const hiddenEdgeSet = new Set(quiz.hiddenEdges);
    const originalEdges = quiz.workflow.edges.filter(
      e => e.type === 'default' && hiddenEdgeSet.has(e.id)
    ) as WorkflowEdgeDefault[];

    // Create a map for quick lookup of original edges
    const originalEdgeMap = new Map<string, WorkflowEdgeDefault>();
    for (const edge of originalEdges) {
      const key = `${edge.source}:${edge.sourceHandle}->${edge.target}:${edge.targetHandle}`;
      originalEdgeMap.set(key, edge);
    }

    // Build a map from player node ID to the hidden node ID it represents
    const playerToHiddenNodeMap = new Map<string, string>();
    if (playerNodeMappings && quiz.hiddenNodes) {
      // For each player node, find the corresponding hidden node by type
      for (const playerNode of playerNodeMappings) {
        // Find a hidden node with the same type
        for (const hiddenNodeId of quiz.hiddenNodes) {
          const hiddenNode = quiz.workflow.nodes.find(n => n.id === hiddenNodeId);
          if (hiddenNode && hiddenNode.type === 'invocation') {
            const invNode = hiddenNode as WorkflowInvocationNode;
            if (invNode.data.type === playerNode.nodeType) {
              // Check if this hidden node is already mapped
              const alreadyMapped = Array.from(playerToHiddenNodeMap.values()).includes(hiddenNodeId);
              if (!alreadyMapped) {
                playerToHiddenNodeMap.set(playerNode.id, hiddenNodeId);
                break;
              }
            }
          }
        }
      }
    }

    // Helper to resolve node ID (player node -> hidden node if applicable)
    const resolveNodeId = (nodeId: string): string => {
      return playerToHiddenNodeMap.get(nodeId) || nodeId;
    };

    // Validate each proposed edge
    for (const edge of proposedEdges) {
      // Resolve player node IDs to hidden node IDs for matching
      const resolvedSource = resolveNodeId(edge.source);
      const resolvedTarget = resolveNodeId(edge.target);

      // Check if this edge matches an original hidden edge
      const key = `${resolvedSource}:${edge.sourceHandle}->${resolvedTarget}:${edge.targetHandle}`;

      if (originalEdgeMap.has(key)) {
        correctEdges++;
      } else {
        // Validate the edge anyway to provide feedback
        const validation = this.validateSingleEdge(
          quiz.workflow,
          quiz.nodeSchemas,
          {
            sourceNode: resolvedSource,
            sourceHandle: edge.sourceHandle,
            targetNode: resolvedTarget,
            targetHandle: edge.targetHandle,
          }
        );

        if (!validation.valid) {
          errors.push({
            type: 'invalid_connection',
            message: validation.error || 'Invalid connection',
            edge,
          });
        } else {
          // Edge is valid but not correct - could be an alternative valid connection
          errors.push({
            type: 'type_mismatch',
            message: 'This connection is valid but not the expected one',
            edge,
          });
        }
      }
    }

    const totalEdges = quiz.hiddenEdges.length;
    const completed = correctEdges === totalEdges && errors.length === 0;

    return {
      valid: errors.length === 0,
      errors,
      correctEdges,
      totalEdges,
      completed,
    };
  }

  private areTypesCompatible(sourceType: FieldType, targetType: FieldType): boolean {
    // Exact match
    if (this.areTypesEqual(sourceType, targetType)) {
      return true;
    }

    // Batch mismatch
    if (sourceType.batch !== targetType.batch) {
      return false;
    }

    // AnyField target accepts anything
    if (targetType.name === 'AnyField') {
      return true;
    }

    // AnyField source can connect to anything (it's a generic/dynamic type)
    // InvokeAI allows AnyField to connect to typed fields - type checking happens at runtime
    if (sourceType.name === 'AnyField') {
      return true;
    }

    // CollectionItem to non-collection
    if (sourceType.name === 'CollectionItemField' && targetType.cardinality !== 'COLLECTION') {
      return true;
    }

    // Single to CollectionItem
    if (sourceType.cardinality === 'SINGLE' && targetType.name === 'CollectionItemField') {
      return true;
    }

    // Anything to SINGLE_OR_COLLECTION of same base type
    if (targetType.cardinality === 'SINGLE_OR_COLLECTION' && sourceType.name === targetType.name) {
      return true;
    }

    // Generic CollectionField to any collection
    if (sourceType.name === 'CollectionField' && targetType.cardinality !== 'SINGLE') {
      return true;
    }

    // Any collection to generic CollectionField
    if (targetType.name === 'CollectionField' && sourceType.cardinality === 'COLLECTION') {
      return true;
    }

    // Check cardinality compatibility
    const cardinalityMatches = this.checkCardinalityMatch(sourceType, targetType);
    if (!cardinalityMatches) {
      return false;
    }

    // Same type name with compatible cardinality
    if (sourceType.name === targetType.name) {
      return true;
    }

    // Type coercions
    const isIntToFloat = sourceType.name === 'IntegerField' && targetType.name === 'FloatField';
    const isIntToString = sourceType.name === 'IntegerField' && targetType.name === 'StringField';
    const isFloatToString = sourceType.name === 'FloatField' && targetType.name === 'StringField';

    return isIntToFloat || isIntToString || isFloatToString;
  }

  private areTypesEqual(first: FieldType, second: FieldType): boolean {
    const firstClean = this.omitOriginalType(first);
    const secondClean = this.omitOriginalType(second);

    if (this.objectEquals(firstClean, secondClean)) {
      return true;
    }

    // Check original types
    const firstOriginal = first.originalType;
    const secondOriginal = second.originalType;

    if (secondOriginal && this.objectEquals(firstClean, this.omitOriginalType(secondOriginal))) {
      return true;
    }
    if (firstOriginal && this.objectEquals(this.omitOriginalType(firstOriginal), secondClean)) {
      return true;
    }
    if (firstOriginal && secondOriginal &&
        this.objectEquals(this.omitOriginalType(firstOriginal), this.omitOriginalType(secondOriginal))) {
      return true;
    }

    return false;
  }

  private omitOriginalType(type: FieldType): Omit<FieldType, 'originalType'> {
    const { originalType, ...rest } = type;
    return rest;
  }

  private objectEquals(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  private checkCardinalityMatch(source: FieldType, target: FieldType): boolean {
    const isSingleToSingle = source.cardinality === 'SINGLE' && target.cardinality === 'SINGLE';
    const isCollectionToCollection = source.cardinality === 'COLLECTION' && target.cardinality === 'COLLECTION';
    const isCollectionToSingleOrCollection = source.cardinality === 'COLLECTION' && target.cardinality === 'SINGLE_OR_COLLECTION';
    const isSingleOrCollectionToSingleOrCollection = source.cardinality === 'SINGLE_OR_COLLECTION' && target.cardinality === 'SINGLE_OR_COLLECTION';
    const isSingleToSingleOrCollection = source.cardinality === 'SINGLE' && target.cardinality === 'SINGLE_OR_COLLECTION';

    return isSingleToSingle ||
           isCollectionToCollection ||
           isCollectionToSingleOrCollection ||
           isSingleOrCollectionToSingleOrCollection ||
           isSingleToSingleOrCollection;
  }

  private wouldCreateCycle(
    source: string,
    target: string,
    nodeIds: string[],
    edges: WorkflowEdgeDefault[]
  ): boolean {
    const g = new graphlib.Graph();

    // Add all nodes
    for (const nodeId of nodeIds) {
      g.setNode(nodeId);
    }

    // Add existing edges
    for (const edge of edges) {
      g.setEdge(edge.source, edge.target);
    }

    // Add the candidate edge
    g.setEdge(source, target);

    // Check if acyclic
    return !graphlib.alg.isAcyclic(g);
  }
}

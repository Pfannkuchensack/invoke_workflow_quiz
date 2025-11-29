import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  MarkerType,
  BackgroundVariant,
  type NodeChange,
  type XYPosition,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './QuizCanvas.css';
import { useQuizStore } from '../../store/quizStore';
import { apiFetch } from '../../utils/api';
import { QuizNode } from '../Node/QuizNode';
import type {
  WorkflowInvocationNode,
  WorkflowEdgeDefault,
  NodeSchema,
} from '../../types';
import {
  useToast,
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from '@chakra-ui/react';

const nodeTypes = {
  invocation: QuizNode,
};

export function QuizCanvas() {
  const {
    currentQuiz,
    playerEdges,
    addPlayerEdge,
    removePlayerEdge,
    addPlayerNode,
    removePlayerNode,
  } = useQuizStore();
  const toast = useToast();
  const [playerNodes, setPlayerNodes] = useState<Node[]>([]);

  // Convert workflow nodes to React Flow nodes
  const initialNodes: Node[] = useMemo(() => {
    if (!currentQuiz) return [];

    return currentQuiz.workflow.nodes
      .filter((n) => n.type === 'invocation')
      .map((node) => {
        const invNode = node as WorkflowInvocationNode;
        const schema = currentQuiz.nodeSchemas[invNode.data.type];

        return {
          id: node.id,
          type: 'invocation',
          position: node.position,
          data: {
            ...invNode.data,
            schema,
          },
        };
      });
  }, [currentQuiz]);

  // Combine workflow nodes with player-added nodes
  const allInitialNodes = useMemo(() => {
    return [...initialNodes, ...playerNodes];
  }, [initialNodes, playerNodes]);

  // Get available node types from schemas
  const availableNodeTypes = useMemo(() => {
    if (!currentQuiz) return [];
    return Object.entries(currentQuiz.nodeSchemas).map(([type, schema]) => ({
      type,
      title: schema.title,
      schema,
    }));
  }, [currentQuiz]);

  // Combine existing visible edges with player edges
  const initialEdges: Edge[] = useMemo(() => {
    if (!currentQuiz) return [];

    // Visible edges from workflow (not hidden)
    const visibleEdges = currentQuiz.workflow.edges
      .filter((e) => e.type === 'default')
      .map((edge) => {
        const e = edge as WorkflowEdgeDefault;
        return {
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          type: 'default',
          animated: false,
          style: { stroke: '#666' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#666',
          },
        };
      });

    // Player-added edges
    const playerEdgesMapped = playerEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      type: 'default',
      animated: true,
      style: { stroke: '#3182ce', strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#3182ce',
      },
    }));

    return [...visibleEdges, ...playerEdgesMapped];
  }, [currentQuiz, playerEdges]);

  // Initialize React Flow state BEFORE callbacks that use them
  const [nodes, setNodes, onNodesChange] = useNodesState(allInitialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);

  // Sync edges with store when playerEdges changes (e.g., Clear button)
  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Delete a player-added node and its edges
  const deletePlayerNode = useCallback((nodeId: string) => {
    // Remove the node from React Flow
    setNodes((currentNodes) => currentNodes.filter((n) => n.id !== nodeId));
    // Remove from player nodes tracking (local state)
    setPlayerNodes((nodes) => nodes.filter((n) => n.id !== nodeId));
    // Remove from store
    removePlayerNode(nodeId);
    // Remove all edges connected to this node
    setEdges((currentEdges) => currentEdges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    ));
    // Remove from player edges in store
    const edgesToRemove = playerEdges.filter(
      (e) => e.source === nodeId || e.target === nodeId
    );
    edgesToRemove.forEach((e) => removePlayerEdge(e.id));

    toast({
      title: 'Node Deleted',
      status: 'info',
      duration: 1000,
    });
  }, [setNodes, setEdges, playerEdges, removePlayerEdge, removePlayerNode, toast]);

  // Add a new node - defined AFTER useNodesState
  const addNode = useCallback((nodeType: string, schema: NodeSchema) => {
    const newNodeId = `player-node-${Date.now()}`;
    const newNode: Node = {
      id: newNodeId,
      type: 'invocation',
      position: { x: 100 + Math.random() * 200, y: 100 + Math.random() * 200 },
      data: {
        id: newNodeId,
        type: nodeType,
        version: schema.version,
        label: schema.title,
        notes: '',
        isOpen: true,
        isIntermediate: false,
        useCache: true,
        inputs: {},
        schema,
        isPlayerNode: true,
        onDelete: deletePlayerNode,
      },
    };
    // Update both React Flow state and local tracking state
    setNodes((currentNodes) => [...currentNodes, newNode]);
    setPlayerNodes((nodes) => [...nodes, newNode]);
    // Track in store for validation
    addPlayerNode({ id: newNodeId, nodeType });
    toast({
      title: 'Node Added',
      description: `Added ${schema.title}`,
      status: 'success',
      duration: 2000,
    });
  }, [setNodes, toast, deletePlayerNode, addPlayerNode]);

  // Handle node changes (including position changes for dragging)
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);
      // Update player nodes state for position changes
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && change.id.startsWith('player-node-')) {
          setPlayerNodes((nodes) =>
            nodes.map((node) =>
              node.id === change.id
                ? { ...node, position: change.position as XYPosition }
                : node
            )
          );
        }
      });
    },
    [onNodesChange]
  );

  // Helper to validate connections involving player-added nodes
  const validatePlayerNodeConnection = useCallback(
    (connection: Connection): { valid: boolean; error?: string } => {
      const sourceNode = nodes.find((n) => n.id === connection.source);
      const targetNode = nodes.find((n) => n.id === connection.target);

      if (!sourceNode || !targetNode) {
        return { valid: false, error: 'Source or target node not found' };
      }

      // Self-connection check
      if (connection.source === connection.target) {
        return { valid: false, error: 'Cannot connect a node to itself' };
      }

      const sourceSchema = sourceNode.data.schema as NodeSchema | undefined;
      const targetSchema = targetNode.data.schema as NodeSchema | undefined;

      if (!sourceSchema || !targetSchema) {
        // If no schema, allow (permissive mode)
        return { valid: true };
      }

      const sourceField = sourceSchema.outputs[connection.sourceHandle || ''];
      const targetField = targetSchema.inputs[connection.targetHandle || ''];

      if (!sourceField) {
        return { valid: false, error: `Output field '${connection.sourceHandle}' not found` };
      }

      if (!targetField) {
        return { valid: false, error: `Input field '${connection.targetHandle}' not found` };
      }

      // Check if target accepts connections
      if (targetField.input === 'direct') {
        return { valid: false, error: 'This input does not accept connections' };
      }

      // Basic type compatibility check
      const sourceType = sourceField.type;
      const targetType = targetField.type;

      // AnyField target accepts anything
      if (targetType.name === 'AnyField') {
        return { valid: true };
      }

      // AnyField source can connect to anything (it's a generic/dynamic type)
      // InvokeAI allows AnyField to connect to typed fields - type checking happens at runtime
      if (sourceType.name === 'AnyField') {
        return { valid: true };
      }

      // CollectionItemField compatibility (generic collection operations)
      if (
        sourceType.name === 'CollectionItemField' ||
        targetType.name === 'CollectionItemField'
      ) {
        return { valid: true };
      }

      // Same type name - check cardinality compatibility
      if (sourceType.name === targetType.name) {
        // SINGLE → SINGLE, COLLECTION → COLLECTION always work
        if (sourceType.cardinality === targetType.cardinality) {
          return { valid: true };
        }
        // SINGLE → SINGLE_OR_COLLECTION works
        if (sourceType.cardinality === 'SINGLE' && targetType.cardinality === 'SINGLE_OR_COLLECTION') {
          return { valid: true };
        }
        // COLLECTION → SINGLE_OR_COLLECTION works
        if (sourceType.cardinality === 'COLLECTION' && targetType.cardinality === 'SINGLE_OR_COLLECTION') {
          return { valid: true };
        }
        // SINGLE_OR_COLLECTION → SINGLE_OR_COLLECTION works
        if (sourceType.cardinality === 'SINGLE_OR_COLLECTION' && targetType.cardinality === 'SINGLE_OR_COLLECTION') {
          return { valid: true };
        }
        // Cardinality mismatch (e.g., SINGLE → COLLECTION)
        return {
          valid: false,
          error: `Cardinality mismatch: ${sourceType.name} (${sourceType.cardinality}) cannot connect to ${targetType.name} (${targetType.cardinality}). Use a Collect node to convert single values to a collection.`,
        };
      }

      // Integer to Float coercion
      if (sourceType.name === 'IntegerField' && targetType.name === 'FloatField') {
        return { valid: true };
      }

      // Int/Float to String coercion
      if (
        (sourceType.name === 'IntegerField' || sourceType.name === 'FloatField') &&
        targetType.name === 'StringField'
      ) {
        return { valid: true };
      }

      return {
        valid: false,
        error: `Type mismatch: ${sourceType.name} (${sourceType.cardinality}) cannot connect to ${targetType.name} (${targetType.cardinality})`,
      };
    },
    [nodes]
  );

  const onConnect = useCallback(
    async (connection: Connection) => {
      if (!currentQuiz || !connection.source || !connection.target) return;

      const isSourcePlayerNode = connection.source.startsWith('player-node-');
      const isTargetPlayerNode = connection.target.startsWith('player-node-');

      // If either node is player-added, validate locally
      if (isSourcePlayerNode || isTargetPlayerNode) {
        const localResult = validatePlayerNodeConnection(connection);
        if (!localResult.valid) {
          toast({
            title: 'Invalid Connection',
            description: localResult.error,
            status: 'error',
            duration: 3000,
          });
          return;
        }
      } else {
        // Validate the connection via backend (both nodes are original workflow nodes)
        try {
          const response = await apiFetch(`/quizzes/${currentQuiz.id}/check-edge`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sourceNode: connection.source,
              sourceHandle: connection.sourceHandle,
              targetNode: connection.target,
              targetHandle: connection.targetHandle,
            }),
          });

          const result = await response.json();

          if (!result.valid) {
            toast({
              title: 'Invalid Connection',
              description: result.error,
              status: 'error',
              duration: 3000,
            });
            return;
          }
        } catch (error) {
          toast({
            title: 'Connection Error',
            description: 'Failed to validate connection',
            status: 'error',
            duration: 3000,
          });
          return;
        }
      }

      // Add the edge
      const newEdge: WorkflowEdgeDefault = {
        id: `player-edge-${Date.now()}`,
        type: 'default',
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || '',
        targetHandle: connection.targetHandle || '',
      };

      addPlayerEdge(newEdge);

      // Update React Flow edges
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            id: newEdge.id,
            type: 'default',
            animated: true,
            style: { stroke: '#3182ce', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#3182ce',
            },
          },
          eds
        )
      );

      toast({
        title: 'Edge Connected',
        status: 'success',
        duration: 1000,
      });
    },
    [currentQuiz, addPlayerEdge, setEdges, toast, validatePlayerNodeConnection]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      // Only allow removing player-added edges
      if (edge.id.startsWith('player-edge-')) {
        removePlayerEdge(edge.id);
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        toast({
          title: 'Edge Removed',
          status: 'info',
          duration: 1000,
        });
      }
    },
    [removePlayerEdge, setEdges, toast]
  );

  if (!currentQuiz) return null;

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={handleNodesChange}
      onConnect={onConnect}
      onEdgeClick={onEdgeClick}
      nodeTypes={nodeTypes}
      fitView
      minZoom={0.3}
      maxZoom={2}
      defaultEdgeOptions={{
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
        },
      }}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#444" />
      <Controls />
      <MiniMap
        nodeColor="#444"
        maskColor="rgba(0, 0, 0, 0.8)"
        style={{ background: '#1a1a1a' }}
      />
      <Panel position="top-left">
        <Box bg="gray.800" p={2} borderRadius="md" borderWidth={1} borderColor="gray.600">
          <Menu>
            <MenuButton as={Button} size="sm" colorScheme="blue">
              + Add Node
            </MenuButton>
            <MenuList bg="gray.700" borderColor="gray.600">
              {availableNodeTypes.map(({ type, title, schema }) => (
                <MenuItem
                  key={type}
                  bg="gray.700"
                  _hover={{ bg: 'gray.600' }}
                  onClick={() => addNode(type, schema)}
                >
                  <Text fontSize="sm">{title}</Text>
                </MenuItem>
              ))}
              {availableNodeTypes.length === 0 && (
                <MenuItem bg="gray.700" isDisabled>
                  <Text fontSize="sm" color="gray.400">No node types available</Text>
                </MenuItem>
              )}
            </MenuList>
          </Menu>
        </Box>
      </Panel>
    </ReactFlow>
  );
}

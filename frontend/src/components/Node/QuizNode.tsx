import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Box, Flex, Grid, Text, Tooltip, IconButton } from '@chakra-ui/react';
import type { NodeSchema, NodeFieldSchema } from '../../types';

interface QuizNodeData {
  label: string;
  type: string;
  schema?: NodeSchema;
  isPlayerNode?: boolean;
  onDelete?: (nodeId: string) => void;
  [key: string]: unknown;
}

type QuizNodeType = Node<QuizNodeData, 'invocation'>;

// InvokeAI Field Type Colors (from FIELD_COLORS constant)
const FIELD_COLORS: Record<string, string> = {
  BoardField: '#805AD5',        // purple.500
  BooleanField: '#38A169',      // green.500
  CLIPField: '#38A169',         // green.500
  ColorField: '#F687B3',        // pink.300
  ConditioningField: '#00B5D8', // cyan.500
  FluxConditioningField: '#00B5D8',
  ControlField: '#319795',      // teal.500
  ControlNetModelField: '#319795',
  EnumField: '#3182CE',         // blue.500
  FloatField: '#DD6B20',        // orange.500
  ImageField: '#805AD5',        // purple.500
  ImageBatchField: '#805AD5',
  IntegerField: '#E53E3E',      // red.500
  IPAdapterField: '#319795',
  IPAdapterModelField: '#319795',
  LatentsField: '#D53F8C',      // pink.500
  LoRAModelField: '#319795',
  MainModelField: '#319795',
  ModelIdentifierField: '#319795',
  SchedulerField: '#805AD5',
  StringField: '#D69E2E',       // yellow.500
  T5EncoderField: '#38A169',
  TransformerField: '#E53E3E',
  UNetField: '#E53E3E',
  VAEField: '#3182CE',
  VAEModelField: '#319795',
  // Default
  default: '#718096',           // gray.500
};

function getFieldColor(typeName: string): string {
  return FIELD_COLORS[typeName] || FIELD_COLORS.default;
}

// Node width matching InvokeAI
const NODE_WIDTH = 320;

export const QuizNode = memo(({ id, data, selected }: NodeProps<QuizNodeType>) => {
  const { label, type, schema, isPlayerNode, onDelete } = data as QuizNodeData;

  // Get inputs and outputs from schema
  const inputs: NodeFieldSchema[] = schema?.inputs ? Object.values(schema.inputs) : [];
  const outputs: NodeFieldSchema[] = schema?.outputs ? Object.values(schema.outputs) : [];

  // Filter to only connection-capable fields
  const connectionInputs = inputs.filter(
    (f: NodeFieldSchema) => f.input === 'connection' || f.input === 'any'
  );

  return (
    <Box
      w={`${NODE_WIDTH}px`}
      borderRadius="base"
      position="relative"
      // Shadow layers like InvokeAI
      sx={{
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          borderRadius: 'base',
          boxShadow: selected
            ? '0 0 0 2px var(--chakra-colors-blue-400)'
            : '0 0 0 1px var(--chakra-colors-gray-600)',
          pointerEvents: 'none',
          zIndex: -1,
        },
      }}
    >
      {/* Header - InvokeAI style */}
      <Flex
        h={8}
        bg={isPlayerNode ? 'blue.900' : 'gray.850'}
        borderTopRadius="base"
        alignItems="center"
        px={2}
        gap={2}
      >
        <Text
          fontWeight="semibold"
          fontSize="sm"
          color="gray.100"
          noOfLines={1}
          flex={1}
        >
          {label || type}
        </Text>
        {isPlayerNode && onDelete && (
          <IconButton
            aria-label="Delete node"
            icon={<Text fontSize="xs">✕</Text>}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
          />
        )}
      </Flex>

      {/* Body - InvokeAI style */}
      <Box
        bg="gray.800"
        borderBottomRadius="base"
        py={2}
      >
        {/* Two column grid: Inputs | Outputs */}
        <Grid templateColumns="1fr 1fr" gap={0}>
          {/* Input fields (left column) */}
          <Flex direction="column" gap={0}>
            {connectionInputs.map((field) => {
              const color = getFieldColor(field.type.name);
              const isCollection = field.type.cardinality === 'COLLECTION';

              return (
                <Flex
                  key={field.name}
                  position="relative"
                  minH={8}
                  alignItems="center"
                  pl={4}
                  py={0.5}
                >
                  <Tooltip
                    label={`${field.title} (${field.type.name})`}
                    placement="top"
                    hasArrow
                    openDelay={500}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.300"
                      noOfLines={1}
                      cursor="default"
                    >
                      {field.title}
                    </Text>
                  </Tooltip>
                  <Handle
                    type="target"
                    position={Position.Left}
                    id={field.name}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      background: isCollection ? '#1A202C' : color,
                      borderColor: color,
                      borderWidth: isCollection ? '4px' : '0',
                      borderStyle: 'solid',
                      borderRadius: '50%',
                      left: '-0.5rem',
                    }}
                  />
                </Flex>
              );
            })}
          </Flex>

          {/* Output fields (right column) */}
          <Flex direction="column" gap={0}>
            {outputs.map((field) => {
              const color = getFieldColor(field.type.name);
              const isCollection = field.type.cardinality === 'COLLECTION';

              return (
                <Flex
                  key={field.name}
                  position="relative"
                  minH={8}
                  alignItems="center"
                  justifyContent="flex-end"
                  pr={4}
                  py={0.5}
                >
                  <Tooltip
                    label={`${field.title} (${field.type.name})`}
                    placement="top"
                    hasArrow
                    openDelay={500}
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.300"
                      noOfLines={1}
                      cursor="default"
                    >
                      {field.title}
                    </Text>
                  </Tooltip>
                  <Handle
                    type="source"
                    position={Position.Right}
                    id={field.name}
                    style={{
                      width: '1rem',
                      height: '1rem',
                      background: isCollection ? '#1A202C' : color,
                      borderColor: color,
                      borderWidth: isCollection ? '4px' : '0',
                      borderStyle: 'solid',
                      borderRadius: '50%',
                      right: '-0.5rem',
                    }}
                  />
                </Flex>
              );
            })}
          </Flex>
        </Grid>

        {/* Show message if no fields */}
        {connectionInputs.length === 0 && outputs.length === 0 && (
          <Flex justify="center" py={2}>
            <Text fontSize="xs" color="gray.500">
              No connection fields
            </Text>
          </Flex>
        )}
      </Box>
    </Box>
  );
});

QuizNode.displayName = 'QuizNode';

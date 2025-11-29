import { extendTheme } from '@chakra-ui/react';

// InvokeAI-inspired theme
export const theme = extendTheme({
  config: {
    initialColorMode: 'dark',
    useSystemColorMode: false,
  },
  colors: {
    // Extended gray scale to match InvokeAI
    gray: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      750: '#252D3A',
      800: '#1A202C',
      850: '#151A23', // For node headers
      900: '#0D1117',
    },
    // InvokeAI accent colors
    base: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      850: '#151A23',
      900: '#0D1117',
    },
  },
  styles: {
    global: {
      body: {
        bg: 'gray.900',
        color: 'white',
      },
      // React Flow overrides
      '.react-flow__node': {
        cursor: 'default',
      },
      '.react-flow__handle': {
        cursor: 'crosshair',
      },
      '.react-flow__edge-path': {
        strokeWidth: 2,
      },
    },
  },
  components: {
    Tooltip: {
      baseStyle: {
        bg: 'gray.700',
        color: 'white',
        borderRadius: 'md',
        px: 2,
        py: 1,
        fontSize: 'sm',
      },
    },
    Button: {
      defaultProps: {
        size: 'sm',
      },
    },
  },
});

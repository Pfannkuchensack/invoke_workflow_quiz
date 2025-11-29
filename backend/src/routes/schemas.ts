import { Router, type IRouter } from 'express';
import { nodeSchemas } from '../schemas/nodeSchemas.js';

const router: IRouter = Router();

// GET /api/node-schemas - Get all node schemas
router.get('/', (req, res) => {
  res.json({ schemas: nodeSchemas });
});

// GET /api/node-schemas/:type - Get a specific node schema
router.get('/:type', (req, res) => {
  const schema = nodeSchemas[req.params.type];
  if (!schema) {
    return res.status(404).json({ error: 'Node schema not found' });
  }
  res.json({ schema });
});

export { router as schemaRoutes };

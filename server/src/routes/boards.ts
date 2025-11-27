import { Router } from 'express';
import * as boardController from '../controllers/boardController';
import * as itemController from '../controllers/itemController';
import * as connectionController from '../controllers/connectionController';
import { validate } from '../middleware/validation';
import { strictLimiter } from '../middleware/security';
import {
  createBoardSchema,
  updateBoardSchema,
  createItemSchema,
  updateItemSchema,
  createConnectionSchema,
} from '../types/validation';

const router = Router();

// Board routes
router.get('/:id', boardController.getBoard);
router.post('/', strictLimiter, validate(createBoardSchema), boardController.createBoard);
router.patch('/:id', strictLimiter, validate(updateBoardSchema), boardController.updateBoard);
router.delete('/:id', strictLimiter, boardController.deleteBoard);

// Item routes
router.post(
  '/:boardId/items',
  strictLimiter,
  validate(createItemSchema),
  itemController.createItem
);
router.patch(
  '/:boardId/items/:itemId',
  strictLimiter,
  validate(updateItemSchema),
  itemController.updateItem
);
router.delete('/:boardId/items/:itemId', strictLimiter, itemController.deleteItem);

// Connection routes
router.post(
  '/:boardId/connections',
  strictLimiter,
  validate(createConnectionSchema),
  connectionController.createConnection
);
router.delete(
  '/:boardId/connections/:connectionId',
  strictLimiter,
  connectionController.deleteConnection
);

export default router;

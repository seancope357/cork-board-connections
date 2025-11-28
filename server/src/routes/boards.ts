import { Router } from 'express';
import * as boardController from '../controllers/boardController';
import * as itemController from '../controllers/itemController';
import * as connectionController from '../controllers/connectionController';
import { validate } from '../middleware/validation';
import { strictLimiter } from '../middleware/security';
import { authenticateUser } from '../middleware/auth';
import {
  createBoardSchema,
  updateBoardSchema,
  createItemSchema,
  updateItemSchema,
  createConnectionSchema,
} from '../types/validation';

const router = Router();

// Board routes - all require authentication
router.get('/:id', authenticateUser, boardController.getBoard);
router.post(
  '/',
  authenticateUser,
  strictLimiter,
  validate(createBoardSchema),
  boardController.createBoard
);
router.patch(
  '/:id',
  authenticateUser,
  strictLimiter,
  validate(updateBoardSchema),
  boardController.updateBoard
);
router.delete('/:id', authenticateUser, strictLimiter, boardController.deleteBoard);

// Item routes - all require authentication
router.post(
  '/:boardId/items',
  authenticateUser,
  strictLimiter,
  validate(createItemSchema),
  itemController.createItem
);
router.patch(
  '/:boardId/items/:itemId',
  authenticateUser,
  strictLimiter,
  validate(updateItemSchema),
  itemController.updateItem
);
router.delete(
  '/:boardId/items/:itemId',
  authenticateUser,
  strictLimiter,
  itemController.deleteItem
);

// Connection routes - all require authentication
router.post(
  '/:boardId/connections',
  authenticateUser,
  strictLimiter,
  validate(createConnectionSchema),
  connectionController.createConnection
);
router.delete(
  '/:boardId/connections/:connectionId',
  authenticateUser,
  strictLimiter,
  connectionController.deleteConnection
);

export default router;

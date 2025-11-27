import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../middleware/errorHandler';

export const createConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const { fromItemId, toItemId, label, style } = req.body;

    // Verify board exists
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new AppError(404, 'Board not found');
    }

    // Verify both items exist and belong to the board
    const items = await prisma.item.findMany({
      where: {
        id: { in: [fromItemId, toItemId] },
        boardId,
        deletedAt: null,
      },
    });

    if (items.length !== 2) {
      throw new AppError(400, 'Both items must exist and belong to the board');
    }

    if (fromItemId === toItemId) {
      throw new AppError(400, 'Cannot connect an item to itself');
    }

    const connection = await prisma.connection.create({
      data: {
        boardId,
        fromItemId,
        toItemId,
        label,
        style: style || {},
      },
    });

    res.status(201).json({ data: connection });
  } catch (error) {
    next(error);
  }
};

export const deleteConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId, connectionId } = req.params;

    // Verify connection belongs to board
    const existingConnection = await prisma.connection.findFirst({
      where: { id: connectionId, boardId },
    });

    if (!existingConnection) {
      throw new AppError(404, 'Connection not found');
    }

    await prisma.connection.delete({
      where: { id: connectionId },
    });

    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    next(error);
  }
};

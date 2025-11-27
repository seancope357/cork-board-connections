import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../middleware/errorHandler';
import { ItemType } from '@prisma/client';

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const { type, content, x, y, width, height, color, thumbtackColor, zIndex, rotation, metadata } = req.body;

    // Verify board exists
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) {
      throw new AppError(404, 'Board not found');
    }

    const item = await prisma.item.create({
      data: {
        boardId,
        type: type as ItemType,
        content,
        positionX: x,
        positionY: y,
        width,
        height,
        color,
        thumbtackColor,
        zIndex,
        rotation,
        metadata: metadata
          ? {
              create: Object.entries(metadata).map(([key, value]) => ({
                key,
                value: Array.isArray(value) ? JSON.stringify(value) : String(value),
              })),
            }
          : undefined,
      },
      include: {
        metadata: true,
      },
    });

    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId, itemId } = req.params;
    const { content, x, y, width, height, color, thumbtackColor, zIndex, rotation, metadata } = req.body;

    // Verify item belongs to board
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, boardId, deletedAt: null },
    });

    if (!existingItem) {
      throw new AppError(404, 'Item not found');
    }

    const item = await prisma.item.update({
      where: { id: itemId },
      data: {
        content,
        positionX: x,
        positionY: y,
        width,
        height,
        color,
        thumbtackColor,
        zIndex,
        rotation,
      },
      include: {
        metadata: true,
      },
    });

    // Update metadata if provided
    if (metadata) {
      // Delete existing metadata
      await prisma.itemMetadata.deleteMany({
        where: { itemId },
      });

      // Create new metadata
      await prisma.itemMetadata.createMany({
        data: Object.entries(metadata).map(([key, value]) => ({
          itemId,
          key,
          value: Array.isArray(value) ? JSON.stringify(value) : String(value),
        })),
      });
    }

    res.json({ data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId, itemId } = req.params;

    // Verify item belongs to board
    const existingItem = await prisma.item.findFirst({
      where: { id: itemId, boardId, deletedAt: null },
    });

    if (!existingItem) {
      throw new AppError(404, 'Item not found');
    }

    // Soft delete
    await prisma.item.update({
      where: { id: itemId },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

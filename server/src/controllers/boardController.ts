import { Request, Response, NextFunction } from 'express';
import prisma from '../utils/db';
import { AppError } from '../middleware/errorHandler';

export const getBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const board = await prisma.board.findUnique({
      where: { id },
      include: {
        items: {
          where: { deletedAt: null },
          include: {
            metadata: true,
            tags: {
              include: {
                tag: true,
              },
            },
            attachments: true,
          },
        },
        connections: true,
      },
    });

    if (!board) {
      throw new AppError(404, 'Board not found');
    }

    res.json({ data: board });
  } catch (error) {
    next(error);
  }
};

export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;

    const board = await prisma.board.create({
      data: {
        title,
        description,
      },
    });

    res.status(201).json({ data: board });
  } catch (error) {
    next(error);
  }
};

export const updateBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const board = await prisma.board.update({
      where: { id },
      data: {
        title,
        description,
      },
    });

    res.json({ data: board });
  } catch (error) {
    next(error);
  }
};

export const deleteBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.board.delete({
      where: { id },
    });

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    next(error);
  }
};

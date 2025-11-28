import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';
import { AppError } from '../middleware/errorHandler';

export const getBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    // Get board
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (boardError || !board) {
      throw new AppError(404, 'Board not found');
    }

    // Get items (excluding deleted)
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select(`
        *,
        metadata:item_metadata(*),
        tags:item_tags(tag:tags(*)),
        attachments(*)
      `)
      .eq('board_id', id)
      .is('deleted_at', null);

    if (itemsError) {
      throw new AppError(500, 'Failed to fetch items');
    }

    // Get connections
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('*')
      .eq('board_id', id);

    if (connectionsError) {
      throw new AppError(500, 'Failed to fetch connections');
    }

    res.json({
      data: {
        ...board,
        items: items || [],
        connections: connections || [],
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { data: board, error } = await supabase
      .from('boards')
      .insert({
        title,
        description,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new AppError(500, 'Failed to create board');
    }

    res.status(201).json({ data: board });
  } catch (error) {
    next(error);
  }
};

export const updateBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { data: board, error } = await supabase
      .from('boards')
      .update({
        title,
        description,
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error || !board) {
      throw new AppError(404, 'Board not found');
    }

    res.json({ data: board });
  } catch (error) {
    next(error);
  }
};

export const deleteBoard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    const { error } = await supabase
      .from('boards')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw new AppError(404, 'Board not found');
    }

    res.json({ message: 'Board deleted successfully' });
  } catch (error) {
    next(error);
  }
};

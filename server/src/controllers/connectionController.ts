import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';
import { AppError } from '../middleware/errorHandler';

export const createConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const { fromItemId, toItemId, label, style } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    // Verify board exists and belongs to user
    const { data: board, error: boardError } = await supabase
      .from('boards')
      .select('id')
      .eq('id', boardId)
      .eq('user_id', userId)
      .single();

    if (boardError || !board) {
      throw new AppError(404, 'Board not found');
    }

    // Verify both items exist and belong to the board
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('id')
      .in('id', [fromItemId, toItemId])
      .eq('board_id', boardId)
      .is('deleted_at', null);

    if (itemsError || !items || items.length !== 2) {
      throw new AppError(400, 'Both items must exist and belong to the board');
    }

    if (fromItemId === toItemId) {
      throw new AppError(400, 'Cannot connect an item to itself');
    }

    // Create connection
    const { data: connection, error: connectionError } = await supabase
      .from('connections')
      .insert({
        board_id: boardId,
        from_item_id: fromItemId,
        to_item_id: toItemId,
        label,
        style: style || null,
      })
      .select()
      .single();

    if (connectionError) {
      throw new AppError(500, 'Failed to create connection');
    }

    res.status(201).json({ data: connection });
  } catch (error) {
    next(error);
  }
};

export const deleteConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId, connectionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    // Verify connection belongs to user's board
    const { data: existingConnection, error: checkError } = await supabase
      .from('connections')
      .select('id, board_id, boards!inner(user_id)')
      .eq('id', connectionId)
      .eq('board_id', boardId)
      .single();

    if (checkError || !existingConnection) {
      throw new AppError(404, 'Connection not found');
    }

    // Delete connection
    const { error: deleteError } = await supabase
      .from('connections')
      .delete()
      .eq('id', connectionId);

    if (deleteError) {
      throw new AppError(500, 'Failed to delete connection');
    }

    res.json({ message: 'Connection deleted successfully' });
  } catch (error) {
    next(error);
  }
};

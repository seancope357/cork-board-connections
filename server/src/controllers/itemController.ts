import { Request, Response, NextFunction } from 'express';
import { supabase } from '../utils/supabase';
import { AppError } from '../middleware/errorHandler';

export const createItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId } = req.params;
    const { type, content, x, y, width, height, color, thumbtackColor, zIndex, rotation, metadata } =
      req.body;
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

    // Create item
    const { data: item, error: itemError } = await supabase
      .from('items')
      .insert({
        board_id: boardId,
        type,
        content,
        position_x: x,
        position_y: y,
        width,
        height,
        color,
        thumbtack_color: thumbtackColor,
        z_index: zIndex || 0,
        rotation: rotation || 0,
      })
      .select()
      .single();

    if (itemError) {
      throw new AppError(500, 'Failed to create item');
    }

    // Create metadata if provided
    if (metadata && Object.keys(metadata).length > 0) {
      const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
        item_id: item.id,
        key,
        value: Array.isArray(value) ? JSON.stringify(value) : String(value),
      }));

      await supabase.from('item_metadata').insert(metadataEntries);
    }

    res.status(201).json({ data: item });
  } catch (error) {
    next(error);
  }
};

export const updateItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId, itemId } = req.params;
    const { content, x, y, width, height, color, thumbtackColor, zIndex, rotation, metadata } =
      req.body;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    // Verify item belongs to user's board
    const { data: existingItem, error: checkError } = await supabase
      .from('items')
      .select('id, board_id, boards!inner(user_id)')
      .eq('id', itemId)
      .eq('board_id', boardId)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingItem) {
      throw new AppError(404, 'Item not found');
    }

    // Update item
    const updateData: Record<string, unknown> = {};
    if (content !== undefined) updateData.content = content;
    if (x !== undefined) updateData.position_x = x;
    if (y !== undefined) updateData.position_y = y;
    if (width !== undefined) updateData.width = width;
    if (height !== undefined) updateData.height = height;
    if (color !== undefined) updateData.color = color;
    if (thumbtackColor !== undefined) updateData.thumbtack_color = thumbtackColor;
    if (zIndex !== undefined) updateData.z_index = zIndex;
    if (rotation !== undefined) updateData.rotation = rotation;

    const { data: item, error: updateError } = await supabase
      .from('items')
      .update(updateData)
      .eq('id', itemId)
      .select()
      .single();

    if (updateError) {
      throw new AppError(500, 'Failed to update item');
    }

    // Update metadata if provided
    if (metadata) {
      // Delete existing metadata
      await supabase.from('item_metadata').delete().eq('item_id', itemId);

      // Create new metadata
      if (Object.keys(metadata).length > 0) {
        const metadataEntries = Object.entries(metadata).map(([key, value]) => ({
          item_id: itemId,
          key,
          value: Array.isArray(value) ? JSON.stringify(value) : String(value),
        }));

        await supabase.from('item_metadata').insert(metadataEntries);
      }
    }

    res.json({ data: item });
  } catch (error) {
    next(error);
  }
};

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { boardId, itemId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Unauthorized');
    }

    // Verify item belongs to user's board
    const { data: existingItem, error: checkError } = await supabase
      .from('items')
      .select('id, board_id, boards!inner(user_id)')
      .eq('id', itemId)
      .eq('board_id', boardId)
      .is('deleted_at', null)
      .single();

    if (checkError || !existingItem) {
      throw new AppError(404, 'Item not found');
    }

    // Soft delete
    const { error: deleteError } = await supabase
      .from('items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId);

    if (deleteError) {
      throw new AppError(500, 'Failed to delete item');
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    next(error);
  }
};

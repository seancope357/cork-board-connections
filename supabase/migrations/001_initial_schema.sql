-- Create enum for item types
CREATE TYPE item_type AS ENUM ('note', 'image', 'text', 'shape');

-- Create boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create items table
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  type item_type NOT NULL,
  content TEXT NOT NULL,
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  z_index INTEGER NOT NULL DEFAULT 0,
  rotation REAL NOT NULL DEFAULT 0,
  color TEXT,
  thumbtack_color TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_items_board_id ON items(board_id);
CREATE INDEX idx_items_position ON items(position_x, position_y);
CREATE INDEX idx_items_deleted_at ON items(deleted_at) WHERE deleted_at IS NULL;

-- Create item_metadata table
CREATE TABLE item_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_item_metadata_item_id ON item_metadata(item_id);
CREATE UNIQUE INDEX idx_item_metadata_unique ON item_metadata(item_id, key);

-- Create tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create item_tags junction table
CREATE TABLE item_tags (
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (item_id, tag_id)
);

CREATE INDEX idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX idx_item_tags_tag_id ON item_tags(tag_id);

-- Create attachments table
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_item_id ON attachments(item_id);

-- Create connections table
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  from_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  to_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  style JSONB,
  label TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (from_item_id, to_item_id)
);

CREATE INDEX idx_connections_board_id ON connections(board_id);
CREATE INDEX idx_connections_from_item ON connections(from_item_id);
CREATE INDEX idx_connections_to_item ON connections(to_item_id);

-- Enable Row Level Security
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for boards
CREATE POLICY "Users can view their own boards"
  ON boards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards"
  ON boards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards"
  ON boards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards"
  ON boards FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for items
CREATE POLICY "Users can view items in their boards"
  ON items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = items.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create items in their boards"
  ON items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = items.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update items in their boards"
  ON items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = items.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete items in their boards"
  ON items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = items.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- RLS Policies for item_metadata
CREATE POLICY "Users can manage metadata for items in their boards"
  ON item_metadata FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN boards ON boards.id = items.board_id
      WHERE items.id = item_metadata.item_id
      AND boards.user_id = auth.uid()
    )
  );

-- RLS Policies for tags (all users can read, only owners can manage)
CREATE POLICY "Anyone can view tags"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON tags FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- RLS Policies for item_tags
CREATE POLICY "Users can manage tags for items in their boards"
  ON item_tags FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN boards ON boards.id = items.board_id
      WHERE items.id = item_tags.item_id
      AND boards.user_id = auth.uid()
    )
  );

-- RLS Policies for attachments
CREATE POLICY "Users can manage attachments for items in their boards"
  ON attachments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM items
      JOIN boards ON boards.id = items.board_id
      WHERE items.id = attachments.item_id
      AND boards.user_id = auth.uid()
    )
  );

-- RLS Policies for connections
CREATE POLICY "Users can view connections in their boards"
  ON connections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = connections.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create connections in their boards"
  ON connections FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = connections.board_id
      AND boards.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete connections in their boards"
  ON connections FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boards
      WHERE boards.id = connections.board_id
      AND boards.user_id = auth.uid()
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

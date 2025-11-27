-- Cork Board for Connections Database Schema
-- Run this SQL in your Supabase SQL Editor to create the necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Boards table
CREATE TABLE IF NOT EXISTS boards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items table (notes and images)
CREATE TABLE IF NOT EXISTS items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('note', 'image')),
    content TEXT NOT NULL,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION DEFAULT 200,
    height DOUBLE PRECISION DEFAULT 150,
    color TEXT,
    thumbtack_color TEXT,
    metadata JSONB,
    files JSONB,
    z_index INTEGER,
    rotation DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connections table (red string lines between items)
CREATE TABLE IF NOT EXISTS connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
    from_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    to_item_id UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    style JSONB,
    label TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_items_board_id ON items(board_id);
CREATE INDEX IF NOT EXISTS idx_connections_board_id ON connections(board_id);
CREATE INDEX IF NOT EXISTS idx_connections_from_item ON connections(from_item_id);
CREATE INDEX IF NOT EXISTS idx_connections_to_item ON connections(to_item_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers to auto-update updated_at
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Public access policies (you can make these more restrictive with auth later)
CREATE POLICY "Public boards are viewable by everyone"
    ON boards FOR SELECT
    USING (true);

CREATE POLICY "Public boards are insertable by everyone"
    ON boards FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public boards are updatable by everyone"
    ON boards FOR UPDATE
    USING (true);

CREATE POLICY "Public boards are deletable by everyone"
    ON boards FOR DELETE
    USING (true);

CREATE POLICY "Public items are viewable by everyone"
    ON items FOR SELECT
    USING (true);

CREATE POLICY "Public items are insertable by everyone"
    ON items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public items are updatable by everyone"
    ON items FOR UPDATE
    USING (true);

CREATE POLICY "Public items are deletable by everyone"
    ON items FOR DELETE
    USING (true);

CREATE POLICY "Public connections are viewable by everyone"
    ON connections FOR SELECT
    USING (true);

CREATE POLICY "Public connections are insertable by everyone"
    ON connections FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Public connections are updatable by everyone"
    ON connections FOR UPDATE
    USING (true);

CREATE POLICY "Public connections are deletable by everyone"
    ON connections FOR DELETE
    USING (true);

-- Insert a default board for testing
INSERT INTO boards (title, description) VALUES
    ('My Conspiracy Board', 'Connecting the dots...')
ON CONFLICT DO NOTHING;

-- Enable full-text search extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create channels table
CREATE TABLE channels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  type TEXT CHECK (type IN ('text', 'voice', 'announcement')) DEFAULT 'text',
  position INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table with full-text search
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  channel_id TEXT REFERENCES channels(id) ON DELETE CASCADE,
  author_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  author_username TEXT NOT NULL,
  content TEXT NOT NULL,
  message_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  attachments JSONB DEFAULT '[]',
  embeds JSONB DEFAULT '[]',
  mentions JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create full-text search index on messages
CREATE INDEX messages_content_fts_idx ON messages USING gin(to_tsvector('english', content));
CREATE INDEX messages_author_fts_idx ON messages USING gin(to_tsvector('english', author_username));

-- Create indexes for performance
CREATE INDEX idx_messages_channel_id ON messages(channel_id);
CREATE INDEX idx_messages_author_id ON messages(author_id);
CREATE INDEX idx_messages_timestamp ON messages(message_timestamp);
CREATE INDEX idx_channels_category ON channels(category);

-- Create RLS policies (will be enabled later)
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create function for full-text search
CREATE OR REPLACE FUNCTION search_messages(search_term TEXT)
RETURNS TABLE (
  id TEXT,
  channel_id TEXT,
  author_id TEXT,
  author_username TEXT,
  content TEXT,
  message_timestamp TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.channel_id,
    m.author_id,
    m.author_username,
    m.content,
    m.message_timestamp,
    ts_rank(to_tsvector('english', m.content), plainto_tsquery('english', search_term)) as rank
  FROM messages m
  WHERE to_tsvector('english', m.content) @@ plainto_tsquery('english', search_term)
  ORDER BY rank DESC;
END;
$$ LANGUAGE plpgsql;

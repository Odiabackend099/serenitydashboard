-- Add intent column to conversations table
-- This column stores the detected intent/purpose of the conversation
-- Used by N8N workflows to categorize incoming calls/messages

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS intent TEXT;

-- Add comment to document the column
COMMENT ON COLUMN conversations.intent IS 'Detected intent or purpose of the conversation (e.g., appointment_booking, general_inquiry, emergency, etc.)';

-- Create index for faster filtering by intent
CREATE INDEX IF NOT EXISTS idx_conversations_intent ON conversations(intent);

# N8N Field Mapping Solution

## ✅ **Problem Identified**

Your `messages` table has these fields:
- `id` (auto-generated)
- `conversation_id` ✅ 
- `from_type` 
- `body` (this is your "content" field)
- `media_url`
- `created_at` (auto-generated)

But n8n is expecting:
- `conversation_id` ✅ (exists)
- `content` ❌ (doesn't exist, but `body` is the equivalent)
- `sender` ❌ (doesn't exist, but `from_type` is the equivalent)
- `channel` ❌ (doesn't exist)

## 🎯 **Solution Options**

### **Option 1: Use Existing Fields (Quick Fix)** ⭐ **RECOMMENDED**

Map to the fields that actually exist in your table:

**Field 1:**
- **Field Name:** `conversation_id`
- **Value:** `{{$json.body.conversation_id}}`

**Field 2:**
- **Field Name:** `body`
- **Value:** `{{$json.body.message}}` (maps to content)

**Field 3:**
- **Field Name:** `from_type`
- **Value:** `assistant` (for AI responses) or `user` (for user messages)

**Field 4:** *(Optional)*
- **Field Name:** `media_url`
- **Value:** Leave empty or map if you have media

### **Option 2: Alter Table Structure (Advanced)**

If you want the exact field names n8n expects, you can modify your table:

```sql
-- Add missing columns
ALTER TABLE messages 
ADD COLUMN content TEXT,
ADD COLUMN sender VARCHAR(50),
ADD COLUMN channel VARCHAR(50);

-- Copy data from existing columns
UPDATE messages 
SET content = body, 
    sender = from_type,
    channel = 'web';

-- Make new columns required if needed
ALTER TABLE messages 
ALTER COLUMN content SET NOT NULL,
ALTER COLUMN sender SET NOT NULL;
```

## 🔧 **N8N Configuration Steps**

### **Step 1: Update Your N8N Workflow**

1. **Find the "Insert Message" or "Create Row" node**
2. **Update the field mappings:**

```
conversation_id: {{$json.body.conversation_id}}
body: {{$json.body.message}}
from_type: assistant
media_url: (leave empty or map if needed)
```

### **Step 2: Test the Configuration**

1. **Send a test message** through your AI assistant
2. **Check the database** to see if the message was inserted
3. **Verify the conversation flow** works correctly

## 📋 **Complete Field Mapping Reference**

| N8N Expected | Your Table Field | Value Mapping |
|--------------|------------------|---------------|
| `conversation_id` | `conversation_id` | `{{$json.body.conversation_id}}` ✅ |
| `content` | `body` | `{{$json.body.message}}` ✅ |
| `sender` | `from_type` | `assistant` or `user` ✅ |
| `channel` | *(missing)* | Not required for basic functionality |

## 🧪 **Testing Script**

Use this script to test your field mapping:

```javascript
// test-field-mapping.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://yfrpxqvjshwaaomgcaoq.supabase.co',
  'your-anon-key'
);

async function testFieldMapping() {
  const testData = {
    conversation_id: 'test-conv-123',
    body: 'Hello, this is a test message!',
    from_type: 'assistant'
  };

  const { data, error } = await supabase
    .from('messages')
    .insert([testData]);

  if (error) {
    console.error('❌ Insert failed:', error);
  } else {
    console.log('✅ Insert successful:', data);
  }
}

testFieldMapping();
```

## ⚠️ **Important Notes**

1. **Don't change the table structure** unless you're comfortable with database migrations
2. **Use Option 1** (field mapping) for immediate functionality
3. **Test thoroughly** before deploying to production
4. **Document your mapping** for future reference

## 🚀 **Next Steps**

1. ✅ **Update your n8n workflow** with the correct field mappings
2. ✅ **Test a conversation** to ensure messages are stored correctly
3. ✅ **Verify the AI assistant** can retrieve conversation history
4. ✅ **Deploy to production** once testing is complete

## 📞 **Need Help?**

If you encounter issues:
1. Check the n8n execution logs for specific errors
2. Verify your Supabase connection is working
3. Test the field mapping script above
4. Check that `conversation_id` exists in your `conversations` table
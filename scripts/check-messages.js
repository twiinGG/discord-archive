const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkMessages() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*');

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }

    console.log('Total messages:', messages?.length || 0);
    
    const nullChannelMessages = messages?.filter(m => !m.channel_id) || [];
    console.log('Messages with null channel_id:', nullChannelMessages.length);
    
    if (messages && messages.length > 0) {
      console.log('Sample message channel_id:', messages[0].channel_id);
      console.log('Sample message content:', messages[0].content.substring(0, 50) + '...');
    }

    // Check messages for damo-labs channel
    const damoLabsMessages = messages?.filter(m => m.channel_id === '998527456925462549') || [];
    console.log('Damo-labs messages:', damoLabsMessages.length);

  } catch (error) {
    console.error('Failed to check messages:', error);
  }
}

checkMessages();

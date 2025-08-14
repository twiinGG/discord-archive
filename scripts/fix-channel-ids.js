const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function fixChannelIds() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔧 Fixing channel IDs for damo-labs messages...');
    
    // Update all messages with null channel_id to damo-labs channel
    const { data, error } = await supabase
      .from('messages')
      .update({ channel_id: '998527456925462549' })
      .is('channel_id', null);

    if (error) {
      console.error('Error updating messages:', error);
      return;
    }

    console.log('✅ Updated messages:', data?.length || 0);

    // Verify the fix
    const { data: messages, error: checkError } = await supabase
      .from('messages')
      .select('*');

    if (checkError) {
      console.error('Error checking messages:', checkError);
      return;
    }

    const damoLabsMessages = messages?.filter(m => m.channel_id === '998527456925462549') || [];
    const nullChannelMessages = messages?.filter(m => !m.channel_id) || [];
    
    console.log('📊 After fix:');
    console.log('  Total messages:', messages?.length || 0);
    console.log('  Damo-labs messages:', damoLabsMessages.length);
    console.log('  Messages with null channel_id:', nullChannelMessages.length);

  } catch (error) {
    console.error('Failed to fix channel IDs:', error);
  }
}

fixChannelIds();

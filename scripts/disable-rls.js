const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function disableRLS() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔧 Disabling RLS for testing...');

    // Disable RLS on all tables
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE channels DISABLE ROW LEVEL SECURITY;
        ALTER TABLE users DISABLE ROW LEVEL SECURITY;
        ALTER TABLE messages DISABLE ROW LEVEL SECURITY;
      `
    });

    console.log('✅ RLS disabled successfully!');

    // Test if we can read data now
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*');
    
    console.log('Channels test:', channelsError ? 'Failed' : 'Success', channels?.length || 0);
    
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('channel_id', '998527456925462549');
    
    console.log('Damo-labs messages test:', messagesError ? 'Failed' : 'Success', messages?.length || 0);

  } catch (error) {
    console.error('❌ Failed to disable RLS:', error);
  }
}

disableRLS();

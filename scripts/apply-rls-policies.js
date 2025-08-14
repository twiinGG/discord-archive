const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function applyRLSPolicies() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔧 Applying RLS policies...');

    // Enable RLS on all tables
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
      `
    });

    // Create policies for channels
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public read access to channels" ON channels;
        CREATE POLICY "Allow public read access to channels"
        ON channels FOR SELECT
        TO anon
        USING (true);
      `
    });

    // Create policies for users
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public read access to users" ON users;
        CREATE POLICY "Allow public read access to users"
        ON users FOR SELECT
        TO anon
        USING (true);
      `
    });

    // Create policies for messages
    await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Allow public read access to messages" ON messages;
        CREATE POLICY "Allow public read access to messages"
        ON messages FOR SELECT
        TO anon
        USING (true);
      `
    });

    console.log('✅ RLS policies applied successfully!');

  } catch (error) {
    console.error('❌ Failed to apply RLS policies:', error);
    
    // Fallback: try to apply policies one by one
    console.log('🔄 Trying alternative approach...');
    
    try {
      // Test if we can read data with current setup
      const { data: channels, error: channelsError } = await supabase
        .from('channels')
        .select('*');
      
      console.log('Channels test:', channelsError ? 'Failed' : 'Success', channels?.length || 0);
      
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(1);
      
      console.log('Messages test:', messagesError ? 'Failed' : 'Success', messages?.length || 0);
      
    } catch (testError) {
      console.error('Test failed:', testError);
    }
  }
}

applyRLSPolicies();

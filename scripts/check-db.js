const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    console.log('🔍 Checking database...\n');

    // Check channels
    const { data: channels, error: channelsError } = await supabase
      .from('channels')
      .select('*');
    
    if (channelsError) {
      console.error('❌ Channels error:', channelsError);
    } else {
      console.log(`📋 Channels: ${channels?.length || 0}`);
      if (channels && channels.length > 0) {
        channels.forEach(channel => {
          console.log(`   - #${channel.name} (${channel.id})`);
        });
      }
    }

    // Check users
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*');
    
    if (usersError) {
      console.error('❌ Users error:', usersError);
    } else {
      console.log(`\n👥 Users: ${users?.length || 0}`);
      if (users && users.length > 0) {
        users.forEach(user => {
          console.log(`   - ${user.username} (${user.id})`);
        });
      }
    }

    // Check messages
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*');
    
    if (messagesError) {
      console.error('❌ Messages error:', messagesError);
    } else {
      console.log(`\n💬 Messages: ${messages?.length || 0}`);
      if (messages && messages.length > 0) {
        messages.forEach(message => {
          console.log(`   - ${message.author_username}: "${message.content.substring(0, 50)}..."`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Database check failed:', error.message);
  }
}

checkDatabase();

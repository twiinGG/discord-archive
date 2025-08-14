#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const DiscordExporter = require('./export-discord');
const SupabaseImporter = require('./import-to-supabase');

async function testExport() {
  console.log('🚀 Starting Discord Archive Test Export...\n');

  // Check required environment variables
  const requiredEnvVars = [
    'DISCORD_BOT_TOKEN',
    'DISCORD_GUILD_ID',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => console.error(`   - ${varName}`));
    console.log('\nPlease update your .env.local file with the missing variables.');
    process.exit(1);
  }

  try {
    // Initialize exporters
    const exporter = new DiscordExporter();
    const importer = new SupabaseImporter();

    console.log('📋 Test Export Configuration:');
    console.log(`   - Guild ID: ${process.env.DISCORD_GUILD_ID}`);
    console.log(`   - Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log(`   - Token Type: ${process.env.DISCORD_USER_TOKEN ? 'User Token' : 'Bot Token'}`);
    console.log('   - Export Type: Single channel test\n');

    // Step 1: List available channels
    console.log('🔍 Step 1: Fetching available channels...');
    const channels = await exporter.listChannels();
    
    if (!channels || channels.length === 0) {
      console.error('❌ No channels found. Please check:');
      console.error('   - Bot has access to the server');
      console.error('   - Bot has "Read Message History" permission');
      console.error('   - Guild ID is correct');
      process.exit(1);
    }

    console.log(`✅ Found ${channels.length} channels:`);
    channels.slice(0, 5).forEach((channel, index) => {
      console.log(`   ${index + 1}. #${channel.name} (${channel.id})`);
    });
    if (channels.length > 5) {
      console.log(`   ... and ${channels.length - 5} more channels`);
    }

    // Step 2: Select a small channel for testing
    // Try the rules channel first as it's typically accessible
    const testChannel = channels.find(channel => 
      channel.id === '923736705926840403' // #⚖｜rules
    ) || channels.find(channel => 
      channel.name.toLowerCase().includes('rules') && channel.type === 0
    ) || channels.find(channel => 
      channel.name.toLowerCase().includes('faq') && channel.type === 0
    ) || channels.find(channel => 
      channel.name.toLowerCase().includes('links') && channel.type === 0
    ) || channels.find(channel => 
      channel.type === 0 // Any text channel
    ) || channels[0];

    console.log(`\n🎯 Step 2: Selected test channel: #${testChannel.name} (${testChannel.id})`);

    // Step 3: Export single channel
    console.log('\n📤 Step 3: Exporting channel data...');
    console.log(`   Channel: #${testChannel.name} (${testChannel.id})`);
    console.log(`   This may take a few minutes depending on message count...`);
    
    const exportFilePath = await Promise.race([
      exporter.exportChannel(testChannel.id),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Export timed out after 2 minutes')), 2 * 60 * 1000)
      )
    ]);
    
    // Parse the exported JSON file
    console.log('📄 Processing exported data...');
    const jsonData = await exporter.parseJsonExport(exportFilePath);
    const exportData = await exporter.processExportData(jsonData);
    
    if (!exportData || !exportData.messages || exportData.messages.length === 0) {
      console.log('⚠️  No messages found in this channel. This might be normal for new channels.');
      console.log('   Proceeding with empty dataset for testing...');
    } else {
      console.log(`✅ Exported ${exportData.messages.length} messages`);
      console.log(`✅ Exported ${exportData.channels.length} channels`);
      console.log(`✅ Exported ${exportData.users.length} users`);
    }

    // Step 4: Import to Supabase
    console.log('\n📥 Step 4: Importing to Supabase...');
    const importStats = await importer.importFromData(exportData);
    
    console.log('\n📊 Import Results:');
    console.log(`   - Channels: ${importStats.channels} imported`);
    console.log(`   - Users: ${importStats.users} imported`);
    console.log(`   - Messages: ${importStats.messages} imported`);

    // Step 5: Verify data in database
    console.log('\n🔍 Step 5: Verifying data in database...');
    const verificationStats = await importer.getStats();
    
    console.log('\n📈 Database Statistics:');
    console.log(`   - Total channels: ${verificationStats.channels}`);
    console.log(`   - Total users: ${verificationStats.users}`);
    console.log(`   - Total messages: ${verificationStats.messages}`);

    console.log('\n🎉 Test export completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Test the web interface: npm run dev');
    console.log('2. Visit http://localhost:3000 to see your archive');
    console.log('3. Try searching for messages in the test channel');
    console.log('4. If everything works, proceed with full server export');

  } catch (error) {
    console.error('\n❌ Test export failed:');
    console.error(error.message);
    
    if (error.message.includes('401')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your Discord bot token');
      console.error('   - Ensure bot is added to the server');
      console.error('   - Verify bot has proper permissions');
    } else if (error.message.includes('403')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Bot needs "Read Message History" permission');
      console.error('   - Check channel permissions');
    } else if (error.message.includes('Supabase')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check Supabase service role key');
      console.error('   - Verify database connection');
    }
    
    process.exit(1);
  }
}

// Run test export if called directly
if (require.main === module) {
  testExport();
}

module.exports = { testExport };

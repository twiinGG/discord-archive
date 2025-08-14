require('dotenv').config({ path: '.env.local' });
const DiscordExporter = require('./export-discord');
const SupabaseImporter = require('./import-to-supabase');
const path = require('path');

async function main() {
  console.log('🚀 Starting Discord Archive Export Process...\n');

  // Check required environment variables
  const requiredEnvVars = [
    'DISCORD_BOT_TOKEN',
    'DISCORD_GUILD_ID',
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`❌ Missing required environment variable: ${envVar}`);
      console.log('Please check your .env.local file');
      process.exit(1);
    }
  }

  try {
    // Initialize exporters
    const discordExporter = new DiscordExporter({
      token: process.env.DISCORD_BOT_TOKEN
    });

    const supabaseImporter = new SupabaseImporter();

    // Ensure export directory exists
    await discordExporter.ensureExportDir();

    console.log('📋 Configuration:');
    console.log(`   Guild ID: ${process.env.DISCORD_GUILD_ID}`);
    console.log(`   Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`);
    console.log('');

    // Step 1: Export Discord data
    console.log('📤 Step 1: Exporting Discord data...');
    const exportPath = await discordExporter.exportGuild(
      process.env.DISCORD_GUILD_ID,
      'json'
    );

    // Step 2: Process the export data
    console.log('\n🔄 Step 2: Processing export data...');
    const jsonData = await discordExporter.parseJsonExport(exportPath);
    const processedData = await discordExporter.processExportData(jsonData);

    console.log(`   Channels: ${processedData.channels.length}`);
    console.log(`   Users: ${processedData.users.length}`);
    console.log(`   Messages: ${processedData.messages.length}`);

    // Step 3: Import to Supabase
    console.log('\n📥 Step 3: Importing to Supabase...');
    await supabaseImporter.importChannels(processedData.channels);
    await supabaseImporter.importUsers(processedData.users);
    await supabaseImporter.importMessages(processedData.messages);

    // Step 4: Get final stats
    console.log('\n📊 Step 4: Final statistics...');
    const stats = await supabaseImporter.getStats();
    
    console.log('\n✅ Export and import completed successfully!');
    console.log('\n📈 Database Statistics:');
    console.log(`   Channels: ${stats.channels}`);
    console.log(`   Users: ${stats.users}`);
    console.log(`   Messages: ${stats.messages}`);
    console.log('\n🎉 Your Discord archive is now ready!');
    console.log('   You can start the web application with: npm run dev');

  } catch (error) {
    console.error('\n❌ Error during export process:', error);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

main();

const https = require('https');

async function listChannels() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !guildId) {
    console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID in environment');
    process.exit(1);
  }

  const options = {
    hostname: 'discord.com',
    port: 443,
    path: `/api/v10/guilds/${guildId}/channels`,
    method: 'GET',
    headers: {
      'Authorization': `Bot ${token}`,
      'Content-Type': 'application/json'
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const channels = JSON.parse(data);
            resolve(channels);
          } catch (error) {
            reject(new Error(`Failed to parse response: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function main() {
  try {
    console.log('🔍 Fetching channels from Discord server...');
    const channels = await listChannels();
    
    console.log(`✅ Found ${channels.length} channels:\n`);
    
    channels.forEach((channel, index) => {
      const type = channel.type === 0 ? 'text' : channel.type === 2 ? 'voice' : channel.type === 4 ? 'category' : 'other';
      console.log(`${index + 1}. #${channel.name} (${channel.id}) [${type}]`);
    });

    // Find a good test channel
    const testChannels = channels.filter(channel => 
      channel.type === 0 && // text channels only
      (channel.name.toLowerCase().includes('general') || 
       channel.name.toLowerCase().includes('welcome') ||
       channel.name.toLowerCase().includes('announcements') ||
       channel.name.toLowerCase().includes('chat'))
    );

    if (testChannels.length > 0) {
      console.log(`\n🎯 Recommended test channel: #${testChannels[0].name} (${testChannels[0].id})`);
    } else {
      console.log(`\n🎯 First text channel: #${channels.find(c => c.type === 0)?.name} (${channels.find(c => c.type === 0)?.id})`);
    }

  } catch (error) {
    console.error('❌ Failed to fetch channels:', error.message);
    
    if (error.message.includes('401')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your Discord bot token');
      console.error('   - Ensure bot is added to the server');
    } else if (error.message.includes('403')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Bot needs "View Channels" permission');
    } else if (error.message.includes('404')) {
      console.error('\n💡 Troubleshooting:');
      console.error('   - Check your Guild ID is correct');
    }
    
    process.exit(1);
  }
}

if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  main();
}

module.exports = { listChannels };

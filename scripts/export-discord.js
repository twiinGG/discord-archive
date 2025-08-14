const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class DiscordExporter {
  constructor() {
    this.exportDir = path.join(__dirname, '../exports');
    // Prefer user token over bot token for better access
    this.token = process.env.DISCORD_USER_TOKEN || process.env.DISCORD_BOT_TOKEN;
    this.guildId = process.env.DISCORD_GUILD_ID;
    this.isUserToken = !!process.env.DISCORD_USER_TOKEN;
  }

  async ensureExportDir() {
    try {
      await fs.mkdir(this.exportDir, { recursive: true });
    } catch (error) {
      console.log('Export directory already exists');
    }
  }

  async downloadDiscordChatExporter() {
    const platform = process.platform;
    const arch = process.arch;
    
    let downloadUrl;
    if (platform === 'darwin') {
      downloadUrl = 'https://github.com/Tyrrrz/DiscordChatExporter/releases/latest/download/DiscordChatExporter.Cli.osx-x64.zip';
    } else if (platform === 'win32') {
      downloadUrl = 'https://github.com/Tyrrrz/DiscordChatExporter/releases/latest/download/DiscordChatExporter.Cli.win-x64.zip';
    } else {
      downloadUrl = 'https://github.com/Tyrrrz/DiscordChatExporter/releases/latest/download/DiscordChatExporter.Cli.linux-x64.zip';
    }

    console.log('Downloading DiscordChatExporter...');
    // This would need to be implemented with actual download logic
    // For now, we'll assume it's installed via Docker or manually
  }

  async listChannels() {
    const { listChannels } = require('./list-channels');
    return await listChannels();
  }

  async exportChannel(channelId, outputFormat = 'json') {
    const outputPath = path.join(this.exportDir, `channel_${channelId}.${outputFormat}`);
    
    // Use Docker to run DiscordChatExporter
    // For user tokens, we need to use --token instead of -t
    const tokenFlag = this.isUserToken ? '--token' : '-t';
    const dockerCommand = `docker run --rm -v "${this.exportDir}:/out" tyrrrz/discordchatexporter:latest export ${tokenFlag} ${this.token} -c ${channelId} -o "/out/channel_${channelId}.${outputFormat}" -f ${outputFormat}`;
    
    console.log(`🔄 Starting export for channel ${channelId}...`);
    console.log(`   Command: docker run --rm -v "${this.exportDir}:/out" tyrrrz/discordchatexporter:latest export -t [TOKEN] -c ${channelId} -o "/out/channel_${channelId}.${outputFormat}" -f ${outputFormat}`);
    
    return new Promise((resolve, reject) => {
      const child = exec(dockerCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`❌ Error exporting channel ${channelId}:`, error.message);
          if (stderr) {
            console.error(`   Docker stderr: ${stderr}`);
          }
          reject(error);
          return;
        }
        
        if (stdout) {
          console.log(`📄 Docker stdout: ${stdout}`);
        }
        
        console.log(`✅ Successfully exported channel ${channelId} to ${outputPath}`);
        resolve(outputPath);
      });
      
      // Add progress indicator
      let dots = 0;
      const progressInterval = setInterval(() => {
        dots = (dots + 1) % 4;
        process.stdout.write(`\r🔄 Exporting${'.'.repeat(dots)}`);
      }, 500);
      
      child.on('close', (code) => {
        clearInterval(progressInterval);
        process.stdout.write('\r'); // Clear the progress line
      });
    });
  }

  async exportGuild(guildId, outputFormat = 'json') {
    const outputPath = path.join(this.exportDir, `guild_${guildId}.${outputFormat}`);
    
    // Use Docker to run DiscordChatExporter
    // For user tokens, we need to use --token instead of -t
    const tokenFlag = this.isUserToken ? '--token' : '-t';
    const dockerCommand = `docker run --rm -v "${this.exportDir}:/out" tyrrrz/discordchatexporter:latest export ${tokenFlag} ${this.token} -g ${guildId} -o "/out/guild_${guildId}.${outputFormat}" -f ${outputFormat}`;
    
    return new Promise((resolve, reject) => {
      exec(dockerCommand, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error exporting guild ${guildId}:`, error);
          reject(error);
          return;
        }
        console.log(`Successfully exported guild ${guildId} to ${outputPath}`);
        resolve(outputPath);
      });
    });
  }

  async parseJsonExport(filePath) {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  }

  async processExportData(jsonData) {
    const channels = [];
    const users = new Map();
    const messages = [];

    // Process channel (single channel export)
    if (jsonData.channel) {
      channels.push({
        id: jsonData.channel.id,
        name: jsonData.channel.name,
        category: jsonData.channel.category || null,
        type: jsonData.channel.type || 'text',
        position: jsonData.channel.position || 0
      });
    }
    // Process multiple channels (guild export)
    else if (jsonData.channels) {
      for (const channel of jsonData.channels) {
        channels.push({
          id: channel.id,
          name: channel.name,
          category: channel.category || null,
          type: channel.type || 'text',
          position: channel.position || 0
        });
      }
    }

    // Get the channel ID for this export
    const channelId = jsonData.channel?.id || null;

    // Process messages and users
    if (jsonData.messages) {
      for (const message of jsonData.messages) {
        // Extract user info
        if (message.author) {
          users.set(message.author.id, {
            id: message.author.id,
            username: message.author.name,
            display_name: message.author.discriminator ? `${message.author.name}#${message.author.discriminator}` : message.author.name,
            avatar_url: message.author.avatarUrl || null
          });
        }

        // Process message
        messages.push({
          id: message.id,
          channel_id: channelId, // Use the channel ID from the export
          author_id: message.author?.id,
          author_username: message.author?.name || 'Unknown',
          content: message.content || '',
          message_timestamp: message.timestamp,
          attachments: message.attachments || [],
          embeds: message.embeds || [],
          mentions: message.mentions || []
        });
      }
    }

    return {
      channels: Array.from(channels),
      users: Array.from(users.values()),
      messages: messages
    };
  }
}

module.exports = DiscordExporter;

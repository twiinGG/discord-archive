const DiscordExporter = require('./export-discord');
const SupabaseImporter = require('./import-to-supabase');
require('dotenv').config({ path: '.env.local' });

class EnhancedExporter {
  constructor() {
    this.exporter = new DiscordExporter();
    this.importer = new SupabaseImporter();
    this.results = {
      successful: [],
      failed: [],
      restricted: [],
      stats: {
        totalChannels: 0,
        exportedChannels: 0,
        exportedMessages: 0,
        exportedUsers: 0,
        restrictedChannels: 0,
        failedChannels: 0
      }
    };
  }

  async exportWithFallback(channels, options = {}) {
    const {
      maxConcurrent = 1,
      timeout = 5 * 60 * 1000, // 5 minutes
      skipRestricted = false
    } = options;

    console.log(`🚀 Starting enhanced export of ${channels.length} channels...`);
    console.log(`   Max concurrent: ${maxConcurrent}`);
    console.log(`   Timeout: ${timeout / 1000}s per channel`);
    console.log(`   Skip restricted: ${skipRestricted}\n`);

    this.results.stats.totalChannels = channels.length;

    // Process channels in batches
    for (let i = 0; i < channels.length; i += maxConcurrent) {
      const batch = channels.slice(i, i + maxConcurrent);
      const promises = batch.map(channel => this.exportChannel(channel, timeout));
      
      await Promise.allSettled(promises);
      
      // Progress update
      const progress = ((i + batch.length) / channels.length * 100).toFixed(1);
      console.log(`📊 Progress: ${progress}% (${i + batch.length}/${channels.length})`);
    }

    return this.results;
  }

  async exportChannel(channel, timeout) {
    const channelInfo = `${channel.name} (${channel.id})`;
    
    try {
      console.log(`🔄 Exporting #${channelInfo}...`);
      
      // Export with timeout
      const exportFilePath = await Promise.race([
        this.exporter.exportChannel(channel.id),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Export timed out')), timeout)
        )
      ]);

      // Process the exported data
      const jsonData = await this.exporter.parseJsonExport(exportFilePath);
      const processedData = await this.exporter.processExportData(jsonData);

      // Import to database
      const importStats = await this.importer.importFromData(processedData);

      // Update results
      this.results.successful.push({
        channel,
        messages: processedData.messages.length,
        users: processedData.users.length,
        importStats
      });

      this.results.stats.exportedChannels++;
      this.results.stats.exportedMessages += processedData.messages.length;
      this.results.stats.exportedUsers += processedData.users.length;

      console.log(`✅ #${channelInfo}: ${processedData.messages.length} messages, ${processedData.users.length} users`);

    } catch (error) {
      if (error.message.includes('forbidden') || error.message.includes('403')) {
        console.log(`🚫 #${channelInfo}: Access forbidden (restricted channel)`);
        this.results.restricted.push(channel);
        this.results.stats.restrictedChannels++;
      } else if (error.message.includes('timed out')) {
        console.log(`⏰ #${channelInfo}: Export timed out`);
        this.results.failed.push({ channel, error: 'Timeout' });
        this.results.stats.failedChannels++;
      } else {
        console.log(`❌ #${channelInfo}: ${error.message}`);
        this.results.failed.push({ channel, error: error.message });
        this.results.stats.failedChannels++;
      }
    }
  }

  generateReport() {
    const { stats } = this.results;
    
    console.log('\n📊 Export Report');
    console.log('='.repeat(50));
    console.log(`Total Channels: ${stats.totalChannels}`);
    console.log(`✅ Successfully Exported: ${stats.exportedChannels}`);
    console.log(`🚫 Restricted Access: ${stats.restrictedChannels}`);
    console.log(`❌ Failed: ${stats.failedChannels}`);
    console.log(`📨 Total Messages: ${stats.exportedMessages}`);
    console.log(`👥 Total Users: ${stats.exportedUsers}`);
    
    const successRate = ((stats.exportedChannels / stats.totalChannels) * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);

    if (this.results.restricted.length > 0) {
      console.log('\n🚫 Restricted Channels:');
      this.results.restricted.slice(0, 10).forEach(channel => {
        console.log(`   - #${channel.name} (${channel.id})`);
      });
      if (this.results.restricted.length > 10) {
        console.log(`   ... and ${this.results.restricted.length - 10} more`);
      }
    }

    if (this.results.failed.length > 0) {
      console.log('\n❌ Failed Channels:');
      this.results.failed.slice(0, 5).forEach(({ channel, error }) => {
        console.log(`   - #${channel.name} (${channel.id}): ${error}`);
      });
      if (this.results.failed.length > 5) {
        console.log(`   ... and ${this.results.failed.length - 5} more`);
      }
    }

    return this.results;
  }

  async getRecommendations() {
    const { stats } = this.results;
    
    console.log('\n💡 Recommendations:');
    
    if (stats.restrictedChannels > 0) {
      console.log('🔑 For restricted channels:');
      console.log('   1. Use user token instead of bot token');
      console.log('   2. Request additional bot permissions from server admin');
      console.log('   3. Export manually using Discord\'s built-in export');
    }
    
    if (stats.failedChannels > 0) {
      console.log('🔧 For failed channels:');
      console.log('   1. Check bot permissions');
      console.log('   2. Increase timeout for large channels');
      console.log('   3. Retry failed exports');
    }
    
    if (stats.exportedChannels > 0) {
      console.log('✅ Next steps:');
      console.log('   1. Test web interface: npm run dev');
      console.log('   2. Deploy to DigitalOcean for full export');
      console.log('   3. Set up monitoring for long-running exports');
    }
  }
}

async function main() {
  const { listChannels } = require('./list-channels');
  
  try {
    console.log('🚀 Starting Enhanced Discord Export...\n');
    
    // Get all channels
    const channels = await listChannels();
    const textChannels = channels.filter(channel => channel.type === 0);
    
    console.log(`📋 Found ${textChannels.length} text channels to export\n`);
    
    // Create enhanced exporter
    const enhancedExporter = new EnhancedExporter();
    
    // Export with fallback handling
    const results = await enhancedExporter.exportWithFallback(textChannels, {
      maxConcurrent: 1, // Process one at a time to avoid rate limits
      timeout: 3 * 60 * 1000, // 3 minutes per channel
      skipRestricted: false
    });
    
    // Generate report
    enhancedExporter.generateReport();
    
    // Get recommendations
    await enhancedExporter.getRecommendations();
    
  } catch (error) {
    console.error('❌ Enhanced export failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { EnhancedExporter };

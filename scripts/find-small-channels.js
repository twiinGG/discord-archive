const { listChannels } = require('./list-channels');

async function findSmallChannels() {
  try {
    console.log('🔍 Finding small channels for testing...');
    const channels = await listChannels();
    
    // Filter for text channels only
    const textChannels = channels.filter(channel => channel.type === 0);
    
    console.log(`\n📊 Found ${textChannels.length} text channels out of ${channels.length} total channels`);
    
    // Look for channels that might be small based on their names
    const smallChannelKeywords = [
      'rules', 'faq', 'info', 'help', 'support', 'bot', 'commands', 
      'announcements', 'links', 'directory', 'proposals', 'voting'
    ];
    
    const potentialSmallChannels = textChannels.filter(channel => 
      smallChannelKeywords.some(keyword => 
        channel.name.toLowerCase().includes(keyword)
      )
    );
    
    console.log('\n🎯 Potential small channels for testing:');
    potentialSmallChannels.slice(0, 10).forEach((channel, index) => {
      console.log(`${index + 1}. #${channel.name} (${channel.id})`);
    });
    
    if (potentialSmallChannels.length === 0) {
      console.log('\n⚠️  No obvious small channels found. Trying first few text channels:');
      textChannels.slice(0, 5).forEach((channel, index) => {
        console.log(`${index + 1}. #${channel.name} (${channel.id})`);
      });
    }
    
    // Recommend the best option
    const recommendedChannel = potentialSmallChannels[0] || textChannels[0];
    if (recommendedChannel) {
      console.log(`\n💡 Recommended test channel: #${recommendedChannel.name} (${recommendedChannel.id})`);
      console.log('   This channel is likely to have fewer messages and export faster.');
    }
    
  } catch (error) {
    console.error('❌ Failed to find small channels:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  require('dotenv').config({ path: '.env.local' });
  findSmallChannels();
}

module.exports = { findSmallChannels };

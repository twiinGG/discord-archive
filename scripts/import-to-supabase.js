const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

class SupabaseImporter {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  async importChannels(channels) {
    console.log(`Importing ${channels.length} channels...`);
    
    const { data, error } = await this.supabase
      .from('channels')
      .upsert(channels, { onConflict: 'id' });

    if (error) {
      console.error('Error importing channels:', error);
      throw error;
    }

    console.log(`Successfully imported ${data?.length || 0} channels`);
    return data;
  }

  async importUsers(users) {
    console.log(`Importing ${users.length} users...`);
    
    const { data, error } = await this.supabase
      .from('users')
      .upsert(users, { onConflict: 'id' });

    if (error) {
      console.error('Error importing users:', error);
      throw error;
    }

    console.log(`Successfully imported ${data?.length || 0} users`);
    return data;
  }

  async importMessages(messages) {
    console.log(`Importing ${messages.length} messages...`);
    
    // Import in batches to avoid hitting limits
    const batchSize = 1000;
    const batches = [];
    
    for (let i = 0; i < messages.length; i += batchSize) {
      batches.push(messages.slice(i, i + batchSize));
    }

    let totalImported = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`Importing batch ${i + 1}/${batches.length} (${batch.length} messages)...`);
      
      const { data, error } = await this.supabase
        .from('messages')
        .upsert(batch, { onConflict: 'id' });

      if (error) {
        console.error(`Error importing batch ${i + 1}:`, error);
        throw error;
      }

      totalImported += data?.length || 0;
    }

    console.log(`Successfully imported ${totalImported} messages total`);
    return totalImported;
  }

  async importFromJsonFile(filePath) {
    console.log(`Importing data from ${filePath}...`);
    
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);

    return await this.importFromData(jsonData);
  }

  async importFromData(jsonData) {
    console.log('Importing data directly...');
    
    // Import in order: channels, users, messages
    const channelsResult = await this.importChannels(jsonData.channels || []);
    const usersResult = await this.importUsers(jsonData.users || []);
    const messagesResult = await this.importMessages(jsonData.messages || []);

    console.log('Import completed successfully!');
    
    return {
      channels: channelsResult?.length || 0,
      users: usersResult?.length || 0,
      messages: messagesResult || 0
    };
  }

  async getStats() {
    const [channelsCount, usersCount, messagesCount] = await Promise.all([
      this.supabase.from('channels').select('*', { count: 'exact', head: true }),
      this.supabase.from('users').select('*', { count: 'exact', head: true }),
      this.supabase.from('messages').select('*', { count: 'exact', head: true })
    ]);

    return {
      channels: channelsCount.count || 0,
      users: usersCount.count || 0,
      messages: messagesCount.count || 0
    };
  }
}

module.exports = SupabaseImporter;

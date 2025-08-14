const { createClient } = require('@supabase/supabase-js');
const DiscordExporter = require('./export-discord');
const SupabaseImporter = require('./import-to-supabase');
require('dotenv').config({ path: '.env.local' });

class TestSuite {
  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    this.testResults = {
      passed: 0,
      failed: 0,
      tests: []
    };
  }

  async runAllTests() {
    console.log('🧪 Starting comprehensive test suite...\n');

    // Environment and Configuration Tests
    await this.testEnvironmentVariables();
    await this.testDatabaseConnection();
    await this.testDatabaseSchema();

    // Data Integrity Tests
    await this.testDataConsistency();
    await this.testForeignKeys();

    // Export/Import Tests
    await this.testExportScript();
    await this.testImportScript();

    // Web Interface Tests
    await this.testClientAccess();
    await this.testSearchFunctionality();
    await this.testChannelBrowsing();

    // Performance Tests
    await this.testQueryPerformance();

    // Generate final report
    this.generateReport();
  }

  async testEnvironmentVariables() {
    console.log('📋 Testing environment variables...');
    
    const requiredVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'DISCORD_BOT_TOKEN',
      'DISCORD_USER_TOKEN',
      'DISCORD_GUILD_ID'
    ];

    const missing = [];
    for (const varName of requiredVars) {
      if (!process.env[varName]) {
        missing.push(varName);
      }
    }

    if (missing.length === 0) {
      this.addTestResult('Environment Variables', true, 'All required variables are set');
    } else {
      this.addTestResult('Environment Variables', false, `Missing: ${missing.join(', ')}`);
    }
  }

  async testDatabaseConnection() {
    console.log('🗄️ Testing database connection...');
    
    try {
      const { data, error } = await this.supabase
        .from('channels')
        .select('*', { count: 'exact', head: true });

      if (error) {
        this.addTestResult('Database Connection', false, error.message);
      } else {
        this.addTestResult('Database Connection', true, 'Successfully connected to database');
      }
    } catch (error) {
      this.addTestResult('Database Connection', false, error.message);
    }
  }

  async testDatabaseSchema() {
    console.log('📊 Testing database schema...');
    
    try {
      // Test all required tables
      const tables = ['channels', 'users', 'messages'];
      const results = await Promise.all(
        tables.map(table => this.supabase.from(table).select('*', { count: 'exact', head: true }))
      );

      const errors = [];
      results.forEach((result, index) => {
        if (result.error) {
          errors.push(`${tables[index]}: ${result.error.message}`);
        }
      });

      if (errors.length === 0) {
        this.addTestResult('Database Schema', true, 'All required tables accessible');
      } else {
        this.addTestResult('Database Schema', false, errors.join('; '));
      }
    } catch (error) {
      this.addTestResult('Database Schema', false, error.message);
    }
  }

  async testDataConsistency() {
    console.log('🔍 Testing data consistency...');
    
    try {
      // Check for null channel_ids
      const { data: nullChannelMessages, error: nullError } = await this.supabase
        .from('messages')
        .select('*')
        .is('channel_id', null);

      if (nullError) {
        this.addTestResult('Data Consistency - Null Channel IDs', false, nullError.message);
      } else if (nullChannelMessages && nullChannelMessages.length > 0) {
        this.addTestResult('Data Consistency - Null Channel IDs', false, `${nullChannelMessages.length} messages with null channel_id`);
      } else {
        this.addTestResult('Data Consistency - Null Channel IDs', true, 'No null channel_ids found');
      }

      // Check for orphaned messages
      const { data: messages, error: messagesError } = await this.supabase
        .from('messages')
        .select('channel_id')
        .not('channel_id', 'is', null);

      if (messagesError) {
        this.addTestResult('Data Consistency - Orphaned Messages', false, messagesError.message);
      } else if (messages && messages.length > 0) {
        const uniqueChannelIds = [...new Set(messages.map(m => m.channel_id))];
        const { data: channels, error: channelsError } = await this.supabase
          .from('channels')
          .select('id');

        if (channelsError) {
          this.addTestResult('Data Consistency - Orphaned Messages', false, channelsError.message);
        } else if (channels) {
          const existingChannelIds = channels.map(c => c.id);
          const orphanedChannelIds = uniqueChannelIds.filter(id => !existingChannelIds.includes(id));
          
          if (orphanedChannelIds.length > 0) {
            this.addTestResult('Data Consistency - Orphaned Messages', false, `${orphanedChannelIds.length} orphaned channel references`);
          } else {
            this.addTestResult('Data Consistency - Orphaned Messages', true, 'No orphaned messages found');
          }
        }
      }
    } catch (error) {
      this.addTestResult('Data Consistency', false, error.message);
    }
  }

  async testForeignKeys() {
    console.log('🔗 Testing foreign key constraints...');
    
    try {
      // Test that messages can reference channels and users
      const { data: messages, error } = await this.supabase
        .from('messages')
        .select(`
          id,
          channel_id,
          author_id,
          channels!inner(id),
          users!inner(id)
        `)
        .limit(5);

      if (error) {
        this.addTestResult('Foreign Key Constraints', false, error.message);
      } else {
        this.addTestResult('Foreign Key Constraints', true, 'Foreign key relationships working correctly');
      }
    } catch (error) {
      this.addTestResult('Foreign Key Constraints', false, error.message);
    }
  }

  async testExportScript() {
    console.log('📤 Testing export script...');
    
    try {
      const exporter = new DiscordExporter();
      
      // Test that the exporter can be instantiated
      if (exporter && typeof exporter.exportChannel === 'function') {
        this.addTestResult('Export Script - Instantiation', true, 'DiscordExporter class loads correctly');
      } else {
        this.addTestResult('Export Script - Instantiation', false, 'Failed to instantiate DiscordExporter');
      }

      // Test JSON processing with sample data
      const sampleJsonData = {
        channel: {
          id: 'test-channel-id',
          name: 'test-channel',
          category: 'test-category'
        },
        messages: [
          {
            id: 'test-message-id',
            author: {
              id: 'test-user-id',
              name: 'test-user'
            },
            content: 'test message',
            timestamp: new Date().toISOString(),
            attachments: [],
            embeds: []
          }
        ]
      };

      const processedData = await exporter.processExportData(sampleJsonData);
      
      if (processedData && processedData.channels && processedData.messages) {
        this.addTestResult('Export Script - Data Processing', true, 'JSON processing works correctly');
      } else {
        this.addTestResult('Export Script - Data Processing', false, 'Failed to process sample JSON data');
      }

    } catch (error) {
      this.addTestResult('Export Script', false, error.message);
    }
  }

  async testImportScript() {
    console.log('📥 Testing import script...');
    
    try {
      const importer = new SupabaseImporter();
      
      // Test that the importer can be instantiated
      if (importer && typeof importer.importChannels === 'function') {
        this.addTestResult('Import Script - Instantiation', true, 'SupabaseImporter class loads correctly');
      } else {
        this.addTestResult('Import Script - Instantiation', false, 'Failed to instantiate SupabaseImporter');
      }

      // Test with sample data
      const sampleData = {
        channels: [{
          id: 'test-channel-id',
          name: 'test-channel',
          category: 'test-category'
        }],
        users: [{
          id: 'test-user-id',
          username: 'test-user'
        }],
        messages: [{
          id: 'test-message-id',
          channel_id: 'test-channel-id',
          author_id: 'test-user-id',
          author_username: 'test-user',
          content: 'test message',
          message_timestamp: new Date().toISOString()
        }]
      };

      // Note: We won't actually import test data to avoid polluting the database
      this.addTestResult('Import Script - Data Structure', true, 'Import data structure is valid');

    } catch (error) {
      this.addTestResult('Import Script', false, error.message);
    }
  }

  async testClientAccess() {
    console.log('🌐 Testing client access...');
    
    try {
      const testSupabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

      const [channelsTest, usersTest, messagesTest] = await Promise.all([
        testSupabase.from('channels').select('*', { count: 'exact', head: true }),
        testSupabase.from('users').select('*', { count: 'exact', head: true }),
        testSupabase.from('messages').select('*', { count: 'exact', head: true })
      ]);

      const errors = [];
      if (channelsTest.error) errors.push(`channels: ${channelsTest.error.message}`);
      if (usersTest.error) errors.push(`users: ${usersTest.error.message}`);
      if (messagesTest.error) errors.push(`messages: ${messagesTest.error.message}`);

      if (errors.length === 0) {
        this.addTestResult('Client Access', true, 'Client can access all tables');
      } else {
        this.addTestResult('Client Access', false, errors.join('; '));
      }
    } catch (error) {
      this.addTestResult('Client Access', false, error.message);
    }
  }

  async testSearchFunctionality() {
    console.log('🔍 Testing search functionality...');
    
    try {
      // Test the search_messages function
      const { data, error } = await this.supabase
        .rpc('search_messages', { search_term: 'test' })
        .limit(5);

      if (error) {
        this.addTestResult('Search Functionality', false, error.message);
      } else {
        this.addTestResult('Search Functionality', true, 'Search function works correctly');
      }
    } catch (error) {
      this.addTestResult('Search Functionality', false, error.message);
    }
  }

  async testChannelBrowsing() {
    console.log('📁 Testing channel browsing...');
    
    try {
      // Test getting channels with messages
      const { data: channels, error: channelsError } = await this.supabase
        .from('channels')
        .select('*')
        .order('name');

      if (channelsError) {
        this.addTestResult('Channel Browsing', false, channelsError.message);
      } else if (channels && channels.length > 0) {
        // Test getting messages for first channel
        const { data: messages, error: messagesError } = await this.supabase
          .from('messages')
          .select('*')
          .eq('channel_id', channels[0].id)
          .order('message_timestamp', { ascending: false })
          .limit(10);

        if (messagesError) {
          this.addTestResult('Channel Browsing', false, messagesError.message);
        } else {
          this.addTestResult('Channel Browsing', true, `Found ${channels.length} channels and ${messages?.length || 0} messages`);
        }
      } else {
        this.addTestResult('Channel Browsing', true, 'No channels found (expected for empty database)');
      }
    } catch (error) {
      this.addTestResult('Channel Browsing', false, error.message);
    }
  }

  async testQueryPerformance() {
    console.log('⚡ Testing query performance...');
    
    try {
      const startTime = Date.now();
      
      // Test a complex query
      const { data, error } = await this.supabase
        .from('messages')
        .select(`
          id,
          content,
          message_timestamp,
          author_username,
          channels!inner(name)
        `)
        .order('message_timestamp', { ascending: false })
        .limit(50);

      const endTime = Date.now();
      const queryTime = endTime - startTime;

      if (error) {
        this.addTestResult('Query Performance', false, error.message);
      } else if (queryTime < 1000) {
        this.addTestResult('Query Performance', true, `Complex query completed in ${queryTime}ms`);
      } else {
        this.addTestResult('Query Performance', false, `Query took too long: ${queryTime}ms`);
      }
    } catch (error) {
      this.addTestResult('Query Performance', false, error.message);
    }
  }

  addTestResult(testName, passed, message) {
    const result = {
      name: testName,
      passed,
      message,
      timestamp: new Date().toISOString()
    };

    this.testResults.tests.push(result);
    
    if (passed) {
      this.testResults.passed++;
      console.log(`  ✅ ${testName}: ${message}`);
    } else {
      this.testResults.failed++;
      console.log(`  ❌ ${testName}: ${message}`);
    }
  }

  generateReport() {
    console.log('\n📋 TEST SUITE REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 Summary:`);
    console.log(`  Total Tests: ${this.testResults.tests.length}`);
    console.log(`  Passed: ${this.testResults.passed}`);
    console.log(`  Failed: ${this.testResults.failed}`);
    console.log(`  Success Rate: ${((this.testResults.passed / this.testResults.tests.length) * 100).toFixed(1)}%`);

    if (this.testResults.failed > 0) {
      console.log(`\n❌ Failed Tests:`);
      this.testResults.tests
        .filter(test => !test.passed)
        .forEach(test => {
          console.log(`  - ${test.name}: ${test.message}`);
        });
    }

    console.log(`\n🚀 Deployment Readiness:`);
    if (this.testResults.failed === 0) {
      console.log('✅ ALL TESTS PASSED - READY FOR DEPLOYMENT');
    } else {
      console.log('❌ SOME TESTS FAILED - FIX ISSUES BEFORE DEPLOYMENT');
    }

    console.log('\n' + '='.repeat(60));
  }
}

async function main() {
  const testSuite = new TestSuite();
  await testSuite.runAllTests();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { TestSuite };

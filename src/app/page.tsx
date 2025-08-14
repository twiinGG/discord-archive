import { supabaseServer } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch statistics
  const { count: channelCount } = await supabaseServer
    ?.from('channels')
    .select('*', { count: 'exact', head: true }) || { count: 0 };

  const { count: messageCount } = await supabaseServer
    ?.from('messages')
    .select('*', { count: 'exact', head: true }) || { count: 0 };

  const { count: userCount } = await supabaseServer
    ?.from('users')
    .select('*', { count: 'exact', head: true }) || { count: 0 };

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Discord Archive</h1>
            <p className="text-xl text-gray-300">
              Searchable and accessible archive of Discord messages
            </p>
          </header>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {channelCount || 0}
              </div>
              <div className="text-gray-300">Channels</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {messageCount || 0}
              </div>
              <div className="text-gray-300">Messages</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {userCount || 0}
              </div>
              <div className="text-gray-300">Users</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <a
              href="/channels"
              className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-center transition-colors"
            >
              <h2 className="text-2xl font-bold mb-2">Browse Channels</h2>
              <p className="text-gray-300">
                Explore messages organized by Discord channels
              </p>
            </a>
            <a
              href="/search"
              className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-center transition-colors"
            >
              <h2 className="text-2xl font-bold mb-2">Search Messages</h2>
              <p className="text-gray-300">
                Search through all archived messages with full-text search
              </p>
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}

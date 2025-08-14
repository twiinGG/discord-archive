export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { supabaseServer } from '@/lib/supabase'

async function getStats() {
  if (!supabaseServer) return { channels: 0, users: 0, messages: 0 }
  
  try {
    const [channelsResult, usersResult, messagesResult] = await Promise.all([
      supabaseServer.from('channels').select('*', { count: 'exact', head: true }),
      supabaseServer.from('users').select('*', { count: 'exact', head: true }),
      supabaseServer.from('messages').select('*', { count: 'exact', head: true })
    ])

    return {
      channels: channelsResult.count || 0,
      users: usersResult.count || 0,
      messages: messagesResult.count || 0
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
    return { channels: 0, users: 0, messages: 0 }
  }
}

export default async function Home() {
  const stats = await getStats()

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Discord Archive</h1>
            <p className="text-xl text-gray-300">
              Search and browse your Discord server history
            </p>
          </header>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">🔍 Search Messages</h2>
              <p className="text-gray-300 mb-4">
                Search through all messages with full-text search capabilities.
              </p>
              <Link 
                href="/search" 
                className="inline-block bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Start Searching
              </Link>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4">📁 Browse Channels</h2>
              <p className="text-gray-300 mb-4">
                Browse messages by channel and category.
              </p>
              <Link 
                href="/channels" 
                className="inline-block bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Browse Channels
              </Link>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-4">📊 Statistics</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-400">{stats.channels}</div>
                <div className="text-gray-300">Channels</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-400">{stats.users}</div>
                <div className="text-gray-300">Users</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-400">{stats.messages}</div>
                <div className="text-gray-300">Messages</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-gray-400">
            <p>Ready for AI-powered RAG queries in the future</p>
          </div>
        </div>
      </div>
    </main>
  )
}

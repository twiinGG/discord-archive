export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase'
import type { DiscordMessage } from '@/lib/supabase'
import SearchClient from './search-client'

async function getRecentMessages() {
  if (!supabaseServer) return []
  
  try {
    const { data, error } = await supabaseServer
      .from('messages')
      .select('*')
      .order('message_timestamp', { ascending: false })
      .limit(10)

    if (error) {
      console.error('Error loading recent messages:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to load recent messages:', error)
    return []
  }
}

export default async function SearchPage() {
  const recentMessages = await getRecentMessages()

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Search Messages</h1>
            <p className="text-gray-300">Search through all Discord messages</p>
          </header>

          <SearchClient initialRecentMessages={recentMessages} />
        </div>
      </div>
    </main>
  )
}

export const dynamic = 'force-dynamic'

import { supabaseServer } from '@/lib/supabase'
import type { DiscordChannel, DiscordMessage } from '@/lib/supabase'
import ChannelsClient from './channels-client'

async function getChannels() {
  if (!supabaseServer) return []
  
  try {
    const { data, error } = await supabaseServer
      .from('channels')
      .select('*')
      .order('category', { ascending: true })
      .order('position', { ascending: true })

    if (error) {
      console.error('Error loading channels:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to load channels:', error)
    return []
  }
}

async function getChannelMessages(channelId: string) {
  if (!supabaseServer) return []
  
  try {
    const { data, error } = await supabaseServer
      .from('messages')
      .select('*')
      .eq('channel_id', channelId)
      .order('message_timestamp', { ascending: false })
      .limit(100)

    if (error) {
      console.error('Error loading messages:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to load messages:', error)
    return []
  }
}

export default async function ChannelsPage() {
  const channels = await getChannels()
  const initialMessages = channels.length > 0 ? await getChannelMessages(channels[0].id) : []

  return (
    <main className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Browse Channels</h1>
            <p className="text-gray-300">Browse messages by channel</p>
          </header>

          <ChannelsClient 
            initialChannels={channels} 
            initialMessages={initialMessages}
            initialSelectedChannel={channels.length > 0 ? channels[0].id : null}
          />
        </div>
      </div>
    </main>
  )
}

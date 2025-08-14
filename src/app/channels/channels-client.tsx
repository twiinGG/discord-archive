'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { DiscordChannel, DiscordMessage } from '@/lib/supabase'

interface ChannelsClientProps {
  initialChannels: DiscordChannel[]
  initialMessages: DiscordMessage[]
  initialSelectedChannel: string | null
}

// Helper function to detect and render links
function renderContentWithLinks(content: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = content.split(urlRegex)
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

// Helper function to render attachments
function renderAttachments(attachments: any[]) {
  if (!attachments || attachments.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const isImage = attachment.fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i)
        
        return (
          <div key={index} className="border border-gray-600 rounded p-3 bg-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-gray-300">📎</span>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm"
              >
                {attachment.fileName || 'Attachment'}
              </a>
              {attachment.fileSizeBytes && (
                <span className="text-gray-400 text-xs">
                  ({(attachment.fileSizeBytes / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>
            
            {/* Image preview */}
            {isImage && (
              <div className="mt-2">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={attachment.url}
                    alt={attachment.fileName || 'Attachment preview'}
                    className="max-w-full h-auto rounded border border-gray-500"
                    style={{ maxHeight: '300px' }}
                    onError={(e) => {
                      // Hide the image if it fails to load
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </a>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// Helper function to render embeds
function renderEmbeds(embeds: any[]) {
  if (!embeds || embeds.length === 0) return null

  return (
    <div className="mt-2 space-y-2">
      {embeds.map((embed, index) => (
        <div key={index} className="border border-gray-600 rounded p-3 bg-gray-700">
          {embed.title && (
            <div className="font-medium text-blue-400 mb-1">
              {embed.title}
            </div>
          )}
          {embed.description && (
            <div className="text-gray-300 text-sm mb-2">
              {embed.description}
            </div>
          )}
          {embed.thumbnail && embed.thumbnail.url && (
            <div className="mb-2">
              <img
                src={embed.thumbnail.url}
                alt="Embed thumbnail"
                className="max-w-full h-auto rounded"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}
          {embed.url && (
            <a
              href={embed.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline text-sm"
            >
              {embed.url}
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

export default function ChannelsClient({ 
  initialChannels, 
  initialMessages, 
  initialSelectedChannel 
}: ChannelsClientProps) {
  const [channels, setChannels] = useState<DiscordChannel[]>(initialChannels)
  const [selectedChannel, setSelectedChannel] = useState<string | null>(initialSelectedChannel)
  const [messages, setMessages] = useState<DiscordMessage[]>(initialMessages)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedChannel && selectedChannel !== initialSelectedChannel) {
      loadChannelMessages(selectedChannel)
    }
  }, [selectedChannel, initialSelectedChannel])

  const loadChannelMessages = async (channelId: string) => {
    if (!supabase) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('message_timestamp', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error loading messages:', error)
        return
      }

      setMessages(data || [])
    } catch (error) {
      console.error('Failed to load messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedChannels = channels.reduce((acc, channel) => {
    const category = channel.category || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(channel)
    return acc
  }, {} as Record<string, DiscordChannel[]>)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Channels Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-gray-800 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Channels</h2>
          <div className="space-y-4">
            {Object.entries(groupedChannels).map(([category, categoryChannels]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-gray-400 mb-2 uppercase tracking-wide">
                  {category}
                </h3>
                <div className="space-y-1">
                  {categoryChannels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel.id)}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                        selectedChannel === channel.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      #{channel.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="lg:col-span-2">
        {selectedChannel ? (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-4">
              #{channels.find(c => c.id === selectedChannel)?.name}
            </h2>
            
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Loading messages...</div>
              </div>
            ) : messages.length > 0 ? (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="bg-gray-700 p-4 rounded-lg border border-gray-600"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="font-medium text-blue-400">
                        {message.author_username}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(message.message_timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-gray-300 whitespace-pre-wrap">
                      {renderContentWithLinks(message.content)}
                    </div>
                    {renderAttachments(message.attachments)}
                    {renderEmbeds(message.embeds)}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                No messages in this channel
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-gray-400">
              Select a channel to view messages
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

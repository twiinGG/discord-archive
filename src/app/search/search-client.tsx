'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DiscordMessage } from '@/lib/supabase'

interface SearchClientProps {
  initialRecentMessages: DiscordMessage[]
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

export default function SearchClient({ initialRecentMessages }: SearchClientProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<DiscordMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim() || !supabase) return

    setLoading(true)
    setHasSearched(true)
    try {
      const { data, error } = await supabase
        .rpc('search_messages', { search_term: query })
        .limit(50)

      if (error) {
        console.error('Search error:', error)
        return
      }

      setResults(data || [])
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter your search query..."
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 rounded-lg font-medium transition-colors"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Found {results.length} messages
          </h2>
          {results.map((message) => (
            <div
              key={message.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700"
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
      )}

      {!loading && results.length === 0 && query && hasSearched && (
        <div className="text-center text-gray-400 py-8">
          No messages found for &quot;{query}&quot;
        </div>
      )}

      {!hasSearched && initialRecentMessages.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Recent Messages
          </h2>
          {initialRecentMessages.map((message) => (
            <div
              key={message.id}
              className="bg-gray-800 p-4 rounded-lg border border-gray-700"
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
      )}
    </>
  )
}

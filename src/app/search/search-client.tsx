'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DiscordMessage {
  id: string;
  channel_id: string;
  author_id: string | null;
  author_username: string;
  content: string;
  message_timestamp: string;
  attachments: Record<string, unknown>[];
  embeds: Record<string, unknown>[];
  mentions: string[];
}

interface SearchClientProps {
  initialMessages: DiscordMessage[];
}

// Helper function to render content with clickable links
function renderContentWithLinks(content: string) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
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
      );
    }
    return part;
  });
}

// Helper function to render embeds
function renderEmbeds(embeds: Record<string, unknown>[]) {
  if (!embeds || embeds.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {embeds.map((embed, index) => {
        const title = embed.title as string | undefined;
        const description = embed.description as string | undefined;
        const url = embed.url as string | undefined;

        return (
          <div key={index} className="border border-gray-600 rounded p-3 bg-gray-700">
            {title && (
              <div className="font-semibold text-white mb-1">{title}</div>
            )}
            {description && (
              <div className="text-gray-300 text-sm mb-2">{description}</div>
            )}
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm"
              >
                View Link
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Helper function to render attachments
function renderAttachments(attachments: Record<string, unknown>[]) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2 space-y-2">
      {attachments.map((attachment, index) => {
        const fileName = attachment.fileName as string;
        const url = attachment.url as string;
        const fileSizeBytes = attachment.fileSizeBytes as number;
        const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i);

        return (
          <div key={index} className="border border-gray-600 rounded p-3 bg-gray-600">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-gray-300">📎</span>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 underline text-sm"
              >
                {fileName || 'Attachment'}
              </a>
              {fileSizeBytes && (
                <span className="text-gray-400 text-xs">
                  ({(fileSizeBytes / 1024).toFixed(1)} KB)
                </span>
              )}
            </div>

            {/* Image preview */}
            {isImage && (
              <div className="mt-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={url}
                    alt={fileName || 'Attachment preview'}
                    className="max-w-full h-auto rounded border border-gray-500"
                    style={{ maxHeight: '300px' }}
                    onError={(e) => {
                      // Hide the image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SearchClient({ initialMessages }: SearchClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [messages, setMessages] = useState<DiscordMessage[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setMessages(initialMessages);
      return;
    }

    if (!supabase) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('search_messages', { search_term: searchTerm })
        .limit(50);

      if (error) {
        console.error('Search error:', error);
        setMessages([]);
      } else {
        setMessages(data || []);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-4">Search Discord Archive</h1>
        <div className="flex gap-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search messages..."
            className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center text-gray-400">Searching...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400">
            {searchTerm ? 'No messages found matching your search.' : 'No recent messages to display.'}
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {message.author_username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-semibold text-white">
                      {message.author_username}
                    </span>
                    <span className="text-gray-400 text-sm">
                      {formatDate(message.message_timestamp)}
                    </span>
                  </div>
                  
                  {/* Message content */}
                  <div className="text-gray-300 mb-2">
                    {renderContentWithLinks(message.content)}
                  </div>

                  {/* Attachments */}
                  {renderAttachments(message.attachments)}

                  {/* Embeds */}
                  {renderEmbeds(message.embeds)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

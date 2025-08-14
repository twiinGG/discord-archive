import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server-side Supabase client with service role key
const supabaseServiceUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const supabaseServer = supabaseServiceUrl && supabaseServiceKey
  ? createClient(supabaseServiceUrl, supabaseServiceKey)
  : null

// Database types for TypeScript
export interface DiscordMessage {
  id: string
  channel_id: string
  author_id: string
  author_username: string
  content: string
  message_timestamp: string
  attachments: string[]
  embeds: Record<string, unknown>[]
  mentions: string[]
  created_at: string
}

export interface DiscordChannel {
  id: string
  name: string
  category: string
  type: 'text' | 'voice' | 'announcement'
  position: number
  created_at: string
}

export interface DiscordUser {
  id: string
  username: string
  display_name: string
  avatar_url: string
  created_at: string
}

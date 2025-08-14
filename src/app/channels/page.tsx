import { supabaseServer } from '@/lib/supabase';
import ChannelsClient from './channels-client';

export const dynamic = 'force-dynamic';

export default async function ChannelsPage() {
  // Fetch initial data
  const { data: channels } = await supabaseServer
    ?.from('channels')
    .select('*')
    .order('name') || { data: [] };

  const { data: messages } = await supabaseServer
    ?.from('messages')
    .select('*')
    .order('message_timestamp', { ascending: false })
    .limit(10) || { data: [] };

  return (
    <ChannelsClient 
      initialChannels={channels || []} 
      initialMessages={messages || []} 
    />
  );
}

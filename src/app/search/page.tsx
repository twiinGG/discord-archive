import { supabaseServer } from '@/lib/supabase';
import SearchClient from './search-client';

export const dynamic = 'force-dynamic';

export default async function SearchPage() {
  // Fetch initial recent messages
  const { data: messages } = await supabaseServer
    ?.from('messages')
    .select('*')
    .order('message_timestamp', { ascending: false })
    .limit(10) || { data: [] };

  return (
    <SearchClient initialMessages={messages || []} />
  );
}

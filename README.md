# Discord Archive

A searchable web archive for Discord servers, built with Next.js, Supabase, and DiscordChatExporter.

## Features

- 🔍 **Full-text search** across all Discord messages
- 📁 **Channel browsing** with organized categories
- 📊 **Statistics dashboard** showing server metrics
- 🎨 **Modern UI** with dark theme
- 🔐 **Authentication ready** for future crypto wallet integration
- 🤖 **AI-ready** for future RAG (Retrieval-Augmented Generation) queries

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **Database**: Supabase PostgreSQL with full-text search
- **Export Tool**: DiscordChatExporter
- **Deployment**: Vercel (ready)

## Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Discord bot token with server access
- Discord server ID (Guild ID)

### 2. Setup Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Go to "Bot" section and create a bot
4. Copy the bot token
5. Add the bot to your Discord server with these permissions:
   - Read Messages/View Channels
   - Read Message History
   - Access to all channels you want to archive

### 3. Environment Setup

1. Copy the example environment file:
   ```bash
   cp env.example .env.local
   ```

2. Update `.env.local` with your credentials:
   ```env
   # Discord Configuration
   DISCORD_BOT_TOKEN=your_discord_bot_token_here
   DISCORD_GUILD_ID=your_discord_guild_id_here
   
   # Supabase Configuration (already configured)
   NEXT_PUBLIC_SUPABASE_URL=https://eyypgmbbkdcqpdmfjevu.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5eXBnbWJia2RjcXBkbWZqZXZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjk3NzYsImV4cCI6MjA3MDcwNTc3Nn0.PtTZY-KGfLGgLOvD_AHSlEzcOqXUnSezliDKiwapIkk
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

### 4. Install DiscordChatExporter

#### Option A: Docker (Recommended)
```bash
docker pull tyrrrz/discordchatexporter
```

#### Option B: Direct Download
Download from [DiscordChatExporter releases](https://github.com/Tyrrrz/DiscordChatExporter/releases)

### 5. Export Discord Data

Run the export script:
```bash
npm run export
```

This will:
1. Export all messages from your Discord server
2. Process the data into a structured format
3. Import everything into Supabase

### 6. Start the Web Application

```bash
npm run dev
```

Visit `http://localhost:3000` to access your Discord archive.

## Usage

### Search Messages
- Go to `/search` to search through all messages
- Use natural language queries
- Results are ranked by relevance

### Browse Channels
- Go to `/channels` to browse by channel
- Messages are organized by channel categories
- View recent messages in each channel

### Statistics
- View total channels, users, and messages on the homepage
- Real-time statistics from your database

## Database Schema

The application uses three main tables:

- **channels**: Discord channels with categories and metadata
- **users**: Discord users with usernames and avatars
- **messages**: All messages with full-text search indexing

## Future Features

- [ ] Crypto wallet authentication
- [ ] AI-powered RAG queries
- [ ] Advanced filtering and date ranges
- [ ] Media attachment viewing
- [ ] Export functionality
- [ ] User activity analytics

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### Export Issues
- Ensure your Discord bot has proper permissions
- Check that the bot token is valid
- Verify the guild ID is correct

### Database Issues
- Check Supabase connection in dashboard
- Verify RLS policies are configured correctly
- Ensure database schema is applied

### Search Not Working
- Verify full-text search indexes are created
- Check the `search_messages` function exists
- Ensure messages are properly imported

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

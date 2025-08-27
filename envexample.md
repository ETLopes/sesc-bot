## Environment variables

Copy these into a `.env` file and fill in your values.

```env
# Telegram
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHANNEL_ID=
TELEGRAM_CHANNEL_ID_MUSICA=
TELEGRAM_CHANNEL_ID_TEATRO=

# Database
DATABASE_PATH=./data/sesc.db

# Scheduler
POLL_INTERVAL_MINUTES=60
SKIP_POST_ON_FIRST_SYNC=true

# Sesc API
SESC_API_BASE=https://www.sescsp.org.br/wp-json/wp/v1/atividades/filter
LOCAL_IDS=761,2,43,47,48,49,50,730,51,52,53,54,71,55,56,57,80,58,60,61,62,63,64,65,66
CATEGORIA_DEFAULT=musica
# Multi-categories (optional, defaults to CATEGORIA_DEFAULT when unset)
CATEGORIES=musica,teatro
GRATUITO=
ONLINE=

# Logging
LOG_LEVEL=info
```

Descriptions:

- **TELEGRAM_BOT_TOKEN**: Bot token from BotFather.
- **TELEGRAM_CHANNEL_ID**: Fallback channel/chat id (e.g., @your_channel or numeric id).
- **TELEGRAM_CHANNEL_ID_MUSICA**: Channel for música events.
- **TELEGRAM_CHANNEL_ID_TEATRO**: Channel for teatro events.
- **DATABASE_PATH**: SQLite file path.
- **POLL_INTERVAL_MINUTES**: Minutes between syncs (default 60).
- **SKIP_POST_ON_FIRST_SYNC**: If true, first run only saves; posting starts next run.
- **SESC_API_BASE**: Base endpoint for atividades filter.
- **LOCAL_IDS**: Comma-separated Sesc SP unit ids to include.
- **CATEGORIA_DEFAULT**: Default category to fetch (musica for now).
- **CATEGORIES**: Comma-separated categorias to sync every cycle (e.g., musica,teatro). If unset, falls back to `CATEGORIA_DEFAULT`.
- **GRATUITO**: Leave empty or set a value to filter by free events.
- **ONLINE**: Leave empty or set a value to filter online events.
- **LOG_LEVEL**: Logger level (info, debug, warn, error).

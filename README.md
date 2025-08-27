## Sesc SP Telegram Bot

Bot que a cada hora checa a programação do Sesc SP e publica novos eventos em um canal do Telegram, salvando o histórico em SQLite.

### Requisitos

- Node.js 18+
- Token do bot do Telegram e ID do canal

### Configuração

1. Crie um arquivo `.env` com base em `.env.example`:

```
TELEGRAM_BOT_TOKEN=123456:ABC...
TELEGRAM_CHANNEL_ID=@seu_canal_fallback
TELEGRAM_CHANNEL_ID_MUSICA=@seu_canal_musica
TELEGRAM_CHANNEL_ID_TEATRO=@seu_canal_teatro
DATABASE_PATH=./data/sesc.db
POLL_INTERVAL_MINUTES=60
SESC_API_BASE=https://www.sescsp.org.br/wp-json/wp/v1/atividades/filter
LOCAL_IDS=761,2,43,47,48,49,50,730,51,52,53,54,71,55,56,57,80,58,60,61,62,63,64,65,66
CATEGORIA_DEFAULT=musica
GRATUITO=
ONLINE=
SKIP_POST_ON_FIRST_SYNC=true
LOG_LEVEL=info
```

### Scripts

- `npm run dev` - roda com nodemon
- `npm start` - roda o bot
- `npm run post:last` - posta o último evento do banco (teste de formato)

### Funcionamento

1. Busca o JSON de atividades do Sesc SP, pagina até `atividade` ficar vazia.
2. Normaliza os eventos.
3. Insere no SQLite eventos inéditos.
4. Publica cada novo evento no canal do Telegram.

### Observações

- O endpoint público de referência é da Sesc SP [`/wp-json/wp/v1/atividades/filter`](https://www.sescsp.org.br/wp-json/wp/v1/atividades/filter?local=&categoria=&gratuito=&online=&data_inicial=&data_final=&tipo=atividade&dinamico=true&ppp=1000&page=1).
- Datas são dinâmicas: `data_inicial` = hoje, `data_final` = hoje + 1 ano.
- Categoria padrão: música; suporte futuro para teatro em canal específico.

### Docker

Build:

```
docker build -t sesc-bot .
```

Rodar com Compose (recomendado):

```
docker compose up -d --build
```

Notas:

- Monte `./data` para persistir o SQLite.
- Use um `.env` na raiz (o compose carrega automaticamente).

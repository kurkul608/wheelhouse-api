# Wheelhouse API

Server‑side engine for the **Wheelhouse** ecosystem – a Telegram Mini App that lets users browse an always‑fresh car catalogue, inspect specs and chat with a manager to seal the deal.

> ⏱️ **Built in four weeks** with type‑safe, testable tooling.

---

## ✨ Key features

* **Lightning‑fast** responses – Redis cache in front of MongoDB keeps p99 < 80 ms.
* **Partner feed sync** – cron + BullMQ pull a supplier’s XML/CSV feed every 6 h, apply diff & upsert cars.
* **AI data hygiene** – GPT‑4o fills missing specs, normalises units/wording and flags outliers.
* **Broadcast engine** – targeted campaigns, template CRUD/clone, deferred & periodic sends, inline buttons, channel posting.
* **Modular Fastify plugins** – each domain (`cars`, `broadcasts`, `sync`, `auth`) ships as a self‑contained plugin → easy tests & reuse.
* **Typed data layer** – Prisma + TypeScript from DTO to database.

---

## 🛠 Tech stack

| Layer            | Tech                                                      |
| ---------------- | --------------------------------------------------------- |
| Runtime          | Node 22, **Fastify 5**                                    |
| Database         | MongoDB 6 via **Prisma**                                  |
| Cache / queues   | Redis 7 (`bullmq`)                                        |
| Auth             | Telegram Login & JWT (for internal tools)                 |
| AI helpers       | OpenAI GPT‑4o (`openai` npm)                               |
| Validation       | Zod                                                       |
| Dev / tooling    | pnpm, TypeScript, ESLint, Prettier, Husky + lint‑staged   |
| CI               | GitHub Actions → lint → type‑check → tests → build        |

---

## 🚀 Quick start

### 1. Clone & install

```bash
git clone https://github.com/kurkul608/wheelhouse-api.git
cd wheelhouse-api
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

| Variable                     | Description                              |
| ---------------------------- | ---------------------------------------- |
| `PORT`                       | Server port (default `4000`)             |
| `MONGODB_URL`                | MongoDB connection string                |
| `REDIS_URL`                  | Redis connection string                  |
| `TG_BOT_TOKEN`               | Bot token used for broadcast posting     |
| `OPENAI_API_KEY`             | Key for GPT‑4o data‑hygiene helpers      |
| `JWT_SECRET`                 | Secret for internal JWT auth             |

### 3. Run in development

```bash
pnpm dev          # watches & restarts with ts-node
```

### 4. Migrate & seed (optional demo data)

```bash
pnpm prisma migrate deploy
pnpm prisma db seed
```

### 5. Production build

```bash
pnpm build        # transpile to dist/
node dist/main.js
```

---

## 📬 API at a glance

```bash
# List cars, filter by make & price
curl -X GET 'http://localhost:4000/cars?make=Peugeot&price_lte=15000'

# Fetch single car
curl http://localhost:4000/cars/662f4c1cc7e2a4b6d0e4008f

# Create broadcast from template ID 42 and send now
curl -X POST http://localhost:4000/broadcasts      -H "Content-Type: application/json"      -H "Authorization: Bearer <jwt>"      -d '{ "templateId": 42, "target": { "segment": "sedan-lovers" } }'
```

Full OpenAPI spec lives in **`/docs/openapi.yml`** (importable into Postman/Insomnia).

---

## 📂 Folder structure (trimmed)

```
src/
 ├─ plugins/
 │   ├─ cars/
 │   ├─ broadcasts/
 │   ├─ sync/
 │   └─ auth/
 ├─ jobs/           # BullMQ workers
 ├─ lib/            # shared helpers
 ├─ prisma/         # schema.prisma & migrations
 └─ index.ts        # Fastify bootstrap
```

---

## 🧪 Scripts

| Command            | Action                            |
| ------------------ | --------------------------------- |
| `pnpm dev`         | Start dev server with reload      |
| `pnpm test`        | Vitest unit + integration tests   |
| `pnpm lint`        | ESLint + Prettier                 |
| `pnpm type-check`  | `tsc --noEmit`                    |
| `pnpm build`       | Production build                  |
| `pnpm seed`        | Seed demo data (MongoDB)          |

---

## 📈 Impact

* **< 80 ms p99 latency** after Redis caching strategy.
* **98 % cache hit ratio** on read endpoints.
* **10 k +** cars kept in sync with supplier feed.

---

## 🤝 Contributing

1. Fork → `git checkout -b feat/amazing`
2. `pnpm install && pnpm lint && pnpm type-check && pnpm test`
3. Open PR with clear description.

Issue / PR templates live in `.github/`.

---

## 📝 License

Distributed under the **MIT License** – see [`LICENSE`](./LICENSE) for details.

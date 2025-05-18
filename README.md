# Wheelhouse API

The Wheelhouse API powers **Wheelhouse**, a Telegram mini-app that lets users browse an always-fresh catalogue of cars, inspect detailed specs, and chat with a manager to close the deal.

> ⏱️ **Built in just one month** by a small team using modern, type-safe tooling.

---

## ✨ Key features

* **Lightning-fast SSR** – every user request is served from a fully primed cache (Redis) unless data changed.
* **AI-assisted data hygiene** – an LLM fills in missing specs, normalises units and wording, and helps resolve merge conflicts during partner-feed sync.
* **Partner catalogue sync** – keeps our MongoDB up to date with a foreign supplier’s feed on a configurable schedule.
* **Advanced broadcast engine** – targeted campaigns, template library (CRUD & clone), deferred & periodic sends, in-message buttons, and channel posting.
* **Typed data layer** – Prisma provides end-to-end types, migrations, and schema safety while still talking to MongoDB.
* **Modular Fastify plugins** – each domain (cars, broadcasts, sync, auth) ships as an isolated plugin for clean boundaries & easy testing.

---

## 🛠️ Tech stack

| Purpose | Choice                                          |
|---------|-------------------------------------------------|
| Runtime | Node 22 / Fastify v5                            |
| Database | MongoDB 6, accessed through **Prisma** ORM      |
| Cache + queue | Redis 7 (also used for bullmq job queues)       |
| AI | OpenAI GPT-4o (via `openai` npm package)        |
| Auth | Telegram Login, optional JWT for internal tools |
| Validation | Zod                                             |
| Dev & scripts | pnpm, TypeScript, eslint, prettier, husky       |

---

## 🚀 Quick start

### Prerequisites

* **Node >= 22**
* **pnpm >= 8**
* Running instances (local or cloud) of **MongoDB** and **Redis**

### 1. Clone & install

```bash
git clone https://github.com/kurkul608/wheelhouse-api.git
cd wheelhouse-api
pnpm install

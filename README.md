# second-brain-app

<img src="https://img.shields.io/github/stars/hmol33/second-brain-app?style=flat-square&color=blue" alt="Stars">
<img src="https://img.shields.io/github/forks/hmol33/second-brain-app?style=flat-square&color=green" alt="Forks">
<img src="https://img.shields.io/github/license/hmol33/second-brain-app?style=flat-square" alt="License">
<img src="https://img.shields.io/github/actions/workflow/status/hmol33/second-brain-app/ci.yml?branch=main&label=CI&style=flat-square" alt="CI Status">

Een persoonlijk "Second Brain" systeem gebouwd met **Next.js 16 (App Router)**, **React 19**, **TypeScript** en **Tailwind CSS v4**. Het laat je al je notities, gesprekken en herinneringen reviewen, doorzoeken en filteren.

## Installatie

### Vereisten

- Node.js 18+
- npm of yarn

### Installatie

```bash
git clone https://github.com/hmol33/second-brain-app.git
cd second-brain-app
npm install
npm run dev      # http://localhost:3000
```

Productie-build:

```bash
npm run build
npm run start
```

Lint:

```bash
npm run lint
```

## Gebruik

```bash
# Start de ontwikkelserver
npm run dev

# Open http://localhost:3000 in je browser
# Gebruik Cmd/Ctrl+K voor globaal zoeken
# Voeg nieuwe items toe via het formulier
```

## Bijdragers

- [hmol33](https://github.com/hmol33) — Onderhouder

## Licentie

MIT — zie [LICENSE](LICENSE) voor details.

## ✨ Features

- **Doorzoekbare lijst** van alle items (memories, notes, conversations)
- **Globale zoekfunctie** (Cmd/Ctrl+K) over titel, content én berichten
- **Filteren** via tabs: All / Memories / Notes / Conversations
- **Toevoegen** van nieuwe items via een formulier
- **Schone, minimale UI** met dark-mode support
- **Settings-dialog** voor app-voorkeuren

## 📂 Project Structuur

```
src/
├── app/
│   ├── layout.tsx        # Root layout + globals
│   ├── page.tsx          # Hoofdpagina (client component)
│   └── globals.css       # Tailwind + thema
├── components/
│   ├── ItemList.tsx      # Lijstweergave van items
│   ├── SearchDialog.tsx  # Cmd+K zoekdialoog
│   ├── AddItemForm.tsx   # Nieuw item toevoegen
│   └── SettingsDialog.tsx# App-instellingen
├── lib/
│   ├── types.ts          # BrainItem / Memory / Note / Conversation types
│   ├── db.ts             # SQLite-laag (better-sqlite3)
│   └── storage.ts        # JSON in-memory storage
└── data/
    └── items.json        # (legacy) zie public/data/items.json

public/
└── data/
    └── items.json        # Huidige data-bron
```

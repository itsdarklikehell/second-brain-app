# Second Brain

Een persoonlijk "Second Brain" systeem gebouwd met **Next.js 16 (App Router)**, **React 19**, **TypeScript** en **Tailwind CSS v4**. Het laat je al je notities, gesprekken en herinneringen reviewen, doorzoeken en filteren.

## ✨ Huidige Features

- **Doorzoekbare lijst** van alle items (memories, notes, conversations)
- **Globale zoekfunctie** (Cmd/Ctrl+K) over titel, content én berichten
- **Filteren** via tabs: All / Memories / Notes / Conversations
- **Toevoegen** van nieuwe items via een formulier
- **Schone, minimale UI** met dark-mode support
- **Settings-dialog** voor app-voorkeuren

## 🛠️ Technologie Stack

- Next.js 16.2.7 (App Router, Turbopack)
- React 19.2
- TypeScript 5
- Tailwind CSS v4
- `better-sqlite3` (voorbereide DB-laag, zie onder)

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
│   ├── db.ts             # SQLite-laag (better-sqlite3) — nog niet actief
│   └── storage.ts        # JSON in-memory storage — nog niet actief
└── data/
    └── items.json        # (legacy) zie public/data/items.json

public/
└── data/
    └── items.json        # Huidige data-bron (gefetcht door page.tsx)
```

## 🗃️ Data-laag (belangrijk)

De actieve app leest momenteel uit **`public/data/items.json`** via een `fetch()`
in `page.tsx`. Er bestaan twee ongebruikte datalagen die klaarstaan voor Fase 3:

- `lib/db.ts` — persistente SQLite-laag (`better-sqlite3`, met `@types/better-sqlite3`)
- `lib/storage.ts` — tijdelijke in-memory JSON-storage

Deze zijn bewust nog niet aangesloten; de app draait nu in "demo-modus" op
statische JSON.

## 🚀 Aan de slag

```bash
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

## 📝 Roadmap

Zie [ROADMAP.md](./ROADMAP.md) voor de volledige faseplanning.

## 📄 Licentie

MIT


---

## 🎥 Gource Visualization

De ontwikkelhistorie van dit project in een film:

<video src="https://raw.githubusercontent.com/itsdarklikehell/second-brain-app/master/gource.mp4" controls width="100%"></video>

*De video wordt automatisch gegenereerd door de [Gource workflow](.github/workflows/gource.yml) bij elke push.*

Lokale video genereren:
```bash
gource --max-files 1000 --key -800x600 \
  --highlight-users --filename-time 3 --output-framerate 25 \
  -s 0.6 --multi-sampling --auto-skip-seconds 0.1 \
  --stop-at-end --hide mouse,progress -o gource.ppm

ffmpeg -y -r 15 -f image2pipe -vcodec ppm -i gource.ppm \
  -vcodec libx264 -preset medium -pix_fmt yuv420p \
  -crf 1 -threads 0 -bf 0 gource.mp4
```

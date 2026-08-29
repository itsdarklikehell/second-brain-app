/**
 * Homelab integration foundation for Second Brain.
 *
 * Central registry of the thuisvloot media- en AI-stacks, plus kleine helpers
 * die latere features (spraaknotities, media-zoek, TTS) kunnen hergebruiken.
 *
 * Endpoints zijn overgenomen uit de Heimdall-dashboardregistratie
 * (192.168.178.197:7990) op 2026-08-29. Verander hier één plek als de vloot
 * verhuist — de rest van de app leest via HOMELAB_SERVICES.
 *
 * Dit bestand is framework-agnostisch (geen Next/React imports) zodat het zowel
 * server-side (Route Handlers) als client-side gebruikt kan worden.
 */

export type HomelabGroup = 'media' | 'ai';

export interface HomelabService {
  /** Stable key, bv. 'readarr' — gebruik dit in code, niet de displaynaam. */
  key: string;
  /** Menselijke naam voor UI. */
  name: string;
  group: HomelabGroup;
  baseUrl: string;
  /** Korte omschrijving van waarvoor de dienst dient. */
  description: string;
}

export const HOMELAB_SERVICES: HomelabService[] = [
  // ---- media-stack ----
  {
    key: 'readarr',
    name: 'Readarr',
    group: 'media',
    baseUrl: 'http://192.168.178.120:8787',
    description: 'Beheer van boeken/ebooks (nieuwe titels, zoeken, download-trigger).',
  },
  {
    key: 'prowlarr',
    name: 'Prowlarr',
    group: 'media',
    baseUrl: 'http://192.168.178.117:9696',
    description: 'Indexer-beheer; voedt Readarr/Sonarr/Radarr van zoekbronnen.',
  },
  {
    key: 'transmission',
    name: 'Transmission',
    group: 'media',
    baseUrl: 'http://192.168.178.118:9091',
    description: 'BitTorrent-downloads (RPC op /transmission/rpc).',
  },
  {
    key: 'jellyfin',
    name: 'Jellyfin',
    group: 'media',
    baseUrl: 'http://192.168.178.99:8096',
    description: 'Media-server voor film/serie/muziek.',
  },
  {
    key: 'musicbrainz',
    name: 'MusicBrainz',
    group: 'media',
    baseUrl: 'http://192.168.178.113:5000',
    description: 'Open muziek-metadatabase (lookup-API).',
  },
  // ---- AI-stack ----
  {
    key: 'openwebui',
    name: 'OpenWebUI',
    group: 'ai',
    baseUrl: 'http://192.168.178.104',
    description: 'Chat-UI bovenop Ollama/modellen.',
  },
  {
    key: 'ollama',
    name: 'Ollama',
    group: 'ai',
    baseUrl: 'http://192.168.178.62:11434',
    description: 'Lokale LLM-runtime (API op /api).',
  },
  {
    key: 'whisper-stt',
    name: 'Whisper STT',
    group: 'ai',
    baseUrl: 'http://192.168.178.22:8081',
    description: 'Spraak-naar-tekst (Whisper).',
  },
  {
    key: 'stt-whisper',
    name: 'stt-whisper',
    group: 'ai',
    baseUrl: 'http://192.168.178.114',
    description: 'Alternatieve Whisper STT-service.',
  },
  {
    key: 'nl-tts',
    name: 'nl-tts',
    group: 'ai',
    baseUrl: 'http://192.168.178.112',
    description: 'Nederlandse text-to-speech (Piper/Coqui).',
  },
];

export function getService(key: string): HomelabService | undefined {
  return HOMELAB_SERVICES.find((s) => s.key === key);
}

export interface ServiceStatus {
  key: string;
  name: string;
  group: HomelabGroup;
  baseUrl: string;
  /** true als een HTTP-antwoord (200-599) binnenkwam, false bij netwerkfout/timeout. */
  reachable: boolean;
  /** HTTP-statuscode indien beschikbaar, anders null. */
  httpStatus: number | null;
  /** Reactietijd in ms. */
  latencyMs: number | null;
  error?: string;
}

/**
 * Controleer één endpoint. Gebruikt globale fetch (node >=18 / browser).
 * Netwerkfouten of timeouts leveren een `reachable:false` Status op in plaats
 * van een throw — veilig aan te roepen vanuit UI/route handlers.
 */
export async function probeService(
  svc: HomelabService,
  timeoutMs = 4000,
): Promise<ServiceStatus> {
  const started = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(svc.baseUrl, {
      method: 'GET',
      redirect: 'manual',
      signal: controller.signal,
    });
    clearTimeout(timer);
    return {
      key: svc.key,
      name: svc.name,
      group: svc.group,
      baseUrl: svc.baseUrl,
      reachable: true,
      httpStatus: res.status,
      latencyMs: Date.now() - started,
    };
  } catch (err) {
    return {
      key: svc.key,
      name: svc.name,
      group: svc.group,
      baseUrl: svc.baseUrl,
      reachable: false,
      httpStatus: null,
      latencyMs: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Controleer alle endpoints in parallel. */
export async function probeAllServices(
  filter?: HomelabGroup,
): Promise<ServiceStatus[]> {
  const list = filter
    ? HOMELAB_SERVICES.filter((s) => s.group === filter)
    : HOMELAB_SERVICES;
  return Promise.all(list.map((s) => probeService(s)));
}

// ---------------------------------------------------------------------------
// Kant-en-klare helpers voor toekomstige features (niet actief aangeroepen).
// Dorus kan deze gebruiken zonder zelf endpoints te raden.
// ---------------------------------------------------------------------------

/**
 * Transcribeer audio naar tekst via de Whisper STT-service.
 * Verwacht een multipart/form-data `file`-veld met het audiobestand.
 */
export async function transcribeAudio(
  audio: Blob | Uint8Array,
  fileName = 'note.webm',
): Promise<string> {
  const svc = getService('whisper-stt');
  if (!svc) throw new Error('whisper-stt service niet geconfigureerd');
  const form = new FormData();
  const blob = audio instanceof Blob ? audio : new Blob([audio as BlobPart]);
  form.append('file', blob, fileName);
  const res = await fetch(`${svc.baseUrl}/api/transcribe`, {
    method: 'POST',
    body: form,
  });
  if (!res.ok) throw new Error(`transcribe mislukt: HTTP ${res.status}`);
  const data = (await res.json()) as { text?: string };
  return data.text ?? '';
}

/**
 * Spreek Nederlandse tekst uit via de nl-tts-service en geef audio-URL terug.
 */
export async function speakDutch(text: string): Promise<ArrayBuffer> {
  const svc = getService('nl-tts');
  if (!svc) throw new Error('nl-tts service niet geconfigureerd');
  const res = await fetch(`${svc.baseUrl}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: 'nl' }),
  });
  if (!res.ok) throw new Error(`tts mislukt: HTTP ${res.status}`);
  return res.arrayBuffer();
}

/**
 * Zoek boeken in Readarr (vereist API-key; wordt niet hier opgeslagen).
 */
export async function searchBooks(
  query: string,
  apiKey: string,
): Promise<unknown[]> {
  const svc = getService('readarr');
  if (!svc) throw new Error('readarr service niet geconfigureerd');
  const url = `${svc.baseUrl}/api/v1/search?term=${encodeURIComponent(
    query,
  )}&apikey=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`readarr search mislukt: HTTP ${res.status}`);
  return (await res.json()) as unknown[];
}

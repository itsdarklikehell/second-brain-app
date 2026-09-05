import fs from 'fs';
import path from 'path';

import Database from 'better-sqlite3';
import { BrainItem } from './types';

type ItemRow = {
  id: string;
  type: BrainItem['type'];
  title: string;
  content: string | null;
  tags: string | null;
  category: string | null;
  participants: string | null;
  messages: string | null;
  createdAt: string;
  updatedAt: string;
};

function rowToItem(row: ItemRow): BrainItem {
  const item: Record<string, unknown> = { ...row };
  if (row.tags) item.tags = JSON.parse(row.tags);
  if (row.messages) item.messages = JSON.parse(row.messages);
  delete item.tags_raw;
  return item as unknown as BrainItem;
}

const db = new Database('./second-brain.db');

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT,
      tags TEXT,
      category TEXT,
      participants TEXT,
      messages TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )
  `);
  
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `);
}

export function getAllItems(): BrainItem[] {
  const rows = db.prepare('SELECT * FROM items ORDER BY createdAt DESC').all() as ItemRow[];
  return rows.map(rowToItem);
}

export function getItemById(id: string): BrainItem | undefined {
  const row = db.prepare('SELECT * FROM items WHERE id = ?').get(id) as ItemRow | undefined;
  if (!row) return undefined;
  return rowToItem(row);
}

export function searchItems(query: string): BrainItem[] {
  const q = `%${query}%`;
  const rows = db.prepare(`
    SELECT * FROM items 
    WHERE title LIKE ? OR content LIKE ?
    ORDER BY createdAt DESC
  `).all(q, q) as ItemRow[];
  return rows.map(rowToItem);
}

export function filterItems(type?: string, dateFrom?: string, dateTo?: string): BrainItem[] {
  let sql = 'SELECT * FROM items WHERE 1=1';
  const params: (string | null)[] = [];
  
  if (type) {
    sql += ' AND type = ?';
    params.push(type);
  }
  if (dateFrom) {
    sql += ' AND createdAt >= ?';
    params.push(dateFrom);
  }
  if (dateTo) {
    sql += ' AND createdAt <= ?';
    params.push(dateTo);
  }
  
  sql += ' ORDER BY createdAt DESC';
  const rows = db.prepare(sql).all(...params) as ItemRow[];
  return rows.map(rowToItem);
}

export function addItem(item: BrainItem): BrainItem {
  const stmt = db.prepare(`
    INSERT INTO items (id, type, title, content, tags, category, participants, messages, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  stmt.run(
    item.id,
    item.type,
    item.title,
    'content' in item ? item.content : null,
    'tags' in item ? JSON.stringify(item.tags) : null,
    'category' in item ? item.category : null,
    'participants' in item ? JSON.stringify(item.participants) : null,
    'messages' in item ? JSON.stringify(item.messages) : null,
    item.createdAt,
    item.updatedAt
  );
  
  return item;
}


export function updateItem(id: string, updates: Partial<BrainItem>): BrainItem | undefined {
  const existing = getItemById(id);
  if (!existing) return undefined;
  const merged = { ...existing, ...updates, updatedAt: new Date().toISOString() } as BrainItem;
  const stmt = db.prepare(`
    UPDATE items SET
      type = ?, title = ?, content = ?, tags = ?,
      category = ?, participants = ?, messages = ?, updatedAt = ?
    WHERE id = ?
  `);
  stmt.run(
    merged.type,
    merged.title,
    'content' in merged ? merged.content : null,
    'tags' in merged ? JSON.stringify(merged.tags) : null,
    'category' in merged ? merged.category : null,
    'participants' in merged ? JSON.stringify(merged.participants) : null,
    'messages' in merged ? JSON.stringify(merged.messages) : null,
    merged.updatedAt,
    id
  );
  return merged;
}

export function deleteItem(id: string): boolean {
  const res = db.prepare('DELETE FROM items WHERE id = ?').run(id);
  return res.changes > 0;
}

export function getSetting(key: string): string | undefined {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row?.value;
}

export function setSetting(key: string, value: string) {
  db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run(key, value);
}

initDb();
export default db;


export function seedIfEmpty() {
  const count = (db.prepare('SELECT COUNT(*) as c FROM items').get() as { c: number }).c;
  if (count > 0) return;
  // Eerste run: laad demo-data uit public/data/items.json
  type RawItem = Record<string, unknown>;
  try {
    const jsonPath = path.join(process.cwd(), 'public', 'data', 'items.json');
    const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8')) as RawItem[];
    const insert = db.prepare(
      `INSERT OR IGNORE INTO items (id, type, title, content, tags, category, participants, messages, createdAt, updatedAt)
       VALUES (@id, @type, @title, @content, @tags, @category, @participants, @messages, @createdAt, @updatedAt)`
    );
    const tx = db.transaction((rows: RawItem[]) => {
      for (const r of rows) {
        insert.run({
          id: r.id,
          type: r.type,
          title: r.title,
          content: r.content ?? null,
          tags: r.tags ? JSON.stringify(r.tags) : null,
          category: r.category ?? null,
          participants: r.participants ? JSON.stringify(r.participants) : null,
          messages: r.messages ? JSON.stringify(r.messages) : null,
          createdAt: r.createdAt ?? new Date().toISOString(),
          updatedAt: r.updatedAt ?? new Date().toISOString(),
        });
      }
    });
    tx(raw);
    console.log(`[db] seeded ${raw.length} demo items`);
  } catch (e) {
    console.error('[db] seed failed', e);
  }
}

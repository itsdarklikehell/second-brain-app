import { NextRequest, NextResponse } from 'next/server';
import { initDb, seedIfEmpty, addItem } from '@/lib/db';
import { BrainItem } from '@/lib/types';

// better-sqlite3 is a native server module — only safe in a route handler.
initDb();
seedIfEmpty();

export const dynamic = 'force-dynamic';

type NewItem = {
  type: 'memory' | 'note' | 'conversation';
  title: string;
  content?: string;
  tags?: string[];
  category?: string;
  participants?: string[];
  messages?: { role: string; content: string }[];
};

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req: NextRequest) {
  let body: NewItem;
  try {
    body = await req.json();
  } catch {
    return badRequest('invalid JSON body');
  }

  if (!body.type || !['memory', 'note', 'conversation'].includes(body.type)) {
    return badRequest("field 'type' must be one of: memory, note, conversation");
  }
  if (!body.title || typeof body.title !== 'string') {
    return badRequest("field 'title' is required");
  }

  const now = new Date().toISOString();
  const item = {
    id: `${body.type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...body,
    createdAt: now,
    updatedAt: now,
  };

  try {
    const created = addItem(item as unknown as BrainItem);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error('[api/items POST]', err);
    return NextResponse.json({ error: 'db write failed' }, { status: 500 });
  }
}

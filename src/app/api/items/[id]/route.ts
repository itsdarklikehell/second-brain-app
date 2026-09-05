import { NextRequest, NextResponse } from 'next/server';
import { initDb, seedIfEmpty, getItemById, updateItem, deleteItem } from '@/lib/db';

initDb();
seedIfEmpty();

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItemById(id);
  if (!item) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 });
  }
  try {
    const updated = updateItem(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error('[api/items/:id PUT]', err);
    return NextResponse.json({ error: 'db write failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const deleted = deleteItem(id);
    if (!deleted) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error('[api/items/:id DELETE]', err);
    return NextResponse.json({ error: 'db write failed' }, { status: 500 });
  }
}

'use client';

import { useState } from 'react';
import { BrainItem, Memory, Note, Conversation } from '@/lib/types';

interface AddItemFormProps {
  onAdd: (item: BrainItem) => void;
}

export default function AddItemForm({ onAdd }: AddItemFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<'memory' | 'note' | 'conversation'>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const now = new Date().toISOString();
    let newItem: BrainItem;

    if (type === 'memory') {
      newItem = {
        id: Date.now().toString(),
        type: 'memory',
        title,
        content,
        tags: category ? [category] : [],
        createdAt: now,
        updatedAt: now
      } as Memory;
    } else if (type === 'note') {
      newItem = {
        id: Date.now().toString(),
        type: 'note',
        title,
        content,
        category: category || undefined,
        createdAt: now,
        updatedAt: now
      } as Note;
    } else {
      newItem = {
        id: Date.now().toString(),
        type: 'conversation',
        title,
        participants: ['User', 'Assistant'],
        messages: [],
        createdAt: now,
        updatedAt: now
      } as Conversation;
    }

    // POST to API for persistent storage
    try {
      const res = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem),
      });
      if (res.ok) {
        const saved = await res.json();
        onAdd(saved);
      } else {
        console.error('Failed to save item:', await res.text());
      }
    } catch (err) {
      console.error('API call failed:', err);
    }

    setTitle('');
    setContent('');
    setCategory('');
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center text-2xl"
      >
        +
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsOpen(false)}>
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-semibold mb-4 dark:text-white">Add New Item</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Type</label>
            <select
              value={type}
              onChange={e => setType(e.target.value as 'memory' | 'note' | 'conversation')}
              className="w-full px-3 py-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
            >
              <option value="note">Note</option>
              <option value="memory">Memory</option>
              <option value="conversation">Conversation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              placeholder="Enter title..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Content</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-white h-32"
              placeholder="Enter content..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 dark:text-zinc-300">Category/Tag</label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-white"
              placeholder="Optional..."
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 rounded-lg border dark:border-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
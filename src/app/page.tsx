'use client';

import { useState, useEffect } from 'react';
import { BrainItem } from '@/lib/types';
import ItemList from '@/components/ItemList';
import SearchDialog from '@/components/SearchDialog';
import AddItemForm from '@/components/AddItemForm';

export default function Home() {
  const [items, setItems] = useState<BrainItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [view, setView] = useState<'all' | 'memories' | 'notes' | 'conversations'>('all');

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => setItems(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  const handleAddItem = (item: BrainItem) => {
    setItems(prev => [...prev, item]);
  };

  const filteredItems = items.filter(item => {
    if (view === 'all') return true;
    // View tabs use plural labels; map them to the singular item types.
    const typeMap: Record<'memories' | 'notes' | 'conversations', string> = {
      memories: 'memory',
      notes: 'note',
      conversations: 'conversation',
    };
    return item.type === typeMap[view];
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold dark:text-white">Second Brain</h1>
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700"
          >
            <span>Search...</span>
            <kbd className="text-xs px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded">⌘K</kbd>
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto p-6">
        {/* View Tabs */}
        <div className="flex gap-2 mb-6">
          {(['all', 'memories', 'notes', 'conversations'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setView(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                view === tab
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                  : 'bg-white dark:bg-zinc-800 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Item Count */}
        <p className="text-sm text-zinc-500 mb-4">
          {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
        </p>

        {/* List */}
        <ItemList items={filteredItems} />
      </main>

      {/* Search Dialog */}
      <SearchDialog
        items={items}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Add Form */}
      <AddItemForm onAdd={handleAddItem} />
    </div>
  );
}
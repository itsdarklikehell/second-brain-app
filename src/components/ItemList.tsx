'use client';

import { useState } from 'react';
import { BrainItem } from '@/lib/types';
import DeleteButton from '@/components/DeleteButton';

interface ItemListProps {
  items: BrainItem[];
  onDelete?: (id: string) => void;
}

export default function ItemList({ items, onDelete }: ItemListProps) {
  const [filterType, setFilterType] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt'>('createdAt');

  const filteredItems = items
    .filter(item => {
      if (filterType && item.type !== filterType) return false;
      if (dateFrom && item.createdAt < dateFrom) return false;
      if (dateTo && item.createdAt > dateTo) return false;
      return true;
    })
    .sort((a, b) => {
      const dateA = new Date(a[sortBy]).getTime();
      const dateB = new Date(b[sortBy]).getTime();
      return dateB - dateA;
    });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('nl-NL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'memory':
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'note':
        return 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300';
      case 'conversation':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-zinc-100 dark:bg-zinc-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 p-4 bg-white dark:bg-zinc-800/50 rounded-xl border dark:border-zinc-700/50">
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 bg-zinc-50"
        >
          <option value="">All types</option>
          <option value="memory">Memory</option>
          <option value="note">Note</option>
          <option value="conversation">Conversation</option>
        </select>
        
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'createdAt' | 'updatedAt')}
          className="px-3 py-2 text-sm rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 bg-zinc-50"
        >
          <option value="createdAt">Sort by Created</option>
          <option value="updatedAt">Sort by Updated</option>
        </select>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">From:</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 bg-zinc-50"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-500">To:</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-200 bg-zinc-50"
          />
        </div>

        {(filterType || dateFrom || dateTo) && (
          <button
            onClick={() => { setFilterType(''); setDateFrom(''); setDateTo(''); }}
            className="px-3 py-2 text-sm text-red-600 hover:text-red-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 text-lg">No items found</p>
            <p className="text-zinc-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div
              key={item.id}
              className="p-4 bg-white dark:bg-zinc-800/50 border rounded-xl hover:shadow-md hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 cursor-pointer transition-all duration-200 dark:border-zinc-700/50 group"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getTypeColor(item.type)}`}>
                  {item.type}
                </span>
                <span className="text-xs text-zinc-400">
                  {formatDate(item.createdAt)}
                </span>
                {item.updatedAt !== item.createdAt && (
                  <span className="text-xs text-zinc-500">
                    · updated {formatDate(item.updatedAt)}
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-zinc-800 dark:text-zinc-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              {'content' in item && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                  {item.content}
                </p>
              )}
              {'messages' in item && (
                <p className="text-sm text-zinc-500">
                  {item.messages.length} message{item.messages.length !== 1 ? 's' : ''}
                </p>
              )}
              {'tags' in item && item.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-zinc-100 dark:bg-zinc-700 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {onDelete && <DeleteButton item={item} onDelete={onDelete} />}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
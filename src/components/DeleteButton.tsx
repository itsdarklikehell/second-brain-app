'use client';

import { BrainItem } from '@/lib/types';

interface DeleteButtonProps {
  item: BrainItem;
  onDelete: (id: string) => void;
}

export default function DeleteButton({ item, onDelete }: DeleteButtonProps) {
  const handleDelete = () => {
    if (window.confirm(`Delete "${item.title}"?`)) {
      onDelete(item.id);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="ml-auto text-xs text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
      title="Delete item"
    >
      Delete
    </button>
  );
}

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { BoardData } from '../types';

interface EditBoardDialogProps {
  board: BoardData;
  onClose: () => void;
  onSave: (boardId: string, updates: Partial<BoardData>) => void;
}

export function EditBoardDialog({ board, onClose, onSave }: EditBoardDialogProps) {
  const [name, setName] = useState(board.name);
  const [description, setDescription] = useState(board.description || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(board.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Board</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Board Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Add a more detailed description..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 
                hover:bg-gray-50 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || name === board.name}
              className="px-4 py-2 text-sm font-medium text-white 
                bg-indigo-600 hover:bg-indigo-700 rounded-md 
                disabled:opacity-50"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
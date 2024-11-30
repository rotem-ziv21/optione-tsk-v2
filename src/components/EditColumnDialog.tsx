import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Column } from '../types';

interface EditColumnDialogProps {
  column: Column;
  onClose: () => void;
  onSave: (columnId: string, newTitle: string) => void;
  onDelete: (columnId: string) => void;
}

export function EditColumnDialog({
  column,
  onClose,
  onSave,
  onDelete,
}: EditColumnDialogProps) {
  const [title, setTitle] = useState(column.title);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onSave(column.id, title.trim());
      onClose();
    }
  };

  const handleDelete = () => {
    onDelete(column.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md m-4">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Edit Column</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Column Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-b-lg">
            {isConfirmingDelete ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-red-600">Delete this column?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-3 py-1 text-sm font-medium text-white bg-red-600 
                    hover:bg-red-700 rounded-md"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(false)}
                  className="px-3 py-1 text-sm font-medium text-gray-700 
                    hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium 
                  text-red-600 hover:bg-red-50 rounded-md"
              >
                <Trash2 size={16} />
                Delete Column
              </button>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 
                  hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || title === column.title}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 
                  hover:bg-indigo-700 rounded-md disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
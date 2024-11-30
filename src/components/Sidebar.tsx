import React, { useState } from 'react';
import { BoardData } from '../types';
import { Layout, Plus, X, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  boards: BoardData[];
  activeBoard: BoardData;
  onBoardSelect: (board: BoardData) => void;
  width: number;
  onResize: (width: number) => void;
  isOpen: boolean;
  onAddBoard: (name: string) => void;
}

export function Sidebar({
  boards,
  activeBoard,
  onBoardSelect,
  width,
  onResize,
  isOpen,
  onAddBoard,
}: SidebarProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      const newWidth = Math.max(200, Math.min(400, e.clientX));
      onResize(newWidth);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const handleAddBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newBoardName.trim()) {
      onAddBoard(newBoardName.trim());
      setNewBoardName('');
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: -width }}
          animate={{ x: 0, width }}
          exit={{ x: -width }}
          transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
          style={{ width }}
          className="fixed left-0 top-0 h-screen glass-effect backdrop-blur-xl flex flex-col z-10"
        >
          <div className="flex items-center gap-2 p-3 border-b border-gray-100">
            <Layout className="text-indigo-600" size={18} />
            <h2 className="text-base font-semibold text-gray-900">Boards</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            <AnimatePresence>
              {boards.map((board) => (
                <motion.button
                  key={board.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onClick={() => onBoardSelect(board)}
                  className={`w-full text-left px-3 py-2 rounded-lg mb-1 text-sm transition-all
                    ${board.id === activeBoard.id
                      ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  {board.name}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {isAdding ? (
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onSubmit={handleAddBoard}
              className="p-2"
            >
              <div className="flex items-center gap-2 p-2 bg-white rounded-lg shadow-sm">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  className="flex-1 bg-transparent border-none text-sm focus:ring-0"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.form>
          ) : (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 p-3 hover:bg-gray-50"
            >
              <Plus size={14} />
              <span>Add Board</span>
            </button>
          )}

          {/* Resizer Handle */}
          <div
            className="absolute right-0 top-0 w-1 h-full cursor-col-resize hover:bg-indigo-400/50 group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 -mr-1.5
              opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-full bg-indigo-400/50 mx-auto rounded-full" />
            </div>
          </div>

          {isResizing && (
            <div className="fixed inset-0 bg-transparent cursor-col-resize z-50" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
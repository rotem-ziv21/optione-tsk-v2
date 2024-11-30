import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Zap, ToggleLeft, ToggleRight } from 'lucide-react';
import { BoardData, Automation } from '../types';
import { useAutomations } from '../hooks/useAutomations';
import { CreateAutomationDialog } from './CreateAutomationDialog';

interface BoardAutomationsProps {
  board: BoardData;
  onUpdate: (boardId: string, updates: Partial<BoardData>) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function BoardAutomations({ board, onUpdate, isOpen, onClose }: BoardAutomationsProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateAutomation } = useAutomations(board);

  const handleAddAutomation = async (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);

      if (!validateAutomation(automation)) {
        return;
      }

      const newAutomation: Automation = {
        ...automation,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await onUpdate(board.id, {
        automations: [...(board.automations || []), newAutomation]
      });

      setIsCreating(false);
    } catch (err) {
      console.error('Failed to add automation:', err);
      setError('Failed to add automation');
    }
  };

  const handleToggleAutomation = async (automationId: string, enabled: boolean) => {
    try {
      setError(null);
      const updatedAutomations = (board.automations || []).map(automation =>
        automation.id === automationId
          ? { ...automation, enabled, updatedAt: new Date().toISOString() }
          : automation
      );

      await onUpdate(board.id, { automations: updatedAutomations });
    } catch (err) {
      console.error('Failed to toggle automation:', err);
      setError('Failed to toggle automation');
    }
  };

  const handleDeleteAutomation = async (automationId: string) => {
    try {
      setError(null);
      const updatedAutomations = (board.automations || []).filter(
        automation => automation.id !== automationId
      );

      await onUpdate(board.id, { automations: updatedAutomations });
    } catch (err) {
      console.error('Failed to delete automation:', err);
      setError('Failed to delete automation');
    }
  };

  return (
    <>
      {/* Main Automations Dialog */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Zap className="text-indigo-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Board Automations
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-4">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {(board.automations || []).map((automation) => (
                      <motion.div
                        key={automation.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {automation.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Trigger: {automation.trigger.type}
                            {automation.trigger.statusFilter && ` (when status is ${automation.trigger.statusFilter})`}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleToggleAutomation(automation.id, !automation.enabled)}
                            className={`p-1 rounded-md transition-colors ${
                              automation.enabled
                                ? 'text-green-600 hover:bg-green-50'
                                : 'text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {automation.enabled ? (
                              <ToggleRight size={24} />
                            ) : (
                              <ToggleLeft size={24} />
                            )}
                          </button>

                          <button
                            onClick={() => handleDeleteAutomation(automation.id)}
                            className="p-1 text-gray-400 hover:text-red-600 
                              hover:bg-red-50 rounded-md"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {(!board.automations || board.automations.length === 0) && (
                    <div className="text-center py-8">
                      <Zap className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No automations yet
                      </h3>
                      <p className="text-gray-500 mb-4">
                        Create your first automation to automate repetitive tasks
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 
                      text-white rounded-md hover:bg-indigo-700 w-full justify-center"
                  >
                    <Plus size={20} />
                    Add Automation
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Automation Dialog */}
      {isCreating && (
        <CreateAutomationDialog
          onClose={() => setIsCreating(false)}
          onAdd={handleAddAutomation}
          members={board.members || []}
          board={board}
        />
      )}
    </>
  );
}
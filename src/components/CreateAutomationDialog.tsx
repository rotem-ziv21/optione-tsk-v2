{/* Previous imports remain the same */}
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Trash2 } from 'lucide-react';
import { Automation, Member, BoardData } from '../types';

interface CreateAutomationDialogProps {
  onClose: () => void;
  onAdd: (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>) => void;
  members: Member[];
  board: BoardData; // Add board prop to access columns
}

export function CreateAutomationDialog({ onClose, onAdd, members, board }: CreateAutomationDialogProps) {
  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<Automation['trigger']>({
    type: 'taskMoved',
    conditions: [],
    statusFilter: undefined
  });
  const [actions, setActions] = useState<Automation['actions']>([]);

  const handleAddAction = () => {
    setActions([...actions, { type: 'moveTask', value: '' }]);
  };

  const handleRemoveAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleUpdateAction = (index: number, updates: Partial<Automation['actions'][0]>) => {
    setActions(actions.map((action, i) => 
      i === index ? { ...action, ...updates } : action
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !actions.length) return;

    onAdd({
      name: name.trim(),
      trigger,
      actions,
      enabled: true
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Automation
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter automation name"
            />
          </div>

          {/* Trigger */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trigger
            </label>
            <select
              value={trigger.type}
              onChange={(e) => setTrigger({ 
                type: e.target.value as Automation['trigger']['type'], 
                conditions: [],
                statusFilter: undefined 
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="taskMoved">Task Moved</option>
              <option value="taskCreated">Task Created</option>
              <option value="statusChanged">Status Changed</option>
              <option value="taskUpdated">Task Updated</option>
              <option value="dueDateApproaching">Due Date Approaching</option>
              <option value="checklistCompleted">Checklist Completed</option>
            </select>

            {/* Status Filter for statusChanged trigger */}
            {trigger.type === 'statusChanged' && (
              <div className="mt-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  When Status Changes To
                </label>
                <select
                  value={trigger.statusFilter || ''}
                  onChange={(e) => setTrigger({ 
                    ...trigger, 
                    statusFilter: e.target.value || undefined 
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Status</option>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actions
            </label>
            <div className="space-y-2">
              {actions.map((action, index) => (
                <div key={index} className="flex gap-2">
                  <select
                    value={action.type}
                    onChange={(e) => handleUpdateAction(index, { 
                      type: e.target.value as Automation['actions'][0]['type'],
                      value: '' 
                    })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="moveTask">Move Task</option>
                    <option value="setStatus">Set Status</option>
                    <option value="setPriority">Set Priority</option>
                    <option value="assignTo">Assign To</option>
                    <option value="addLabel">Add Label</option>
                    <option value="removeLabel">Remove Label</option>
                  </select>

                  {/* Value input based on action type */}
                  {action.type === 'moveTask' && (
                    <select
                      value={action.value}
                      onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Column</option>
                      {board.columns.map((column) => (
                        <option key={column.id} value={column.id}>
                          {column.title}
                        </option>
                      ))}
                    </select>
                  )}

                  {action.type === 'setStatus' && (
                    <select
                      value={action.value}
                      onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Status</option>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  )}

                  {action.type === 'setPriority' && (
                    <select
                      value={action.value}
                      onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  )}

                  {action.type === 'assignTo' && (
                    <select
                      value={action.value}
                      onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Member</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  )}

                  {(action.type === 'addLabel' || action.type === 'removeLabel') && (
                    <input
                      type="text"
                      value={action.value}
                      onChange={(e) => handleUpdateAction(index, { value: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter label"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => handleRemoveAction(index)}
                    className="p-2 text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddAction}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium
                  text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 
                  rounded-md w-full justify-center"
              >
                <Plus size={16} />
                Add Action
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
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
              disabled={!name.trim() || !actions.length}
              className="px-4 py-2 text-sm font-medium text-white 
                bg-indigo-600 hover:bg-indigo-700 rounded-md
                disabled:opacity-50"
            >
              Create Automation
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
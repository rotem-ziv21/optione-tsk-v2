import React, { useState } from 'react';
import { Filter, X, Calendar, User, Tag } from 'lucide-react';
import { Task, Member } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskFiltersProps {
  members: Member[];
  onFilterChange: (filters: TaskFilters) => void;
}

export interface TaskFilters {
  priority?: Task['priority'];
  assignee?: string;
  dueDate?: 'overdue' | 'today' | 'week' | 'none';
  labels?: string[];
  search?: string;
}

export function TaskFilters({ members, onFilterChange }: TaskFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilters>({});

  const handleFilterChange = (updates: Partial<TaskFilters>) => {
    const newFilters = { ...filters, ...updates };
    // Remove empty filters
    Object.keys(newFilters).forEach(key => {
      if (!newFilters[key as keyof TaskFilters]) {
        delete newFilters[key as keyof TaskFilters];
      }
    });
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    onFilterChange({});
  };

  const activeFiltersCount = Object.keys(filters).length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
          transition-colors ${activeFiltersCount > 0 
            ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
      >
        <Filter size={16} />
        <span>Filter</span>
        {activeFiltersCount > 0 && (
          <span className="min-w-[20px] h-5 flex items-center justify-center 
            bg-indigo-100 text-indigo-600 rounded-full text-xs">
            {activeFiltersCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-20"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg 
                border border-gray-200 p-4 z-30"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterChange({ search: e.target.value })}
                    placeholder="Search tasks..."
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={filters.priority || ''}
                    onChange={(e) => handleFilterChange({ 
                      priority: e.target.value as Task['priority'] || undefined 
                    })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Assignee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <User size={14} />
                      <span>Assignee</span>
                    </div>
                  </label>
                  <select
                    value={filters.assignee || ''}
                    onChange={(e) => handleFilterChange({ assignee: e.target.value || undefined })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All assignees</option>
                    <option value="unassigned">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>Due Date</span>
                    </div>
                  </label>
                  <select
                    value={filters.dueDate || ''}
                    onChange={(e) => handleFilterChange({ 
                      dueDate: e.target.value as TaskFilters['dueDate'] || undefined 
                    })}
                    className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Any time</option>
                    <option value="overdue">Overdue</option>
                    <option value="today">Due today</option>
                    <option value="week">Due this week</option>
                    <option value="none">No due date</option>
                  </select>
                </div>

                {/* Active Filters */}
                {activeFiltersCount > 0 && (
                  <div className="pt-2 border-t">
                    <h4 className="text-xs font-medium text-gray-500 mb-2">Active Filters</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(filters).map(([key, value]) => (
                        <button
                          key={key}
                          onClick={() => handleFilterChange({ [key]: undefined })}
                          className="group flex items-center gap-1 px-2 py-1 bg-indigo-50 
                            text-indigo-600 rounded-full text-xs font-medium"
                        >
                          <span>{value}</span>
                          <X size={12} className="opacity-50 group-hover:opacity-100" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
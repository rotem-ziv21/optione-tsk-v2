import React from 'react';
import { Column as ColumnType, Task, Member } from '../types';
import { TaskCard } from './TaskCard';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreVertical } from 'lucide-react';
import { motion } from 'framer-motion';

interface ColumnProps {
  column: ColumnType;
  columns: ColumnType[];
  onAddTask: (columnId: string) => void;
  onEdit: () => void;
  onTaskClick: (task: Task) => void;
  onMoveTask: (taskId: string, columnId: string) => Promise<void>;
  onUpdateStatus: (taskId: string, status: Task['status']) => Promise<void>;
  isActive?: boolean;
  members: Member[];
}

export function Column({ 
  column, 
  columns,
  onAddTask, 
  onEdit, 
  onTaskClick,
  onMoveTask,
  onUpdateStatus,
  isActive,
  members
}: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const getAssigneeName = (assigneeId?: string) => {
    if (!assigneeId) return undefined;
    const member = members.find(m => m.id === assigneeId);
    return member ? member.name : undefined;
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`w-[320px] flex-shrink-0 flex flex-col bg-gray-50/80 rounded-lg
        ${isActive ? 'ring-2 ring-indigo-400 ring-opacity-50' : ''}`}
    >
      {/* Column Header */}
      <div className="p-3 border-b border-gray-200/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-medium text-gray-900">{column.title}</h2>
            <span className="px-2 py-0.5 bg-gray-200/50 text-gray-600 rounded-full text-xs">
              {column.tasks.length}
            </span>
          </div>
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md 
              hover:bg-gray-200/50 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
        </div>

        <button
          onClick={() => onAddTask(column.id)}
          className="mt-2 w-full flex items-center justify-center gap-1.5 px-3 py-1.5
            text-gray-600 hover:text-gray-900 text-sm font-medium
            hover:bg-gray-200/50 rounded-md transition-colors"
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>

      {/* Tasks Container */}
      <div 
        ref={setNodeRef}
        className={`flex-1 p-2 overflow-y-auto space-y-2 min-h-[200px]
          ${isActive ? 'bg-indigo-50/30' : ''}`}
      >
        <SortableContext
          items={column.tasks.map(task => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task}
              columns={columns}
              onEdit={() => onTaskClick(task)}
              onMoveTask={onMoveTask}
              onUpdateStatus={onUpdateStatus}
              assigneeName={getAssigneeName(task.assignee)}
            />
          ))}
        </SortableContext>
        
        {column.tasks.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            Drop tasks here
          </div>
        )}
      </div>
    </motion.div>
  );
}
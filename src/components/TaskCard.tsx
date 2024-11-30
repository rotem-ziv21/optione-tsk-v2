import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  AlertCircle, 
  Calendar, 
  GripVertical, 
  MessageSquare, 
  Paperclip,
  CheckSquare,
  User,
  ChevronDown
} from 'lucide-react';
import { Task, Column } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskCardProps {
  task: Task;
  columns?: Column[];
  onEdit?: () => void;
  onMoveTask?: (taskId: string, columnId: string) => Promise<void>;
  onUpdateStatus?: (taskId: string, status: Task['status']) => Promise<void>;
  assigneeName?: string;
}

const statusColors = {
  todo: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  in_progress: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  completed: 'bg-green-100 text-green-800 hover:bg-green-200',
  blocked: 'bg-red-100 text-red-800 hover:bg-red-200'
};

const statusLabels = {
  todo: 'To Do',
  in_progress: 'In Progress',
  completed: 'Completed',
  blocked: 'Blocked'
};

export function TaskCard({ 
  task, 
  columns, 
  onEdit, 
  onMoveTask,
  onUpdateStatus,
  assigneeName 
}: TaskCardProps) {
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Format due date
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  // Ensure arrays exist
  const checklist = task.checklist || [];
  const labels = task.labels || [];
  const comments = task.comments || [];
  const attachments = task.attachments || [];

  // Calculate progress
  const completedItems = checklist.filter(item => item.isCompleted).length;
  const totalItems = checklist.length;
  const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

  const handleStatusChange = async (newStatus: Task['status']) => {
    if (isUpdating || !onUpdateStatus) return;

    try {
      setIsUpdating(true);
      await onUpdateStatus(task.id, newStatus);
      setShowStatusMenu(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const isDueDateOverdue = task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`group relative bg-white rounded-lg shadow-sm border border-gray-200 
        hover:shadow-md hover:border-gray-300 transition-all duration-200 
        ${isDragging ? 'opacity-50 rotate-3 scale-105' : ''}`}
    >
      <div className="p-3" onClick={onEdit}>
        {/* Status Badge with Dropdown */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex gap-2">
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowStatusMenu(!showStatusMenu);
                }}
                disabled={isUpdating}
                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs 
                  font-medium transition-colors ${statusColors[task.status]} 
                  ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {statusLabels[task.status]}
                <ChevronDown size={12} className={`transform transition-transform 
                  ${showStatusMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showStatusMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStatusMenu(false);
                      }}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute left-0 top-full mt-1 z-20 bg-white rounded-lg 
                        shadow-lg border border-gray-200 py-1 min-w-[120px]"
                    >
                      {Object.entries(statusLabels).map(([status, label]) => (
                        <button
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(status as Task['status']);
                          }}
                          disabled={isUpdating}
                          className={`w-full text-left px-3 py-1.5 text-xs
                            ${task.status === status ? 'bg-gray-50' : 'hover:bg-gray-50'}
                            ${statusColors[status as Task['status']].replace('bg-', 'hover:bg-')}`}
                        >
                          {label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {task.priority === 'high' && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-700 
                bg-red-50 px-2 py-1 rounded-full">
                <AlertCircle size={12} />
                High Priority
              </span>
            )}
          </div>
          
          <button
            {...listeners}
            className="text-gray-400 hover:text-gray-600 touch-none"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical size={16} />
          </button>
        </div>

        {/* Labels */}
        {labels.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {labels.map((label) => (
              <span
                key={label}
                className="px-2 py-0.5 rounded-full text-xs font-medium 
                  bg-indigo-100 text-indigo-800"
              >
                {label}
              </span>
            ))}
          </div>
        )}

        {/* Title & Description */}
        <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
        {task.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Progress Bar */}
        {checklist.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Task Metadata */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
          {task.dueDate && (
            <div className={`flex items-center gap-1 px-2 py-1 rounded-md
              ${isDueDateOverdue ? 'bg-red-50 text-red-700' : 'bg-gray-50'}`}>
              <Calendar size={12} />
              <span>{formatDueDate(task.dueDate)}</span>
            </div>
          )}

          {task.assignee && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <User size={12} />
              <span>{assigneeName || task.assignee}</span>
            </div>
          )}

          {comments.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <MessageSquare size={12} />
              <span>{comments.length}</span>
            </div>
          )}

          {attachments.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <Paperclip size={12} />
              <span>{attachments.length}</span>
            </div>
          )}

          {checklist.length > 0 && (
            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
              <CheckSquare size={12} />
              <span>{completedItems}/{totalItems}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
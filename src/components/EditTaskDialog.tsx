import React, { useState } from 'react';
import { X, Calendar, Plus, CheckSquare, User, Trash2, Paperclip, MessageSquare } from 'lucide-react';
import { Task, ChecklistItem, Member, Attachment, TimeEntry, Comment } from '../types';
import { FileUpload } from './FileUpload';
import { AttachmentList } from './AttachmentList';
import { TimeTracking } from './TimeTracking';
import { TaskComments } from './TaskComments';
import { useAuth } from '../hooks/useAuth';

interface EditTaskDialogProps {
  task: Task;
  members: Member[];
  onClose: () => void;
  onSave: (taskId: string, updatedTask: Partial<Task>) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
}

export function EditTaskDialog({
  task,
  members,
  onClose,
  onSave,
  onDelete,
}: EditTaskDialogProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);
  const [status, setStatus] = useState(task.status || 'todo');
  const [dueDate, setDueDate] = useState(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
  const [labels, setLabels] = useState(task.labels || []);
  const [assignee, setAssignee] = useState(task.assignee || '');
  const [newLabel, setNewLabel] = useState('');
  const [checklist, setChecklist] = useState(task.checklist || []);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [attachments, setAttachments] = useState(task.attachments || []);
  const [timeEntries, setTimeEntries] = useState(task.timeEntries || []);
  const [comments, setComments] = useState(task.comments || []);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'time' | 'comments'>('details');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      const newItem: ChecklistItem = {
        id: Math.random().toString(36).substr(2, 9),
        content: newChecklistItem.trim(),
        isCompleted: false,
      };
      setChecklist([...checklist, newItem]);
      setNewChecklistItem('');
    }
  };

  const handleToggleChecklistItem = async (itemId: string) => {
    try {
      const updatedChecklist = checklist.map(item =>
        item.id === itemId
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      );
      
      setChecklist(updatedChecklist);

      // Save immediately when toggling checklist items
      await onSave(task.id, {
        checklist: updatedChecklist,
        updatedAt: new Date().toISOString()
      });

    } catch (err) {
      console.error('Failed to update checklist item:', err);
      setError('Failed to update checklist item');
      
      // Revert the change if save failed
      setChecklist(checklist);
    }
  };

  const handleRemoveChecklistItem = (itemId: string) => {
    setChecklist(checklist.filter(item => item.id !== itemId));
  };

  const handleFileUpload = (attachment: Attachment) => {
    setAttachments([...attachments, attachment]);
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    setAttachments(attachments.filter(att => att.id !== attachmentId));
  };

  const handleAddTimeEntry = async (entry: Omit<TimeEntry, 'id'>) => {
    const newEntry: TimeEntry = {
      id: Math.random().toString(36).substr(2, 9),
      ...entry
    };
    setTimeEntries([...timeEntries, newEntry]);
  };

  const handleAddComment = async (content: string) => {
    if (!user) return;

    const newComment: Comment = {
      id: Math.random().toString(36).substr(2, 9),
      content,
      author: {
        id: user.uid,
        name: user.displayName || 'Anonymous'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setComments([...comments, newComment]);
  };

  const handleEditComment = async (commentId: string, content: string) => {
    setComments(comments.map(comment =>
      comment.id === commentId
        ? { 
            ...comment, 
            content,
            updatedAt: new Date().toISOString()
          }
        : comment
    ));
  };

  const handleDeleteComment = async (commentId: string) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  const handleSave = async () => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError(null);

      // Convert the date string to ISO format if it exists
      const formattedDueDate = dueDate ? new Date(dueDate).toISOString() : undefined;

      await onSave(task.id, {
        title,
        description,
        priority,
        status,
        dueDate: formattedDueDate,
        labels,
        assignee,
        checklist,
        attachments,
        timeEntries,
        comments,
        updatedAt: new Date().toISOString()
      });

      onClose();
    } catch (err) {
      console.error('Failed to save task:', err);
      setError('Failed to save task');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Edit Task</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
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

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md 
                  focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Task['priority'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Task['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="dueDate"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md 
                      focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Calendar className="absolute right-3 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label htmlFor="assignee" className="block text-sm font-medium text-gray-700 mb-1">
                  Assignee
                </label>
                <select
                  id="assignee"
                  value={assignee}
                  onChange={(e) => setAssignee(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Unassigned</option>
                  {members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Labels */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Labels
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {labels.map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 
                      text-indigo-800 rounded-full text-sm"
                  >
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="text-indigo-600 hover:text-indigo-800"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Add a label"
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLabel();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddLabel}
                  disabled={!newLabel.trim()}
                  className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 
                    rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Checklist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Checklist
              </label>
              <div className="space-y-2 mb-2">
                {checklist.map((item) => (
                  <div key={item.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={item.isCompleted}
                      onChange={() => handleToggleChecklistItem(item.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={item.isCompleted ? 'line-through text-gray-500' : ''}>
                      {item.content}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="ml-auto text-gray-400 hover:text-red-600"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  placeholder="Add checklist item"
                  className="flex-1 px-3 py-1 text-sm border border-gray-300 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddChecklistItem();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddChecklistItem}
                  disabled={!newChecklistItem.trim()}
                  className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 
                    rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-1">
                  <Paperclip size={16} />
                  <span>Attachments</span>
                </div>
              </label>
              
              <AttachmentList
                attachments={attachments}
                onRemove={handleRemoveAttachment}
              />

              <div className="mt-2">
                <FileUpload
                  onFileUpload={handleFileUpload}
                  onError={() => {}}
                />
              </div>
            </div>

            {/* Time Tracking */}
            <TimeTracking
              task={task}
              onTimeEntryAdd={handleAddTimeEntry}
            />

            {/* Comments */}
            <TaskComments
              comments={comments}
              members={members}
              currentUserId={user?.uid || ''}
              onAddComment={handleAddComment}
              onEditComment={handleEditComment}
              onDeleteComment={handleDeleteComment}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-red-600">Delete this task?</span>
              <button
                type="button"
                onClick={() => onDelete(task.id)}
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
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 
                hover:bg-red-50 rounded-md"
            >
              <Trash2 size={16} />
              Delete Task
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
              type="button"
              onClick={handleSave}
              disabled={!title.trim() || isSaving}
              className="px-4 py-2 text-sm font-medium text-white 
                bg-indigo-600 hover:bg-indigo-700 rounded-md 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
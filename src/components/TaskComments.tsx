import React, { useState } from 'react';
import { Send, Edit2, Trash2, X } from 'lucide-react';
import { Comment, Member } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskCommentsProps {
  comments: Comment[];
  members: Member[];
  currentUserId: string;
  onAddComment: (content: string) => Promise<void>;
  onEditComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export function TaskComments({
  comments,
  members,
  currentUserId,
  onAddComment,
  onEditComment,
  onDeleteComment
}: TaskCommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onAddComment(newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment:', err);
      setError('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (commentId: string) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onEditComment(commentId, editContent.trim());
      setEditingComment(null);
    } catch (err) {
      console.error('Failed to edit comment:', err);
      setError('Failed to edit comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);
      await onDeleteComment(commentId);
    } catch (err) {
      console.error('Failed to delete comment:', err);
      setError('Failed to delete comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  return (
    <div className="space-y-4">
      {/* Comments List */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        <AnimatePresence>
          {comments.map((comment) => (
            <motion.div
              key={comment.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex gap-3"
            >
              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0
                flex items-center justify-center text-indigo-600 text-sm font-medium">
                {comment.author.name.charAt(0).toUpperCase()}
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-sm text-gray-900">
                      {comment.author.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(comment.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded
                          focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingComment(null)}
                          disabled={isSubmitting}
                          className="px-2 py-1 text-xs font-medium text-gray-600
                            hover:text-gray-900"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleEdit(comment.id)}
                          disabled={!editContent.trim() || isSubmitting}
                          className="px-2 py-1 text-xs font-medium text-white
                            bg-indigo-600 rounded hover:bg-indigo-700
                            disabled:opacity-50"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {currentUserId === comment.author.id && !editingComment && (
                  <div className="flex items-center gap-2 mt-1 ml-2">
                    <button
                      onClick={() => startEdit(comment)}
                      disabled={isSubmitting}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={isSubmitting}
                      className="text-xs text-gray-500 hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {comments.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-4">
            No comments yet. Start the conversation!
          </p>
        )}
      </div>

      {/* New Comment Form */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-indigo-500
            disabled:opacity-50"
          disabled={isSubmitting}
        />
        
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="absolute right-2 bottom-2 p-1.5 text-gray-400
            hover:text-indigo-600 rounded-md hover:bg-indigo-50
            disabled:opacity-50 disabled:hover:bg-transparent"
        >
          <Send size={16} />
        </button>
      </form>

      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
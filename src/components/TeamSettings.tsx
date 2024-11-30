import React from 'react';
import { User, X, Mail, Shield } from 'lucide-react';
import { Member, BoardData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTeam } from '../hooks/useTeam';

interface TeamSettingsProps {
  board: BoardData;
  onUpdate: (boardId: string, updates: Partial<BoardData>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamSettings({ board, onUpdate, isOpen, onClose }: TeamSettingsProps) {
  const { members, loading, error } = useTeam(board.businessId);

  const handleUpdateMemberRole = async (memberId: string, newRole: Member['role']) => {
    try {
      const updatedMembers = (board.members || []).map(m =>
        m.id === memberId ? { ...m, role: newRole } : m
      );

      await onUpdate(board.id, { members: updatedMembers });
    } catch (err) {
      console.error('Error updating member role:', err);
    }
  };

  return (
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
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <User className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
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

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {members.map((member) => (
                      <motion.div
                        key={member.id}
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-indigo-600" />
                            )}
                          </div>

                          <div>
                            <h3 className="font-medium text-gray-900">{member.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Mail size={14} />
                              <span>{member.email}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-md">
                            <Shield size={14} className="text-indigo-600" />
                            <span className="text-sm font-medium text-indigo-600 capitalize">
                              {member.role}
                            </span>
                          </div>

                          <select
                            value={member.role}
                            onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as Member['role'])}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1
                              focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {members.length === 0 && (
                    <div className="text-center py-8">
                      <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No team members yet
                      </h3>
                      <p className="text-gray-500">
                        Team members can be added by an admin from the admin dashboard.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
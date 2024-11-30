import React, { useState } from 'react';
import { Users, Plus, X, Mail, Lock, UserPlus } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminTeamManagementProps {
  businessId: string;
  businessName: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminTeamManagement({ 
  businessId, 
  businessName,
  isOpen, 
  onClose,
  onSuccess 
}: AdminTeamManagementProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !name) return;

    try {
      setLoading(true);
      setError(null);

      // Create the user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const { user } = userCredential;

      // Create user document
      await setDoc(doc(db, 'users', user.uid), {
        email,
        displayName: name,
        businessId,
        role: 'member',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Clear form
      setEmail('');
      setPassword('');
      setName('');
      onSuccess();

    } catch (err: any) {
      console.error('Error adding team member:', err);
      let message = 'Failed to add team member';
      
      switch (err.code) {
        case 'auth/email-already-in-use':
          message = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/weak-password':
          message = 'Password should be at least 6 characters';
          break;
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <Users className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Add Team Member
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
              <p className="text-sm text-gray-600 mb-4">
                Adding team member to: <span className="font-medium">{businessName}</span>
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <form onSubmit={handleAddMember} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter team member's name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter password"
                      required
                      minLength={6}
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
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
                    disabled={loading || !email || !password || !name}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                      text-white bg-indigo-600 hover:bg-indigo-700 rounded-md
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        <span>Add Member</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
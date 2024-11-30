import React, { useState, useCallback } from 'react';
import { Board } from './Board';
import { Layout, Menu, Users, Plus, Pencil, LogOut, BarChart, Zap, Bell } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { TeamSettings } from './TeamSettings';
import { EditBoardDialog } from './EditBoardDialog';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { BoardAutomations } from './BoardAutomations';
import { NotificationSettings } from './NotificationSettings';
import { useBoards } from '../hooks/useBoards';
import { useAuth } from '../hooks/useAuth';
import { BoardData } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export function ProjectManagement() {
  const { user, business, signOut } = useAuth();
  const { boards, loading, error: boardsError, addBoard, updateBoard } = useBoards();
  const [activeBoard, setActiveBoard] = useState<BoardData | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isTeamSettingsOpen, setIsTeamSettingsOpen] = useState(false);
  const [isEditBoardOpen, setIsEditBoardOpen] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [isAutomationsOpen, setIsAutomationsOpen] = useState(false);
  const [isNotificationSettingsOpen, setIsNotificationSettingsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set initial active board when boards are loaded
  React.useEffect(() => {
    if (boards.length > 0 && !activeBoard) {
      setActiveBoard(boards[0]);
    }
  }, [boards]);

  const handleAddBoard = useCallback(async (name: string) => {
    try {
      setError(null);
      const newBoard = {
        name,
        description: '',
        columns: [
          {
            id: '1',
            title: 'To Do',
            tasks: [],
          },
          {
            id: '2',
            title: 'In Progress',
            tasks: [],
          },
          {
            id: '3',
            title: 'Done',
            tasks: [],
          },
        ],
        members: [],
        labels: [],
        automations: [],
        businessId: business?.id || '',
      };

      await addBoard(newBoard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create board');
    }
  }, [addBoard, business]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
    }
  };

  const handleUpdateNotificationSettings = (newSettings: any) => {
    // Update local state or trigger a refresh if needed
    console.log('Notification settings updated:', newSettings);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (boardsError || error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-center">
          <p className="text-xl font-semibold mb-2">Error</p>
          <p>{boardsError || error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!activeBoard && boards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Welcome to Project Management</h2>
          <p className="text-gray-600 mb-6">Get started by creating your first board</p>
          <button
            onClick={() => handleAddBoard('My First Board')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white 
              rounded-md hover:bg-indigo-700"
          >
            <Plus size={20} />
            Create Board
          </button>
        </div>
      </div>
    );
  }

  if (!activeBoard) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        boards={boards}
        activeBoard={activeBoard}
        onBoardSelect={setActiveBoard}
        isOpen={isSidebarOpen}
        width={sidebarWidth}
        onResize={setSidebarWidth}
        onAddBoard={handleAddBoard}
      />

      <div 
        className="min-h-screen transition-all duration-200"
        style={{ marginLeft: isSidebarOpen ? sidebarWidth : 0 }}
      >
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  <Menu size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <Layout className="text-indigo-600" />
                  <h1 className="text-xl font-semibold text-gray-900">
                    {activeBoard.name}
                  </h1>
                  <button
                    onClick={() => setIsEditBoardOpen(true)}
                    className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-50"
                  >
                    <Pencil size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                    text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <BarChart size={16} />
                  <span>Analytics</span>
                </button>

                <button
                  onClick={() => setIsAutomationsOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                    text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <Zap size={16} />
                  <span>Automations</span>
                </button>

                <button
                  onClick={() => setIsNotificationSettingsOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                    text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <Bell size={16} />
                  <span>Notifications</span>
                </button>

                <button
                  onClick={() => setIsTeamSettingsOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                    text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                >
                  <Users size={16} />
                  <span>Team</span>
                </button>

                <button
                  onClick={() => setIsConfirmingLogout(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium
                    text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {business && (
              <div className="mt-2 text-sm text-gray-600">
                {business.name}
              </div>
            )}
          </div>
        </header>

        <main className="p-8">
          {showAnalytics ? (
            <div className="mb-8">
              <AnalyticsDashboard board={activeBoard} />
            </div>
          ) : null}
          
          <Board board={activeBoard} onUpdate={updateBoard} />
        </main>
      </div>

      {/* Logout Confirmation Dialog */}
      <AnimatePresence>
        {isConfirmingLogout && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-lg shadow-lg p-6 max-w-sm mx-4 w-full"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Sign Out
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? Any unsaved changes will be lost.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsConfirmingLogout(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 
                    hover:bg-gray-50 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 text-sm font-medium text-white 
                    bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Settings Dialog */}
      <TeamSettings
        board={activeBoard}
        onUpdate={updateBoard}
        isOpen={isTeamSettingsOpen}
        onClose={() => setIsTeamSettingsOpen(false)}
      />

      {/* Board Edit Dialog */}
      {isEditBoardOpen && (
        <EditBoardDialog
          board={activeBoard}
          onClose={() => setIsEditBoardOpen(false)}
          onSave={updateBoard}
        />
      )}

      {/* Automations Dialog */}
      <BoardAutomations
        board={activeBoard}
        onUpdate={updateBoard}
        isOpen={isAutomationsOpen}
        onClose={() => setIsAutomationsOpen(false)}
      />

      {/* Notification Settings Dialog */}
      {business && (
        <NotificationSettings
          businessId={business.id}
          settings={{
            enabled: business.notificationSettings?.enabled ?? false,
            notifyEmail: business.notificationSettings?.notifyEmail ?? business.email,
            triggers: business.notificationSettings?.triggers ?? {
              taskDueDate: true,
              statusChange: true,
              highPriorityTask: true,
              taskAssigned: true,
              checklistCompleted: true
            }
          }}
          isOpen={isNotificationSettingsOpen}
          onClose={() => setIsNotificationSettingsOpen(false)}
          onUpdate={handleUpdateNotificationSettings}
        />
      )}
    </div>
  );
}
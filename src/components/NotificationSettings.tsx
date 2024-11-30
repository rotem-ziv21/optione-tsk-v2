import React, { useState } from 'react';
import { Bell, Mail, Save, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NotificationSettings {
  enabled: boolean;
  notifyEmail: string;
  triggers: {
    taskDueDate: boolean;
    statusChange: boolean;
    highPriorityTask: boolean;
    taskAssigned: boolean;
    checklistCompleted: boolean;
  };
}

interface NotificationSettingsProps {
  businessId: string;
  settings: NotificationSettings;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (settings: NotificationSettings) => void;
}

export function NotificationSettings({
  businessId,
  settings: initialSettings,
  isOpen,
  onClose,
  onUpdate
}: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationSettings>(initialSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!settings.notifyEmail) {
      setError('Email address is required when notifications are enabled');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const businessRef = doc(db, 'businesses', businessId);
      await updateDoc(businessRef, {
        notificationSettings: settings
      });

      onUpdate(settings);
      onClose();
    } catch (err) {
      console.error('Failed to save notification settings:', err);
      setError('Failed to save settings');
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
                <Bell className="text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Notification Settings
                </h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 rounded-md text-red-600">
                  <AlertCircle size={16} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {/* Enable/Disable Notifications */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Enable Email Notifications
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({
                      ...settings,
                      enabled: e.target.checked
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                    peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full 
                    peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] 
                    after:left-[2px] after:bg-white after:border-gray-300 after:border 
                    after:rounded-full after:h-5 after:w-5 after:transition-all 
                    peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {/* Notification Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notification Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={settings.notifyEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      notifyEmail: e.target.value
                    })}
                    disabled={!settings.enabled}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md
                      focus:outline-none focus:ring-2 focus:ring-indigo-500
                      disabled:bg-gray-100 disabled:text-gray-500"
                    placeholder="Enter email address"
                  />
                </div>
              </div>

              {/* Notification Triggers */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Notify me when:
                </h3>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.triggers.taskDueDate}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggers: {
                        ...settings.triggers,
                        taskDueDate: e.target.checked
                      }
                    })}
                    disabled={!settings.enabled}
                    className="rounded border-gray-300 text-indigo-600 
                      focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    A task is due today
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.triggers.statusChange}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggers: {
                        ...settings.triggers,
                        statusChange: e.target.checked
                      }
                    })}
                    disabled={!settings.enabled}
                    className="rounded border-gray-300 text-indigo-600 
                      focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    A task status changes
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.triggers.highPriorityTask}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggers: {
                        ...settings.triggers,
                        highPriorityTask: e.target.checked
                      }
                    })}
                    disabled={!settings.enabled}
                    className="rounded border-gray-300 text-indigo-600 
                      focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    A high priority task is created
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.triggers.taskAssigned}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggers: {
                        ...settings.triggers,
                        taskAssigned: e.target.checked
                      }
                    })}
                    disabled={!settings.enabled}
                    className="rounded border-gray-300 text-indigo-600 
                      focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    A task is assigned to someone
                  </span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.triggers.checklistCompleted}
                    onChange={(e) => setSettings({
                      ...settings,
                      triggers: {
                        ...settings.triggers,
                        checklistCompleted: e.target.checked
                      }
                    })}
                    disabled={!settings.enabled}
                    className="rounded border-gray-300 text-indigo-600 
                      focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">
                    A task checklist is completed
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 
                  hover:bg-gray-100 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || (settings.enabled && !settings.notifyEmail)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
                  text-white bg-indigo-600 hover:bg-indigo-700 rounded-md
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
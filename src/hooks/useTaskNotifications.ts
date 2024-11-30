import { useCallback } from 'react';
import { Task } from '../types';
import { sendNotification } from '../services/notificationService';
import { useAuth } from './useAuth';

export function useTaskNotifications() {
  const { business } = useAuth();

  const notifyChange = useCallback(async (task: Task, type: string) => {
    if (!business?.notificationSettings?.enabled) return;

    const email = business.notificationSettings.notifyEmail || business.email;
    await sendNotification(task, type, email);
  }, [business]);

  return { notifyChange };
}
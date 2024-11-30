import { useState, useEffect } from 'react';
import { 
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Task } from '../types';
import { useAuth } from './useAuth';

export function useTasks(boardId: string) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { business } = useAuth();

  useEffect(() => {
    if (!business?.id || !boardId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const tasksRef = collection(db, 'tasks');
        const tasksQuery = query(
          tasksRef,
          where('businessId', '==', business.id),
          where('boardId', '==', boardId)
        );

        unsubscribe = onSnapshot(
          tasksQuery,
          {
            next: (snapshot) => {
              const tasksData = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                  id: doc.id,
                  ...data,
                  createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                  updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                  dueDate: data.dueDate?.toDate?.()?.toISOString(),
                  labels: data.labels || [],
                  comments: data.comments || [],
                  attachments: data.attachments || [],
                  checklist: data.checklist || [],
                  timeEntries: data.timeEntries || []
                } as Task;
              });

              setTasks(tasksData);
              setError(null);
              setLoading(false);
            },
            error: (err) => {
              console.error('Tasks subscription error:', err);
              setError('Failed to load tasks');
              setLoading(false);
            }
          }
        );
      } catch (err) {
        console.error('Error setting up tasks subscription:', err);
        setError('Failed to connect to database');
        setLoading(false);
      }
    };

    setupSubscription();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [business?.id, boardId]);

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    if (!business?.id || !boardId) {
      throw new Error('Invalid business or board');
    }

    try {
      const tasksRef = collection(db, 'tasks');
      const columnTasks = tasks.filter(t => t.columnId === taskData.columnId);
      const maxPosition = columnTasks.reduce((max, t) => Math.max(max, t.position || 0), -1);

      // Convert dates to Firestore Timestamps
      const data = {
        ...taskData,
        businessId: business.id,
        boardId,
        position: maxPosition + 1,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        dueDate: taskData.dueDate ? Timestamp.fromDate(new Date(taskData.dueDate)) : null
      };

      const docRef = await addDoc(tasksRef, data);
      return docRef.id;
    } catch (err) {
      console.error('Error adding task:', err);
      throw new Error('Failed to create task');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!business?.id || !boardId) {
      throw new Error('Invalid business or board');
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      
      // Convert dates to Firestore Timestamps
      const data = {
        ...updates,
        updatedAt: serverTimestamp(),
        dueDate: updates.dueDate ? Timestamp.fromDate(new Date(updates.dueDate)) : null
      };

      await updateDoc(taskRef, data);
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!business?.id || !boardId) {
      throw new Error('Invalid business or board');
    }

    try {
      const taskRef = doc(db, 'tasks', taskId);
      await deleteDoc(taskRef);
    } catch (err) {
      console.error('Error deleting task:', err);
      throw new Error('Failed to delete task');
    }
  };

  const reorderTasks = async (columnId: string, taskIds: string[]) => {
    if (!business?.id || !boardId) {
      throw new Error('Invalid business or board');
    }

    try {
      const batch = writeBatch(db);
      
      taskIds.forEach((taskId, index) => {
        const taskRef = doc(db, 'tasks', taskId);
        batch.update(taskRef, { 
          position: index,
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
    } catch (err) {
      console.error('Error reordering tasks:', err);
      throw new Error('Failed to reorder tasks');
    }
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks
  };
}
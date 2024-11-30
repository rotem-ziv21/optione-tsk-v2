import { useState, useEffect } from 'react';
import { 
  query,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
  writeBatch,
  where,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BoardData, Task } from '../types';
import { useAuth } from './useAuth';

// Helper to clean data for Firestore
const prepareForFirestore = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const cleaned: any = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip undefined/null values
    if (value == null) continue;

    // Convert dates to Firestore Timestamps
    if (value instanceof Date) {
      cleaned[key] = Timestamp.fromDate(value);
      continue;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      cleaned[key] = value.map(item => prepareForFirestore(item));
      continue;
    }

    // Handle nested objects
    if (typeof value === 'object') {
      cleaned[key] = prepareForFirestore(value);
      continue;
    }

    cleaned[key] = value;
  }

  return cleaned;
};

export function useBoards() {
  const [boards, setBoards] = useState<BoardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { business } = useAuth();

  useEffect(() => {
    if (!business?.id) {
      setBoards([]);
      setLoading(false);
      return;
    }

    try {
      const boardsRef = collection(db, 'boards');
      const boardsQuery = query(boardsRef, where('businessId', '==', business.id));
      
      const unsubscribe = onSnapshot(boardsQuery, async (snapshot) => {
        try {
          const boardsData = await Promise.all(
            snapshot.docs.map(async (doc) => {
              const boardData = doc.data();
              
              // Get tasks for this board
              const tasksRef = collection(db, 'tasks');
              const tasksQuery = query(
                tasksRef, 
                where('boardId', '==', doc.id),
                where('businessId', '==', business.id)
              );
              const tasksSnapshot = await getDocs(tasksQuery);
              
              const tasks = tasksSnapshot.docs.map(taskDoc => ({
                id: taskDoc.id,
                ...taskDoc.data(),
                createdAt: taskDoc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: taskDoc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                dueDate: taskDoc.data().dueDate?.toDate?.()?.toISOString()
              })) as Task[];

              // Distribute tasks to their respective columns
              const columns = (boardData.columns || []).map(column => ({
                ...column,
                tasks: tasks.filter(task => task.columnId === column.id)
                  .sort((a, b) => (a.position || 0) - (b.position || 0))
              }));

              return {
                id: doc.id,
                ...boardData,
                columns,
                createdAt: boardData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                updatedAt: boardData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
              } as BoardData;
            })
          );

          setBoards(boardsData);
          setError(null);
        } catch (err) {
          console.error('Error processing boards data:', err);
          setError('Error loading boards');
        } finally {
          setLoading(false);
        }
      });

      return () => unsubscribe();
    } catch (err) {
      console.error('Error setting up boards listener:', err);
      setError('Failed to connect to database');
      setLoading(false);
    }
  }, [business?.id]);

  const addBoard = async (boardData: Omit<BoardData, 'id'>) => {
    if (!business?.id) {
      throw new Error('No business selected');
    }

    try {
      const boardsRef = collection(db, 'boards');
      const docRef = doc(boardsRef);
      
      const data = prepareForFirestore({
        ...boardData,
        businessId: business.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        columns: boardData.columns || [],
        members: boardData.members || [],
        labels: boardData.labels || []
      });

      await setDoc(docRef, data);
      return docRef.id;
    } catch (err) {
      console.error('Error adding board:', err);
      throw new Error('Failed to create board');
    }
  };

  const updateBoard = async (boardId: string, updates: Partial<BoardData>) => {
    if (!business?.id) {
      throw new Error('No business selected');
    }

    try {
      const boardRef = doc(db, 'boards', boardId);
      
      const data = prepareForFirestore({
        ...updates,
        updatedAt: serverTimestamp()
      });

      await updateDoc(boardRef, data);
    } catch (err) {
      console.error('Error updating board:', err);
      throw new Error('Failed to update board');
    }
  };

  const deleteBoard = async (boardId: string) => {
    if (!business?.id) {
      throw new Error('No business selected');
    }

    try {
      const batch = writeBatch(db);
      
      // Delete the board
      const boardRef = doc(db, 'boards', boardId);
      batch.delete(boardRef);

      // Delete all tasks associated with this board
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(
        tasksRef,
        where('boardId', '==', boardId),
        where('businessId', '==', business.id)
      );
      const tasksSnapshot = await getDocs(tasksQuery);
      tasksSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      await batch.commit();
    } catch (err) {
      console.error('Error deleting board:', err);
      throw new Error('Failed to delete board');
    }
  };

  return {
    boards,
    loading,
    error,
    addBoard,
    updateBoard,
    deleteBoard
  };
}
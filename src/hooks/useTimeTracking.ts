import { useState, useEffect, useCallback } from 'react';
import { Task, TimeEntry } from '../types';
import { useAuth } from './useAuth';
import { v4 as uuidv4 } from 'uuid';

export function useTimeTracking(task: Task, onTimeEntryAdd: (entry: Omit<TimeEntry, 'id'>) => Promise<void>) {
  const { user } = useAuth();
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState('');

  // Load active time entry from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(`timeTracking_${task.id}`);
    if (storedData) {
      const { startTime: storedStartTime, description: storedDescription } = JSON.parse(storedData);
      if (storedStartTime) {
        setStartTime(new Date(storedStartTime));
        setDescription(storedDescription || '');
        setIsTracking(true);
      }
    }

    // Load saved time entries
    const savedEntries = localStorage.getItem(`timeEntries_${task.id}`);
    if (savedEntries) {
      const entries = JSON.parse(savedEntries);
      entries.forEach(async (entry: TimeEntry) => {
        try {
          await onTimeEntryAdd(entry);
        } catch (err) {
          console.error('Failed to load time entry:', err);
        }
      });
    }
  }, [task.id, onTimeEntryAdd]);

  // Update elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isTracking && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isTracking, startTime]);

  // Save tracking state to localStorage
  useEffect(() => {
    if (isTracking && startTime) {
      localStorage.setItem(`timeTracking_${task.id}`, JSON.stringify({
        startTime: startTime.toISOString(),
        description
      }));
    } else {
      localStorage.removeItem(`timeTracking_${task.id}`);
    }
  }, [isTracking, startTime, description, task.id]);

  const handleStartStop = async () => {
    if (!user) {
      return;
    }

    try {
      if (!isTracking) {
        // Start tracking
        const now = new Date();
        setStartTime(now);
        setIsTracking(true);
      } else {
        // Stop tracking and save entry
        if (startTime) {
          const endTime = new Date();
          const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

          if (duration < 60) {
            return;
          }

          const timeEntry: Omit<TimeEntry, 'id'> = {
            taskId: task.id,
            userId: user.uid,
            description: description || 'Work on task',
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString(),
            duration,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await onTimeEntryAdd(timeEntry);

          // Save to local storage for persistence
          const savedEntries = localStorage.getItem(`timeEntries_${task.id}`);
          const entries = savedEntries ? JSON.parse(savedEntries) : [];
          entries.push({ ...timeEntry, id: uuidv4() });
          localStorage.setItem(`timeEntries_${task.id}`, JSON.stringify(entries));

          // Reset state
          setStartTime(null);
          setElapsedTime(0);
          setDescription('');
          setIsTracking(false);
        }
      }
    } catch (err) {
      console.error('Time tracking error:', err);
    }
  };

  const formatTime = useCallback((seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return {
    isTracking,
    elapsedTime,
    description,
    setDescription,
    handleStartStop,
    formatTime
  };
}
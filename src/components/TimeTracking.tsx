import React from 'react';
import { Play, Pause, Clock, AlertCircle } from 'lucide-react';
import { Task, TimeEntry } from '../types';
import { useTimeTracking } from '../hooks/useTimeTracking';

interface TimeTrackingProps {
  task: Task;
  onTimeEntryAdd: (entry: Omit<TimeEntry, 'id'>) => Promise<void>;
}

export function TimeTracking({ task, onTimeEntryAdd }: TimeTrackingProps) {
  const {
    isTracking,
    elapsedTime,
    description,
    error,
    setDescription,
    handleStartStop,
    formatTime
  } = useTimeTracking(task, onTimeEntryAdd);

  return (
    <div className="space-y-3">
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-600 text-sm">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Clock className="text-gray-400" size={20} />
          <span className="font-mono text-xl font-medium">
            {formatTime(elapsedTime)}
          </span>
        </div>

        <button
          onClick={handleStartStop}
          className={`p-2 rounded-full transition-colors ${
            isTracking 
              ? 'bg-red-100 text-red-600 hover:bg-red-200' 
              : 'bg-green-100 text-green-600 hover:bg-green-200'
          }`}
        >
          {isTracking ? <Pause size={20} /> : <Play size={20} />}
        </button>
      </div>

      {isTracking && (
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What are you working on?"
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      )}

      {task.timeEntries && task.timeEntries.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Time Log</h4>
          <div className="space-y-2 max-h-[200px] overflow-y-auto">
            {task.timeEntries.map((entry) => (
              <div 
                key={entry.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {entry.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(entry.startTime).toLocaleString()}
                  </p>
                </div>
                <span className="font-mono text-gray-600">
                  {formatTime(entry.duration)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
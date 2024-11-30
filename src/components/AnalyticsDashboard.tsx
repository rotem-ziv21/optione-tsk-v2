import React, { useMemo } from 'react';
import { BoardData, Task } from '../types';
import { 
  BarChart3, 
  PieChart, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp
} from 'lucide-react';

interface AnalyticsDashboardProps {
  board: BoardData;
}

export function AnalyticsDashboard({ board }: AnalyticsDashboardProps) {
  const metrics = useMemo(() => {
    const allTasks = board.columns.flatMap(col => col.tasks);
    const totalTasks = allTasks.length;
    
    // Task completion stats
    const completedTasks = board.columns
      .find(col => col.title.toLowerCase().includes('done'))
      ?.tasks.length || 0;
    
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;

    // Priority distribution
    const priorities = allTasks.reduce((acc, task) => ({
      ...acc,
      [task.priority]: (acc[task.priority] || 0) + 1
    }), {} as Record<Task['priority'], number>);

    // Due date analysis
    const today = new Date();
    const overdueTasks = allTasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < today
    ).length;

    // Task distribution by column
    const tasksByColumn = board.columns.map(col => ({
      name: col.title,
      count: col.tasks.length
    }));

    // Checklist completion
    const checklistStats = allTasks.reduce((acc, task) => {
      const completed = task.checklist?.filter(item => item.isCompleted).length || 0;
      const total = task.checklist?.length || 0;
      return {
        completed: acc.completed + completed,
        total: acc.total + total
      };
    }, { completed: 0, total: 0 });

    return {
      totalTasks,
      completedTasks,
      completionRate,
      priorities,
      overdueTasks,
      tasksByColumn,
      checklistStats
    };
  }, [board]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Overall Progress</h3>
          <TrendingUp className="text-indigo-600" size={20} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-indigo-600">
              {metrics.completionRate}%
            </p>
            <p className="text-sm text-gray-600">
              {metrics.completedTasks} of {metrics.totalTasks} tasks completed
            </p>
          </div>
          <div className="w-16 h-16 relative">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#4F46E5"
                strokeWidth="3"
                strokeDasharray={`${metrics.completionRate}, 100`}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Priorities</h3>
          <PieChart className="text-indigo-600" size={20} />
        </div>
        <div className="space-y-3">
          {Object.entries(metrics.priorities).map(([priority, count]) => (
            <div key={priority} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${
                  priority === 'high' ? 'bg-red-500' :
                  priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <span className="capitalize text-sm text-gray-700">{priority}</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Column Distribution */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Tasks by Status</h3>
          <BarChart3 className="text-indigo-600" size={20} />
        </div>
        <div className="space-y-3">
          {metrics.tasksByColumn.map((col, index) => (
            <div key={col.name} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">{col.name}</span>
                <span className="font-medium text-gray-900">{col.count}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${(col.count / metrics.totalTasks) * 100}%`,
                    opacity: 0.6 + (0.4 * (index / metrics.tasksByColumn.length))
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Metrics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Time Metrics</h3>
          <Clock className="text-indigo-600" size={20} />
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Overdue Tasks</span>
              <span className="font-medium text-red-600">{metrics.overdueTasks}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2">
              <div
                className="bg-red-500 h-2 rounded-full"
                style={{
                  width: `${(metrics.overdueTasks / metrics.totalTasks) * 100}%`
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Checklist Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Checklist Items</h3>
          <CheckCircle2 className="text-indigo-600" size={20} />
        </div>
        <div>
          <p className="text-3xl font-bold text-indigo-600">
            {metrics.checklistStats.total > 0
              ? Math.round((metrics.checklistStats.completed / metrics.checklistStats.total) * 100)
              : 0}%
          </p>
          <p className="text-sm text-gray-600">
            {metrics.checklistStats.completed} of {metrics.checklistStats.total} items completed
          </p>
        </div>
      </div>

      {/* Task Health */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Task Health</h3>
          <AlertCircle className="text-indigo-600" size={20} />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">High Priority Tasks</span>
            <span className="font-medium text-gray-900">
              {metrics.priorities.high || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Overdue Tasks</span>
            <span className="font-medium text-gray-900">{metrics.overdueTasks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tasks Without Due Date</span>
            <span className="font-medium text-gray-900">
              {metrics.totalTasks - board.columns.flatMap(col => 
                col.tasks.filter(task => task.dueDate)
              ).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { Column as ColumnComponent } from './Column';
import { BoardData, Column, Task } from '../types';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { TaskCard } from './TaskCard';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { AddColumnDialog } from './AddColumnDialog';
import { EditColumnDialog } from './EditColumnDialog';
import { EditTaskDialog } from './EditTaskDialog';
import { TaskFilters, type TaskFilters as TaskFiltersType } from './TaskFilters';
import { useTasks } from '../hooks/useTasks';
import { useTaskNotifications } from '../hooks/useTaskNotifications';
import { v4 as uuidv4 } from 'uuid';

interface BoardProps {
  board: BoardData;
  onUpdate: (boardId: string, updates: Partial<BoardData>) => Promise<void>;
}

export function Board({ board, onUpdate }: BoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [editingColumn, setEditingColumn] = useState<Column | null>(null);
  const [editingTask, setEditingTask] = useState<{task: Task; columnId: string} | null>(null);
  const [taskFilters, setTaskFilters] = useState<TaskFiltersType>({});
  const [error, setError] = useState<string | null>(null);

  const {
    tasks,
    loading: tasksLoading,
    error: tasksError,
    addTask,
    updateTask,
    reorderTasks,
    deleteTask
  } = useTasks(board.id);

  const { notifyChange } = useTaskNotifications();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (!active) return;

    const task = tasks.find((task) => task.id === active.id);
    if (task) {
      setActiveTask(task);
      setActiveColumnId(task.columnId);
    }
  };

  const handleDragOver = async (event: DragOverEvent) => {
    const { active, over } = event;
    if (!active || !over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeTask = tasks.find(task => task.id === activeId);
    const overTask = tasks.find(task => task.id === overId);
    const overColumn = board.columns.find(col => col.id === overId);

    if (!activeTask) return;

    try {
      if (overColumn) {
        // Dropping on a column
        await updateTask(activeTask.id, { columnId: overColumn.id });
      } else if (overTask && activeTask.columnId !== overTask.columnId) {
        // Dropping on a task in a different column
        await updateTask(activeTask.id, { columnId: overTask.columnId });
      }
    } catch (err) {
      console.error('Failed to move task:', err);
      setError('Failed to move task');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    setActiveColumnId(null);

    if (!active || !over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    const activeTask = tasks.find(task => task.id === activeId);
    const overTask = tasks.find(task => task.id === overId);

    if (!activeTask || !overTask) return;

    try {
      if (activeTask.columnId === overTask.columnId) {
        // Reordering within the same column
        const columnTasks = tasks
          .filter(task => task.columnId === activeTask.columnId)
          .sort((a, b) => (a.position || 0) - (b.position || 0));

        const oldIndex = columnTasks.findIndex(task => task.id === activeId);
        const newIndex = columnTasks.findIndex(task => task.id === overId);

        const reorderedTasks = arrayMove(columnTasks, oldIndex, newIndex);
        await reorderTasks(activeTask.columnId, reorderedTasks.map(task => task.id));
      }
    } catch (err) {
      console.error('Failed to reorder tasks:', err);
      setError('Failed to reorder tasks');
    }
  };

  const handleAddTask = async (columnId: string) => {
    try {
      const newTask: Omit<Task, 'id'> = {
        title: 'New Task',
        description: 'Click to edit this task',
        priority: 'medium',
        status: 'todo',
        columnId,
        boardId: board.id,
        businessId: board.businessId,
        position: 0,
        labels: [],
        comments: [],
        attachments: [],
        checklist: [],
        timeEntries: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const taskId = await addTask(newTask);
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        setEditingTask({ task, columnId });
      }
      setError(null);
    } catch (err) {
      console.error('Failed to add task:', err);
      setError('Failed to add task');
    }
  };

  const handleEditTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      await updateTask(taskId, updates);
      
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Send notification only for status changes and checklist completion
      if (updates.status) {
        notifyChange(task, 'status_change');
      }

      if (updates.checklist && task.checklist?.every(item => item.isCompleted)) {
        notifyChange(task, 'checklist_completed');  
      }

      setEditingTask(null);
      setError(null);
    } catch (err) {
      console.error('Failed to update task:', err);
      setError('Failed to update task');
      throw err;
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      await updateTask(taskId, { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update task status:', err);
      setError('Failed to update task status');
    }
  };

  const handleMoveTask = async (taskId: string, newColumnId: string) => {
    try {
      await updateTask(taskId, { columnId: newColumnId });
      setError(null);
    } catch (err) {
      console.error('Failed to move task:', err);
      setError('Failed to move task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setEditingTask(null);
      setError(null);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setError('Failed to delete task');
      throw err;
    }
  };

  const handleAddColumn = async (title: string) => {
    try {
      const newColumn: Column = {
        id: uuidv4(),
        title,
        tasks: [],
      };

      await onUpdate(board.id, { 
        columns: [...board.columns, newColumn],
      });
      
      setIsAddColumnOpen(false);
      setError(null);
    } catch (err) {
      console.error('Failed to add column:', err);
      setError('Failed to add column');
    }
  };

  const handleEditColumn = async (columnId: string, newTitle: string) => {
    try {
      const updatedColumns = board.columns.map(col => 
        col.id === columnId 
          ? { ...col, title: newTitle }
          : col
      );

      await onUpdate(board.id, { columns: updatedColumns });
      setEditingColumn(null);
      setError(null);
    } catch (err) {
      console.error('Failed to update column:', err);
      setError('Failed to update column');
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      // Delete all tasks in the column first
      const columnTasks = tasks.filter(task => task.columnId === columnId);
      await Promise.all(columnTasks.map(task => deleteTask(task.id)));

      // Then delete the column
      await onUpdate(board.id, {
        columns: board.columns.filter(col => col.id !== columnId),
      });
      
      setEditingColumn(null);
      setError(null);
    } catch (err) {
      console.error('Failed to delete column:', err);
      setError('Failed to delete column');
    }
  };

  // Filter tasks based on current filters
  const filterTasks = (tasks: Task[]) => {
    return tasks.filter(task => {
      // Search filter
      if (taskFilters.search) {
        const search = taskFilters.search.toLowerCase();
        const searchMatch = 
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search) ||
          task.labels?.some(label => label.toLowerCase().includes(search));
        if (!searchMatch) return false;
      }

      // Priority filter
      if (taskFilters.priority && task.priority !== taskFilters.priority) {
        return false;
      }

      // Assignee filter
      if (taskFilters.assignee) {
        if (taskFilters.assignee === 'unassigned' && task.assignee) {
          return false;
        }
        if (taskFilters.assignee !== 'unassigned' && task.assignee !== taskFilters.assignee) {
          return false;
        }
      }

      // Due date filter
      if (taskFilters.dueDate && task.dueDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);

        switch (taskFilters.dueDate) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.getTime() === today.getTime();
          case 'week': {
            const weekEnd = new Date(today);
            weekEnd.setDate(today.getDate() + 7);
            return dueDate >= today && dueDate <= weekEnd;
          }
          case 'none':
            return false;
        }
      } else if (taskFilters.dueDate === 'none') {
        return !task.dueDate;
      }

      return true;
    });
  };

  // Distribute filtered tasks to columns
  const columns = board.columns.map(column => ({
    ...column,
    tasks: filterTasks(tasks.filter(task => task.columnId === column.id))
      .sort((a, b) => (a.position || 0) - (b.position || 0))
  }));

  if (tasksLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (tasksError || error) {
    return (
      <div className="text-red-600 mb-4 p-4 bg-red-50 rounded-lg">
        {tasksError || error}
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <TaskFilters 
          members={board.members} 
          onFilterChange={setTaskFilters}
        />
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex items-start gap-6 overflow-x-auto overflow-y-auto min-h-[calc(100vh-12rem)] max-h-[calc(100vh-12rem)] board-scroll">
          {columns.map((column) => (
            <ColumnComponent
              key={column.id}
              column={column}
              columns={board.columns}
              onAddTask={handleAddTask}
              onMoveTask={handleMoveTask}
              isActive={column.id === activeColumnId}
              onEdit={() => setEditingColumn(column)}
              onTaskClick={(task) => setEditingTask({ task, columnId: column.id })}
              members={board.members || []}
              onUpdateStatus={handleStatusUpdate}
            />
          ))}
          
          <button
            onClick={() => setIsAddColumnOpen(true)}
            className="flex-shrink-0 w-80 h-16 flex items-center justify-center gap-2 
              bg-white/60 hover:bg-white/80 rounded-lg border-2 border-dashed border-gray-300
              text-gray-600 hover:text-gray-900 transition-colors"
          >
            <Plus size={20} />
            <span>Add Column</span>
          </button>
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} columns={board.columns} /> : null}
        </DragOverlay>
      </DndContext>

      <AddColumnDialog
        isOpen={isAddColumnOpen}
        onClose={() => setIsAddColumnOpen(false)}
        onAdd={handleAddColumn}
      />

      {editingColumn && (
        <EditColumnDialog
          column={editingColumn}
          onClose={() => setEditingColumn(null)}
          onSave={handleEditColumn}
          onDelete={handleDeleteColumn}
        />
      )}

      {editingTask && (
        <EditTaskDialog
          task={editingTask.task}
          members={board.members || []}
          onClose={() => setEditingTask(null)}
          onSave={handleEditTask}
          onDelete={handleDeleteTask}
        />
      )}
    </>
  );
}
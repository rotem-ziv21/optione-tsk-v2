import { useState } from 'react';
import { Automation, Task, BoardData } from '../types';

export function useAutomations(board: BoardData) {
  const [error, setError] = useState<string | null>(null);

  const checkConditions = (task: Task, conditions: Automation['trigger']['conditions']) => {
    if (!conditions?.length) return true;

    return conditions.every(condition => {
      const taskValue = task[condition.field as keyof Task];
      
      switch (condition.operator) {
        case 'equals':
          return taskValue === condition.value;
        case 'notEquals':
          return taskValue !== condition.value;
        case 'contains':
          if (Array.isArray(taskValue)) {
            return taskValue.includes(condition.value);
          }
          return String(taskValue).includes(String(condition.value));
        case 'lessThan':
          return taskValue < condition.value;
        case 'greaterThan':
          return taskValue > condition.value;
        default:
          return false;
      }
    });
  };

  const executeActions = async (task: Task, actions: Automation['actions']) => {
    const updates: Partial<Task> = {};

    for (const action of actions) {
      switch (action.type) {
        case 'moveTask':
          const targetColumn = board.columns.find(col => col.id === action.value);
          if (targetColumn) {
            updates.columnId = targetColumn.id;
          }
          break;

        case 'setStatus':
          if (['todo', 'in_progress', 'completed', 'blocked'].includes(action.value)) {
            updates.status = action.value;
          }
          break;

        case 'setPriority':
          if (['low', 'medium', 'high'].includes(action.value)) {
            updates.priority = action.value;
          }
          break;

        case 'assignTo':
          const member = board.members?.find(m => m.id === action.value);
          if (member) {
            updates.assignee = member.id;
          }
          break;

        case 'addLabel':
          if (!task.labels?.includes(action.value)) {
            updates.labels = [...(task.labels || []), action.value];
          }
          break;

        case 'removeLabel':
          if (task.labels?.includes(action.value)) {
            updates.labels = task.labels.filter(label => label !== action.value);
          }
          break;
      }
    }

    return Object.keys(updates).length > 0 ? updates : null;
  };

  const validateAutomation = (automation: Omit<Automation, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Validate name
    if (!automation.name?.trim()) {
      setError('Automation name is required');
      return false;
    }

    // Validate trigger
    if (!automation.trigger?.type) {
      setError('Trigger type is required');
      return false;
    }

    // Validate actions
    if (!automation.actions?.length) {
      setError('At least one action is required');
      return false;
    }

    // Validate each action
    for (const action of automation.actions) {
      switch (action.type) {
        case 'moveTask':
          if (!board.columns.find(col => col.id === action.value)) {
            setError('Invalid column selected for move action');
            return false;
          }
          break;

        case 'setStatus':
          if (!['todo', 'in_progress', 'completed', 'blocked'].includes(action.value)) {
            setError('Invalid status selected');
            return false;
          }
          break;

        case 'setPriority':
          if (!['low', 'medium', 'high'].includes(action.value)) {
            setError('Invalid priority selected');
            return false;
          }
          break;

        case 'assignTo':
          if (!board.members?.find(m => m.id === action.value)) {
            setError('Invalid assignee selected');
            return false;
          }
          break;

        case 'addLabel':
        case 'removeLabel':
          if (typeof action.value !== 'string' || !action.value.trim()) {
            setError('Invalid label value');
            return false;
          }
          break;

        default:
          setError('Invalid action type');
          return false;
      }
    }

    return true;
  };

  const executeAutomations = async (task: Task, trigger: Automation['trigger']['type']) => {
    if (!board?.automations?.length) return;

    try {
      setError(null);
      const applicableAutomations = board.automations.filter(automation => {
        // Check if automation is enabled and matches trigger type
        if (!automation.enabled || automation.trigger.type !== trigger) {
          return false;
        }

        // For statusChanged trigger, check if status matches the filter
        if (trigger === 'statusChanged' && automation.trigger.statusFilter) {
          if (task.status !== automation.trigger.statusFilter) {
            return false;
          }
        }

        // Check other conditions
        return checkConditions(task, automation.trigger.conditions);
      });

      for (const automation of applicableAutomations) {
        try {
          console.log(`Executing automation: ${automation.name}`);
          const updates = await executeActions(task, automation.actions);
          if (updates) {
            console.log(`Automation completed:`, {
              automation: automation.name,
              updates
            });
            return updates;
          }
        } catch (err) {
          console.error(`Failed to execute automation ${automation.id}:`, err);
          setError(`Failed to execute automation: ${err instanceof Error ? err.message : 'Unknown error'}`);
        }
      }
    } catch (err) {
      console.error('Failed to execute automations:', err);
      setError('Failed to execute automations');
      throw err;
    }
  };

  return {
    error,
    validateAutomation,
    executeAutomations
  };
}
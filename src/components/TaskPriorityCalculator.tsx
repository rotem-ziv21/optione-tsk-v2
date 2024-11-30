import React from 'react';
import { Slider } from './ui/Slider';
import { TaskPriority } from '../types';

interface TaskPriorityCalculatorProps {
  priority: TaskPriority;
  onChange: (priority: TaskPriority) => void;
}

export function TaskPriorityCalculator({ priority, onChange }: TaskPriorityCalculatorProps) {
  const calculateScore = (factors: TaskPriority['factors']) => {
    const weights = {
      urgency: 0.4,
      impact: 0.3,
      effort: 0.2,
      dependencies: 0.1
    };

    return Object.entries(factors).reduce((score, [key, value]) => {
      return score + value * weights[key as keyof typeof weights];
    }, 0);
  };

  const handleFactorChange = (factor: keyof TaskPriority['factors'], value: number) => {
    const newFactors = {
      ...priority.factors,
      [factor]: value
    };

    onChange({
      factors: newFactors,
      score: calculateScore(newFactors)
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Urgency
        </label>
        <Slider
          value={priority.factors.urgency}
          onChange={(value) => handleFactorChange('urgency', value)}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Business Impact
        </label>
        <Slider
          value={priority.factors.impact}
          onChange={(value) => handleFactorChange('impact', value)}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Effort Level
        </label>
        <Slider
          value={priority.factors.effort}
          onChange={(value) => handleFactorChange('effort', value)}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dependencies
        </label>
        <Slider
          value={priority.factors.dependencies}
          onChange={(value) => handleFactorChange('dependencies', value)}
          min={1}
          max={10}
          step={1}
        />
      </div>

      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Priority Score</span>
          <span className="text-lg font-bold text-indigo-600">
            {Math.round(priority.score * 10) / 10}
          </span>
        </div>
      </div>
    </div>
  );
}
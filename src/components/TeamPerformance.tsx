import React from 'react';
import { TeamMember } from '../types';
import { 
  BarChart, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Award
} from 'lucide-react';

interface TeamPerformanceProps {
  members: TeamMember[];
}

export function TeamPerformance({ members }: TeamPerformanceProps) {
  const getPerformanceColor = (value: number) => {
    if (value >= 90) return 'text-green-600';
    if (value >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <CheckCircle2 size={20} />
            <h3 className="font-medium">Total Tasks Completed</h3>
          </div>
          <p className="text-2xl font-bold">
            {members.reduce((sum, member) => sum + member.performance.tasksCompleted, 0)}
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <Clock size={20} />
            <h3 className="font-medium">Avg. Completion Time</h3>
          </div>
          <p className="text-2xl font-bold">
            {Math.round(
              members.reduce((sum, member) => sum + member.performance.avgCompletionTime, 0) / 
              members.length
            )}h
          </p>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-indigo-600 mb-2">
            <TrendingUp size={20} />
            <h3 className="font-medium">On-Time Delivery</h3>
          </div>
          <p className="text-2xl font-bold">
            {Math.round(
              members.reduce((sum, member) => sum + member.performance.onTimeDelivery, 0) / 
              members.length
            )}%
          </p>
        </div>
      </div>

      {/* Individual Performance */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-medium text-gray-900">Team Member Performance</h3>
        </div>

        <div className="divide-y">
          {members.map((member) => (
            <div key={member.id} className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    {member.avatar ? (
                      <img 
                        src={member.avatar} 
                        alt={member.name}
                        className="w-full h-full rounded-full"
                      />
                    ) : (
                      <span className="text-indigo-600 font-medium">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{member.name}</h4>
                    <p className="text-sm text-gray-500">
                      {member.skills.join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500">Capacity</p>
                    <p className="font-medium">{member.capacity}h/week</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500">Current Load</p>
                    <p className="font-medium">{member.currentLoad}h</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Tasks Completed</p>
                  <p className="font-medium">
                    {member.performance.tasksCompleted}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">Avg. Completion Time</p>
                  <p className="font-medium">
                    {member.performance.avgCompletionTime}h
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500 mb-1">On-Time Delivery</p>
                  <p className={`font-medium ${
                    getPerformanceColor(member.performance.onTimeDelivery)
                  }`}>
                    {member.performance.onTimeDelivery}%
                  </p>
                </div>
              </div>

              {/* Workload Progress */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-500">Current Workload</span>
                  <span className="font-medium">
                    {Math.round((member.currentLoad / member.capacity) * 100)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-600 rounded-full transition-all"
                    style={{ 
                      width: `${(member.currentLoad / member.capacity) * 100}%`,
                      backgroundColor: member.currentLoad > member.capacity ? '#EF4444' : undefined
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
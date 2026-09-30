'use client';

import React, { useState } from 'react';
import { TaskItem, TaskStatus, TaskPriority } from '../../types';
import { api } from '../../lib/api';
import {
  CheckSquare,
  Plus,
  Filter,
  Bot,
  User,
  Calendar,
  ChevronDown,
  Trash2,
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';

interface TasksPanelProps {
  eventId: string;
  tasks: TaskItem[];
  onTasksChanged: () => void;
}

export const TasksPanel: React.FC<TasksPanelProps> = ({
  eventId,
  tasks,
  onTasksChanged,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [creating, setCreating] = useState(false);

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.updateTask(taskId, { status: newStatus });
      onTasksChanged();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.deleteTask(taskId);
      onTasksChanged();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || creating) return;

    setCreating(true);
    try {
      await api.createTask(eventId, {
        title: title.trim(),
        category,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
        status: 'TODO',
      });
      setTitle('');
      setDueDate('');
      setShowAddModal(false);
      onTasksChanged();
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setCreating(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'ALL') return true;
    return t.status === filterStatus;
  });

  return (
    <div className="bg-white rounded-2xl border border-[#E8E0D0] shadow-xs overflow-hidden flex flex-col">
      {/* Header & Controls */}
      <div className="px-5 py-4 border-b border-[#E8E0D0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#FAF7F2]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-md bg-[#1F3A32] flex items-center justify-center text-white">
            <CheckSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-headline font-bold text-[#1F3A32]">
              Event Tasks ({tasks.length})
            </h3>
            <span className="text-[11px] text-[#5A5A5A]">
              Coordinated milestones and operations
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Status Filter */}
          <div className="flex rounded-md border border-[#E8E0D0] bg-white p-0.5 text-xs">
            {['ALL', 'TODO', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  filterStatus === s
                    ? 'bg-[#1F3A32] text-white'
                    : 'text-[#5A5A5A] hover:text-[#1F3A32]'
                }`}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-2.5 py-1 text-xs font-semibold bg-[#1F3A32] hover:bg-[#172C26] text-white rounded-md shadow-xs transition-colors flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-[#E8E0D0] max-h-[460px] overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#8A8A8A]">
            No tasks found matching current filter.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task._id}
              className="p-3.5 hover:bg-[#FAF7F2]/60 transition-colors flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start space-x-3 flex-1 min-w-0">
                {/* Status Toggle Dropdown */}
                <select
                  value={task.status}
                  onChange={(e) =>
                    handleStatusChange(task._id, e.target.value as TaskStatus)
                  }
                  className={`text-[11px] font-semibold rounded px-2 py-1 border transition-colors cursor-pointer focus:outline-none ${
                    task.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : task.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : task.status === 'BLOCKED'
                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                      : 'bg-stone-50 text-stone-700 border-stone-200'
                  }`}
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BLOCKED">Blocked</option>
                </select>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-medium text-[#202020] block truncate ${
                        task.status === 'COMPLETED' ? 'line-through text-[#8A8A8A]' : ''
                      }`}
                    >
                      {task.title}
                    </span>
                    {task.source === 'AI' && (
                      <span
                        title="Created automatically by AI Assistant"
                        className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#FAF7F2] text-[#6B5328] border border-[#C8A96B]/40"
                      >
                        <Bot className="w-2.5 h-2.5 mr-0.5 text-[#C8A96B]" /> AI
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-[#5A5A5A]">
                    {task.category && (
                      <span className="text-[#8A8A8A] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#E8E0D0]/60">
                        {task.category}
                      </span>
                    )}
                    {task.relatedActivity && (
                      <span className="text-[#1F3A32] bg-[#E4EAE1] px-1.5 py-0.5 rounded">
                        {task.relatedActivity}
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="flex items-center space-x-1 text-[#6B5328]">
                        <Calendar className="w-3 h-3" />
                        <span>
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <PriorityBadge priority={task.priority} />
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  title="Delete task"
                  className="opacity-0 group-hover:opacity-100 text-[#8A8A8A] hover:text-rose-700 p-1 rounded transition-opacity"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E8E0D0]">
            <h4 className="text-base font-headline font-bold text-[#1F3A32] mb-3">
              Add New Task
            </h4>
            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Confirm wedding cake order"
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#5A5A5A] font-medium mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g. Catering, Venue"
                    className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                  />
                </div>
                <div>
                  <label className="block text-[#5A5A5A] font-medium mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#5A5A5A] font-medium mb-1">
                  Due Date (Optional)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-[#E8E0D0] rounded-lg bg-[#FAF7F2] text-[#202020] focus:outline-none focus:ring-1 focus:ring-[#1F3A32]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-[#5A5A5A] hover:text-[#202020] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !title.trim()}
                  className="px-4 py-1.5 bg-[#1F3A32] text-white font-semibold rounded-lg shadow-sm hover:bg-[#172C26] transition-colors disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

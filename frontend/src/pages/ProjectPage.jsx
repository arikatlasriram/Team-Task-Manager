import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { format, isPast } from 'date-fns';
import {
  Plus, Loader2, X, Users, UserMinus, UserPlus, Trash2,
  Calendar, Flag, ChevronLeft, AlertCircle, Check, Edit2
} from 'lucide-react';

// ─── Priority & Status helpers ───────────────────────────────────────────────
const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Todo', 'InProgress', 'Done'];
const STATUS_LABELS = { Todo: 'To Do', InProgress: 'In Progress', Done: 'Done' };
const PRIORITY_COLORS = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };
const COLUMN_COLORS = {
  Todo: 'border-slate-600/30',
  InProgress: 'border-blue-500/30',
  Done: 'border-emerald-500/30',
};
const COLUMN_HEADER_COLORS = {
  Todo: 'text-slate-400 bg-slate-700/40',
  InProgress: 'text-blue-300 bg-blue-500/10',
  Done: 'text-emerald-300 bg-emerald-500/10',
};

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, userRole, onEdit, onDelete, onStatusChange }) {
  const isOverdue = task.dueDate && task.status !== 'Done' && isPast(new Date(task.dueDate));

  return (
    <div className="glass-card p-4 group hover:border-brand-500/30 transition-all duration-200 cursor-pointer"
      onClick={() => onEdit(task)}>
      {/* Priority + overdue */}
      <div className="flex items-center justify-between mb-2.5">
        <span className={`badge ${PRIORITY_COLORS[task.priority]}`}>
          <Flag className="w-2.5 h-2.5 mr-1" />{task.priority}
        </span>
        {isOverdue && (
          <span className="flex items-center gap-1 text-xs text-red-400">
            <AlertCircle className="w-3 h-3" /> Overdue
          </span>
        )}
      </div>

      {/* Title */}
      <h4 className="text-sm font-semibold text-slate-200 group-hover:text-brand-300 transition-colors mb-1.5 line-clamp-2">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">{task.description}</p>
      )}

      {/* Due date */}
      {task.dueDate && (
        <div className={`flex items-center gap-1.5 text-xs mb-3 ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
          <Calendar className="w-3 h-3" />
          {format(new Date(task.dueDate), 'MMM d, yyyy')}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-700/40 pt-2.5">
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          {task.assignedTo ? (
            <>
              <div className="w-5 h-5 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                {task.assignedTo.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-xs text-slate-400 truncate max-w-[80px]">{task.assignedTo.name?.split(' ')[0]}</span>
            </>
          ) : (
            <span className="text-xs text-slate-600">Unassigned</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
          {userRole === 'Admin' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                className="p-1 text-slate-400 hover:text-brand-400 transition-colors"
                title="Edit task"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(task._id); }}
                className="p-1 text-red-400/60 hover:text-red-400 transition-colors"
                title="Delete task"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
          {/* Quick status advance */}
          {task.status !== 'Done' && (
            <button
              onClick={(e) => { e.stopPropagation(); onStatusChange(task._id, task.status === 'Todo' ? 'InProgress' : 'Done'); }}
              className="p-1 text-brand-400/60 hover:text-brand-400 transition-colors"
              title="Advance status"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Task Modal ────────────────────────────────────────────────────────────────
function TaskModal({ task, project, userRole, members, onClose, onSave }) {
  const isNew = !task;
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    dueDate: task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Todo',
    assignedTo: task?.assignedTo?._id || task?.assignedTo || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        dueDate: form.dueDate || null,
        assignedTo: form.assignedTo || null,
        projectId: project._id,
      };
      let res;
      if (isNew) {
        res = await api.post('/tasks', payload);
        toast.success('Task created!');
      } else {
        res = await api.put(`/tasks/${task._id}`, payload);
        toast.success('Task updated!');
      }
      onSave(res.data, isNew);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  const canEditAll = userRole === 'Admin';

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">{isNew ? 'New Task' : canEditAll ? 'Edit Task' : 'Update Status'}</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {canEditAll && (
            <>
              <div>
                <label className="input-label">Title *</label>
                <input
                  required
                  className="input-field"
                  placeholder="Task title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Add details..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Due Date</label>
                  <input
                    type="date"
                    className="input-field"
                    value={form.dueDate}
                    onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="input-label">Priority</label>
                  <select
                    className="input-field"
                    value={form.priority}
                    onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                  >
                    {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="input-label">Assign To</label>
                <select
                  className="input-field"
                  value={form.assignedTo}
                  onChange={(e) => setForm((f) => ({ ...f, assignedTo: e.target.value }))}
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user._id} value={m.user._id}>
                      {m.user.name} ({m.role})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="input-label">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: s }))}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                    form.status === s
                      ? s === 'Todo' ? 'bg-slate-600 border-slate-500 text-slate-100'
                        : s === 'InProgress' ? 'bg-blue-500/30 border-blue-500/60 text-blue-200'
                        : 'bg-emerald-500/30 border-emerald-500/60 text-emerald-200'
                      : 'bg-surface-800 border-slate-600/40 text-slate-500 hover:border-slate-500'
                  }`}
                >
                  {STATUS_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : isNew ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Member Management Modal ────────────────────────────────────────────────
function MembersModal({ project, onClose, onUpdate }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post(`/projects/${project._id}/members`, { email, role: 'Member' });
      onUpdate(res.data);
      toast.success('Member added!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (userId) => {
    try {
      const res = await api.delete(`/projects/${project._id}/members/${userId}`);
      onUpdate(res.data);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Manage Members</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 mb-5">
          <input
            type="email"
            required
            className="input-field flex-1"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Add</>}
          </button>
        </form>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {project.members.map((m) => (
            <div key={m.user._id} className="flex items-center gap-3 p-3 bg-surface-800/50 rounded-xl border border-slate-700/40">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                {m.user.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{m.user.name}</p>
                <p className="text-xs text-slate-500 truncate">{m.user.email}</p>
              </div>
              <span className={`badge badge-${m.role.toLowerCase()} shrink-0`}>{m.role}</span>
              {m.role !== 'Admin' && (
                <button
                  onClick={() => handleRemove(m.user._id)}
                  className="btn-ghost p-1.5 text-red-400/60 hover:text-red-400"
                  title="Remove member"
                >
                  <UserMinus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Project Page ─────────────────────────────────────────────────────
export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [userRole, setUserRole] = useState('Member');
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMembers, setShowMembers] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [projRes, tasksRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/tasks`),
      ]);
      setProject(projRes.data.project);
      setUserRole(projRes.data.userRole);
      setTasks(tasksRes.data);
    } catch {
      toast.error('Failed to load project');
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    Promise.resolve().then(() => fetchData());
  }, [fetchData]);

  const handleSaveTask = (savedTask, isNew) => {
    if (isNew) {
      setTasks((t) => [savedTask, ...t]);
    } else {
      setTasks((t) => t.map((task) => task._id === savedTask._id ? savedTask : task));
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((t) => t.filter((task) => task._id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus });
      setTasks((t) => t.map((task) => task._id === taskId ? res.data : task));
      toast.success(`Moved to ${STATUS_LABELS[newStatus]}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter((t) => t.status === s);
    return acc;
  }, {});

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <button onClick={() => navigate('/projects')} className="flex items-center gap-1 text-slate-500 hover:text-slate-300 text-sm mb-2 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Projects
          </button>
          <h1 className="text-2xl font-bold text-white">{project?.name}</h1>
          {project?.description && <p className="text-slate-400 text-sm mt-1">{project.description}</p>}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {userRole === 'Admin' && (
            <button
              id="manage-members-btn"
              onClick={() => setShowMembers(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Members ({project?.members?.length})
            </button>
          )}
          {userRole === 'Admin' && (
            <button
              id="new-task-btn"
              onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> New Task
            </button>
          )}
        </div>
      </div>

      {/* Kanban board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {STATUSES.map((status) => (
          <div key={status} className={`kanban-column border ${COLUMN_COLORS[status]}`}>
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-xl mb-1 ${COLUMN_HEADER_COLORS[status]}`}>
              <span className="font-semibold text-sm">{STATUS_LABELS[status]}</span>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-black/20">
                {tasksByStatus[status].length}
              </span>
            </div>

            {/* Tasks */}
            {tasksByStatus[status].length === 0 ? (
              <div className="flex-1 flex items-center justify-center py-10">
                <p className="text-xs text-slate-600 text-center">No tasks here</p>
              </div>
            ) : (
              <div className="space-y-3 flex-1">
                {tasksByStatus[status].map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    userRole={userRole}
                    onEdit={(t) => { setEditingTask(t); setShowTaskModal(true); }}
                    onDelete={handleDeleteTask}
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            )}

            {/* Add task quick button */}
            {userRole === 'Admin' && (
              <button
                onClick={() => { setEditingTask(null); setShowTaskModal(true); }}
                className="w-full py-2 text-xs text-slate-600 hover:text-slate-400 hover:bg-surface-700/50 rounded-xl transition-all flex items-center justify-center gap-1.5 mt-auto"
              >
                <Plus className="w-3.5 h-3.5" /> Add task
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Modals */}
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          project={project}
          userRole={userRole}
          members={project?.members || []}
          onClose={() => setShowTaskModal(false)}
          onSave={handleSaveTask}
        />
      )}
      {showMembers && (
        <MembersModal
          project={project}
          onClose={() => setShowMembers(false)}
          onUpdate={(updatedProject) => setProject(updatedProject)}
        />
      )}
    </div>
  );
}

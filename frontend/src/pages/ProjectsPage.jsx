import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import {
  FolderKanban, Plus, Users, Calendar, Loader2,
  Trash2, X, ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../hooks/useAuth';

function CreateProjectModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/projects', form);
      onCreate(res.data);
      toast.success('Project created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-panel">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">New Project</h2>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Project Name *</label>
            <input
              id="project-name"
              required
              className="input-field"
              placeholder="e.g. Website Redesign"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea
              id="project-desc"
              className="input-field resize-none"
              rows={3}
              placeholder="What's this project about?"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    api.get('/projects')
      .then((res) => setProjects(res.data))
      .catch(() => toast.error('Failed to load projects'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (projectId, e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((p) => p.filter((proj) => proj._id !== projectId));
      toast.success('Project deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project');
    }
  };

  const getUserRole = (project) => {
    const member = project.members?.find((m) => m.user._id === user._id || m.user === user._id);
    return member?.role || 'Member';
  };

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-400 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''} in your workspace</p>
        </div>
        <button id="new-project-btn" onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 h-48 animate-pulse">
              <div className="h-4 bg-surface-700 rounded w-2/3 mb-3" />
              <div className="h-3 bg-surface-700 rounded w-full mb-2" />
              <div className="h-3 bg-surface-700 rounded w-4/5" />
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="w-16 h-16 bg-surface-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FolderKanban className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-300 mb-2">No projects yet</h3>
          <p className="text-slate-500 text-sm mb-6">
            Create your first project to get started
          </p>
          <button onClick={() => setShowCreate(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => {
            const role = getUserRole(project);
            return (
              <Link
                key={project._id}
                to={`/projects/${project._id}`}
                className="glass-card-hover p-6 flex flex-col gap-4 group block"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
                      <FolderKanban className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-brand-300 transition-colors">
                        {project.name}
                      </h3>
                      <span className={`badge badge-${role.toLowerCase()} mt-1`}>{role}</span>
                    </div>
                  </div>
                  {role === 'Admin' && (
                    <button
                      onClick={(e) => handleDelete(project._id, e)}
                      className="btn-ghost p-1.5 text-red-400/60 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                      title="Delete project"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-400 line-clamp-2 flex-1">
                  {project.description || 'No description provided'}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-700/50 pt-3">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{project.members?.length || 1} member{project.members?.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{format(new Date(project.createdAt), 'MMM d, yyyy')}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-brand-400 opacity-0 group-hover:opacity-100 transition-all -translate-x-1 group-hover:translate-x-0" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {showCreate && (
        <CreateProjectModal
          onClose={() => setShowCreate(false)}
          onCreate={(proj) => setProjects((p) => [proj, ...p])}
        />
      )}
    </div>
  );
}

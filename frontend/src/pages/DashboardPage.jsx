import { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import {
  CheckCircle2, Clock, AlertTriangle, TrendingUp,
  Users, Loader2, Calendar, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const PRIORITY_COLORS = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444' };
const STATUS_COLORS = { Todo: '#64748b', InProgress: '#3b82f6', Done: '#10b981' };

function StatCard({ icon: Icon, label, value, sub, iconClass, gradient }) {
  return (
    <div className={`stat-card glass-card-hover relative overflow-hidden`}>
      <div className={`absolute inset-0 opacity-5 ${gradient}`} />
      <div className="relative">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="text-3xl font-bold text-white">{value ?? <Loader2 className="w-6 h-6 animate-spin text-slate-500" />}</p>
        <p className="text-sm font-medium text-slate-300 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statusData = stats
    ? Object.entries(stats.byStatus).map(([name, value]) => ({ name, value }))
    : [];

  const priorityData = stats
    ? Object.entries(stats.byPriority).map(([name, value]) => ({ name, value }))
    : [];

  const completionRate = stats && stats.totalTasks > 0
    ? Math.round((stats.byStatus.Done / stats.totalTasks) * 100)
    : 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-400 mt-1">
          {user?.role === 'admin'
            ? 'Manage your projects and track team progress'
            : 'Here are your assigned tasks and activity'}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={TrendingUp}
          label="Total Tasks"
          value={stats?.totalTasks}
          sub={`${completionRate}% completion rate`}
          iconClass="bg-brand-500/20 text-brand-400"
          gradient="bg-brand-500"
        />
        <StatCard
          icon={Clock}
          label="In Progress"
          value={stats?.byStatus?.InProgress}
          sub="Currently active"
          iconClass="bg-blue-500/20 text-blue-400"
          gradient="bg-blue-500"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats?.byStatus?.Done}
          sub="Tasks finished"
          iconClass="bg-emerald-500/20 text-emerald-400"
          gradient="bg-emerald-500"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={stats?.overdueTasks}
          sub="Needs attention"
          iconClass="bg-red-500/20 text-red-400"
          gradient="bg-red-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Status Chart */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-brand-500 rounded-full" />
            Tasks by Status
          </h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} barSize={40}>
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
                  cursor={{ fill: 'rgba(59,130,246,0.05)' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Priority Pie */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-purple-500 rounded-full" />
            Tasks by Priority
          </h2>
          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-slate-500" />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={priorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityData.map((entry) => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', color: '#e2e8f0' }}
                />
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks per User */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Tasks per Member
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-surface-700 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : stats?.tasksPerUser?.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No task assignments yet</p>
          ) : (
            <div className="space-y-3">
              {stats.tasksPerUser.slice(0, 6).map((item) => {
                const max = stats.tasksPerUser[0]?.count || 1;
                const pct = Math.round((item.count / max) * 100);
                return (
                  <div key={item.user._id} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-brand-500 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {item.user.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-slate-300 truncate">{item.user.name}</span>
                        <span className="text-xs font-semibold text-slate-400 ml-2">{item.count}</span>
                      </div>
                      <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-brand-500 to-purple-500 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue Tasks */}
        <div className="glass-card p-6">
          <h2 className="text-base font-semibold text-slate-200 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Overdue Tasks
          </h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-14 bg-surface-700 rounded-xl animate-pulse" />)}
            </div>
          ) : stats?.overdueTaskList?.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No overdue tasks! Great work 🎉</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stats.overdueTaskList.map((task) => (
                <div key={task._id} className="flex items-start gap-3 p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <Calendar className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <p className="text-xs text-red-400 mt-0.5">
                      Due {format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <span className={`badge badge-${task.priority.toLowerCase()} shrink-0`}>{task.priority}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-6 glass-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-white">
            {user?.role === 'admin' ? 'Ready to create a project?' : 'Ready to work?'}
          </h3>
          <p className="text-sm text-slate-400">
            {user?.role === 'admin'
              ? 'Create a project and assign tasks to your team'
              : 'Go to Projects to see and update your assigned tasks'}
          </p>
        </div>
        <Link to="/projects" className="btn-primary flex items-center gap-2 whitespace-nowrap">
          {user?.role === 'admin' ? 'Manage Projects' : 'My Projects'} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

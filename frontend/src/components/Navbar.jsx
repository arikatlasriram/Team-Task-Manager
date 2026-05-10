import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, FolderKanban, LogOut, CheckSquare, User, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-card rounded-none border-r border-slate-700/50 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">TaskFlow</h1>
            <p className="text-xs text-slate-500">Team Manager</p>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </NavLink>
        <NavLink
          to="/projects"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <FolderKanban className="w-4 h-4" />
          Projects
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          <Settings className="w-4 h-4" />
          Profile
        </NavLink>
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl">
          <div className="w-9 h-9 bg-gradient-to-br from-brand-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials || <User className="w-4 h-4" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              {user?.role === 'admin' && (
                <span className="px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400 rounded uppercase tracking-wider">
                  Admin
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="btn-ghost p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

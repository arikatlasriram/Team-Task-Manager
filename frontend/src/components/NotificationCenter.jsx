import { useState, useEffect, useRef } from 'react';
import { Bell, Check, Trash2, Loader2, Calendar } from 'lucide-react';
import api from '../services/api';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Failed to fetch notifications');
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Polling every 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      toast.error('Failed to update notification');
    }
  };

  const clearAll = async () => {
    setLoading(true);
    try {
      await api.delete('/notifications/all');
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications cleared');
    } catch (err) {
      toast.error('Failed to clear notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-slate-900">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-card p-0 overflow-hidden z-50 shadow-2xl border border-slate-700/50">
          <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/30">
            <h3 className="font-semibold text-white text-sm">Notifications</h3>
            {notifications.length > 0 && (
              <button
                onClick={clearAll}
                disabled={loading}
                className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                Clear all
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-20" />
                <p className="text-sm text-slate-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 border-b border-slate-700/30 flex gap-3 hover:bg-slate-800/20 transition-colors ${!n.read ? 'bg-brand-500/5' : ''}`}
                >
                  <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.read ? 'bg-brand-500' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                      {!n.read && (
                        <button
                          onClick={() => markAsRead(n._id)}
                          className="text-[10px] text-brand-400 hover:text-brand-300 font-semibold"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-2 bg-slate-800/30 text-center">
              <button className="text-[11px] text-slate-500 hover:text-slate-300">
                View all activity
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { notificationService } from '../api/services';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { Bell, Check, MailOpen, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSync } from '../context/SyncContext';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { syncVersion, notifySync } = useSync();

  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications(0, 50);
      if (res.success && res.data) {
        setNotifications(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 4000);
    return () => clearInterval(interval);
  }, [syncVersion]);

  const handleMarkRead = async (id) => {
    try {
      const res = await notificationService.markRead(id);
      if (res.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        toast.success("Notification marked as read.");
        notifySync();
      }
    } catch (err) {
      toast.error("Failed to update notification.");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await notificationService.markAllRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        toast.success("All notifications marked as read.");
        notifySync();
      }
    } catch (err) {
      toast.error("Failed to update notifications.");
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* Header */}
          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold flex items-center gap-2">
                <Bell size={24} className="text-primary animate-pulse" />
                Notification Inbox
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Stay updated on adoption approvals, comments, and payment tasks.</p>
            </div>
            {notifications.some(n => !n.read) && (
              <button
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-750 dark:text-slate-200 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 self-start"
              >
                <MailOpen size={14} />
                Mark All Read
              </button>
            )}
          </div>

          {/* List */}
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl py-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-2xl mb-4">
                🔔
              </div>
              <h3 className="text-lg font-display font-bold">No notifications yet</h3>
              <p className="text-slate-550 dark:text-slate-455 text-xs max-w-sm mt-1 font-medium">
                You'll receive alert updates when hosts check adoption applications or publish notices.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`py-5 flex items-center justify-between gap-4 transition-colors ${
                    !notif.read ? 'bg-primary/5 dark:bg-primary/10 rounded-2xl px-4 my-2 border border-primary/10' : 'px-4'
                  }`}
                >
                  <div className="space-y-1">
                    <p className={`text-sm ${!notif.read ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-655 dark:text-slate-350'}`}>
                      {notif.message}
                    </p>
                    <span className="text-[10px] text-slate-450 font-medium">
                      {new Date(notif.createdAt || Date.now()).toLocaleString()}
                    </span>
                  </div>
                  {!notif.read && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-2 border border-primary/20 hover:bg-primary/10 text-primary rounded-xl transition-all"
                      title="Mark as read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Notifications;

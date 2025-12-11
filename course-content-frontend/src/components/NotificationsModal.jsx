import React, { useEffect, useState } from "react";
import { FaBell, FaTimes, FaHeart, FaComment } from "react-icons/fa";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/contentApi";

function NotificationsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      setNotifications(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleRead = async (id) => {
    await markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-950 w-full max-w-sm h-[500px] rounded-2xl shadow-2xl flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">

        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-2">
            <FaBell className="text-sky-500" /> Notifications
          </h3>
          <div className="flex gap-2">
             <button onClick={handleMarkAll} className="text-xs text-sky-600 hover:underline">Mark all read</button>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><FaTimes /></button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50 dark:bg-slate-900/20">
            {loading ? <p className="text-center text-xs text-slate-400 mt-4">Loading...</p> :
             notifications.length === 0 ? <p className="text-center text-xs text-slate-400 mt-10">No notifications yet.</p> : (
               notifications.map(n => (
                 <div key={n.id}
                      onClick={() => handleRead(n.id)}
                      className={`p-3 mb-2 rounded-xl flex gap-3 cursor-pointer transition-colors border ${n.read ? 'bg-white dark:bg-slate-900 border-transparent opacity-60' : 'bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800'}`}>
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${n.type === 'LIKE' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
                        {n.type === 'LIKE' ? <FaHeart size={12}/> : <FaComment size={12}/>}
                    </div>
                    <div>
                        <p className="text-sm text-slate-700 dark:text-slate-200 leading-tight">{n.message}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                    </div>
                 </div>
               ))
             )
            }
        </div>
      </div>
    </div>
  );
}

export default NotificationsModal;
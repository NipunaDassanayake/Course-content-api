import React, { useEffect, useState } from "react";
import { FaBell, FaTimes, FaHeart, FaComment, FaUserCircle } from "react-icons/fa";
import { getNotifications, markNotificationRead, markAllNotificationsRead } from "../api/contentApi";
import { useNavigate } from "react-router-dom"; // ✅ Import useNavigate

function NotificationsModal({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigation

  useEffect(() => {
    if (isOpen) {
        fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await getNotifications();
      // Safety Check: Ensure data is an array
      if (Array.isArray(res.data)) {
          setNotifications(res.data);
      } else {
          setNotifications([]);
      }
    } catch (e) {
        console.error("Failed to fetch notifications:", e);
        setNotifications([]);
    }
    finally { setLoading(false); }
  };

  const handleMarkAll = async () => {
    try {
        await markAllNotificationsRead();
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (e) {
        console.error("Failed to mark all read", e);
    }
  };

  // ✅ New Handler: Click Notification -> Redirect to Comments
  const handleNotificationClick = async (notification) => {
    // 1. Mark as read in backend if not already
    if (!notification.read) {
        try {
            await markNotificationRead(notification.id);
        } catch(e) { console.error(e); }
    }

    // 2. Close the modal
    onClose();

    // 3. Redirect to Home with query param to open comments
    if (notification.contentId) {
      navigate(`/home?openComments=${notification.contentId}`);
    }
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
          <div className="flex gap-3 items-center">
             <button onClick={handleMarkAll} className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:hover:text-sky-400 transition-colors">
                Mark all read
             </button>
             <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <FaTimes />
             </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 bg-slate-50/50 dark:bg-slate-900/20">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-2">
                    <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400">Loading updates...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-4">
                    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                        <FaBell className="text-slate-300 dark:text-slate-600 text-xl" />
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No new notifications</p>
                    <p className="text-xs text-slate-400 mt-1">We'll let you know when something happens!</p>
                </div>
            ) : (
               notifications.map(n => (
                 <div key={n.id}
                      onClick={() => handleNotificationClick(n)} // ✅ Use new handler
                      className={`group p-3 mb-2 rounded-xl flex gap-3 cursor-pointer transition-all border relative overflow-hidden
                        ${n.read
                            ? 'bg-white dark:bg-slate-950 border-transparent opacity-70 hover:opacity-100'
                            : 'bg-sky-50 dark:bg-sky-900/20 border-sky-100 dark:border-sky-800 shadow-sm'
                        }`}
                 >
                    {/* Unread Indicator Dot */}
                    {!n.read && (
                        <div className="absolute top-3 right-3 w-2 h-2 bg-sky-500 rounded-full"></div>
                    )}

                    {/* Actor Avatar */}
                    <div className="shrink-0 relative">
                        {n.actorImage ? (
                            <img
                                src={n.actorImage}
                                alt={n.actorName}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <FaUserCircle size={20} />
                            </div>
                        )}

                        {/* Type Icon Badge */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 ${n.type === 'LIKE' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                            {n.type === 'LIKE' ? <FaHeart size={8}/> : <FaComment size={8}/>}
                        </div>
                    </div>

                    <div className="flex-1 pr-4">
                        <p className="text-sm text-slate-800 dark:text-slate-100 leading-snug">
                            <span className="font-bold">{n.actorName}</span>
                            <span className="text-slate-600 dark:text-slate-400 font-normal"> {n.message.replace(n.actorName, '')}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-medium">{new Date(n.createdAt).toLocaleString()}</p>
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
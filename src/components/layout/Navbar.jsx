import React, { useState } from 'react';
import { Search, PlusCircle, Bell, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ 
  onSearch, 
  onOpenCreateModal, 
  notifications = [], 
  notificationCount = 0,
  onClearNotifications,
  onNotificationClick 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const count = notificationCount || notifications.length;

  return (
    <header className="glass-panel sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between gap-4 border-b border-slate-200/80 shadow-2xs">
      
      {/* Search Bar */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-2.5 text-slate-400" size={18} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search tickets by ID, title, or status..."
          className="w-full pl-10 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xs"
        />
      </div>

      {/* Action Controls & Notifications */}
      <div className="flex items-center gap-3">

        {/* Real-time Notification Bell & Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            className="p-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-xs cursor-pointer relative"
          >
            <Bell size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-bounce shadow-xs">
                {count}
              </span>
            )}
          </button>

          {/* Dropdown Menu */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Recent Notifications ({count})</span>
                {notifications.length > 0 && onClearNotifications && (
                  <button 
                    onClick={onClearNotifications}
                    className="text-[11px] text-blue-600 hover:underline font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium">
                    <Bell size={24} className="mx-auto mb-1 opacity-30" />
                    No new notifications
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        if (onNotificationClick) onNotificationClick(n);
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-blue-50/60 transition-colors cursor-pointer text-left space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{n.title || 'System Notification'}</span>
                        <span className="text-[10px] text-slate-400">{n.time || 'Just now'}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{n.message || n.subject || ''}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Generate Ticket Button */}
        {user?.role === 'customer' && (
          <button
            onClick={onOpenCreateModal}
            className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md cursor-pointer"
          >
            <PlusCircle size={18} />
            <span>Generate Ticket</span>
          </button>
        )}

      </div>

    </header>
  );
}

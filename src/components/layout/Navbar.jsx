import React, { useState } from 'react';
import { Search, PlusCircle, Bell, Sparkles, Check, Clock, Star, X } from 'lucide-react';
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
    <header className="glass-panel sticky top-0 z-20 px-6 py-3 flex items-center justify-between gap-4 border-b border-slate-200/80 shadow-2xs">
      
      {/* Sleek Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search tickets, workers, categories..."
          className="w-full pl-10 pr-12 py-2 bg-slate-50/90 border border-slate-200/90 rounded-xl text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all shadow-2xs"
        />
        {searchTerm ? (
          <button 
            onClick={() => { setSearchTerm(''); if (onSearch) onSearch(''); }}
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X size={14} />
          </button>
        ) : (
          <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400 border border-slate-200 rounded px-1 py-0.2 bg-white pointer-events-none">
            ⌘K
          </span>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">

        {/* Real-time Notification Center */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notification Center"
            className="p-2 bg-white border border-slate-200/90 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all shadow-2xs cursor-pointer relative"
          >
            <Bell size={16} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center animate-pulse shadow-xs">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </button>

          {/* Premium Notification Center Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white/98 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-200/90 py-3 z-50 animate-fadeIn">
              <div className="px-4 pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Notifications</span>
                  {count > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-indigo-50 text-indigo-700 rounded-full">
                      {count} new
                    </span>
                  )}
                </div>
                {notifications.length > 0 && onClearNotifications && (
                  <button 
                    onClick={onClearNotifications}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs font-medium space-y-1">
                    <Bell size={20} className="mx-auto opacity-30 text-slate-400" />
                    <p>All caught up! No unread notifications</p>
                  </div>
                ) : (
                  notifications.map((n, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        if (onNotificationClick) onNotificationClick(n);
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-slate-50/80 transition-colors cursor-pointer text-left space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800">{n.title || 'Notification'}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{n.time || 'Now'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-snug font-normal">{n.message || n.subject || ''}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Generate Ticket Primary Action */}
        {user?.role === 'customer' && (
          <button
            onClick={onOpenCreateModal}
            className="btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>Generate Ticket</span>
          </button>
        )}

      </div>

    </header>
  );
}

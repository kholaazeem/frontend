import React, { useState } from 'react';
import { Search, PlusCircle, Bell, Bot, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar({ onSearch, onOpenCreateModal, notificationCount = 2 }) {
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="glass-panel sticky top-0 z-20 px-6 py-3.5 flex items-center justify-between gap-4 border-b border-slate-200/80 shadow-2xs">
      
      {/* Search Bar - Matches Miss's Top Input Box */}
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

        {/* Real-time Notification Bell */}
        <div className="relative">
          <button className="p-2.5 bg-white/90 border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-xs cursor-pointer">
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {notificationCount}
              </span>
            )}
          </button>
        </div>

        {/* Generate Ticket Button - Matches Miss's Sketch Top Right Button! */}
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

import React, { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Bot, 
  Ticket, 
  PlusCircle, 
  User, 
  LogOut, 
  LayoutDashboard, 
  Sparkles,
  Wrench,
  ShieldCheck,
  LifeBuoy
} from 'lucide-react';
import gsap from 'gsap';

export default function Sidebar({ onOpenCreateModal, onOpenProfileModal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const robotIconRef = useRef(null);

  useEffect(() => {
    if (robotIconRef.current) {
      gsap.to(robotIconRef.current, {
        y: -2,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavItems = () => {
    if (user?.role === 'worker') {
      return [
        { label: 'Task Queue', path: '/worker/dashboard', icon: Ticket },
        { label: 'Account Settings', action: onOpenProfileModal, icon: User }
      ];
    }
    if (user?.role === 'admin') {
      return [
        { label: 'Admin Command', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'System Settings', action: onOpenProfileModal, icon: User }
      ];
    }
    return [
      { label: 'Support Tickets', path: '/customer/dashboard', icon: Ticket },
      { label: 'Generate Ticket', action: onOpenCreateModal, icon: PlusCircle, isAction: true },
      { label: 'Profile Settings', action: onOpenProfileModal, icon: User }
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 glass-sidebar h-screen sticky top-0 flex flex-col justify-between p-5 z-30 select-none">
      
      {/* Top Brand & Menu */}
      <div className="space-y-6">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-1.5 pt-1">
          <div 
            ref={robotIconRef}
            className="w-10 h-10 bg-gradient-to-tr from-blue-600 via-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-indigo-500/25"
          >
            <Bot size={22} />
          </div>
          <div className="leading-tight">
            <h2 className="font-extrabold text-slate-900 tracking-tight text-base flex items-center gap-1.5">
              SupportFlow
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" title="System Operational"></span>
            </h2>
            <p className="text-[11px] font-semibold text-slate-400 capitalize">
              {user?.role === 'worker' ? 'Worker Console' : user?.role === 'admin' ? 'Admin Portal' : 'Customer Workspace'}
            </p>
          </div>
        </div>

        {/* Section Label */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2.5">
            Platform Navigation
          </span>

          {/* Navigation Items */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              
              if (item.action) {
                if (item.isAction) {
                  return (
                    <button
                      key={index}
                      onClick={item.action}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-bold text-xs btn-primary shadow-sm cursor-pointer my-2"
                    >
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </button>
                  );
                }
                return (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 transition-all cursor-pointer"
                  >
                    <Icon size={16} className="text-slate-400" />
                    <span>{item.label}</span>
                  </button>
                );
              }

              return (
                <NavLink
                  key={index}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`
                  }
                >
                  <Icon size={16} className="text-slate-400 group-hover:text-slate-600" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

      </div>

      {/* User Card at Bottom */}
      <div className="pt-4 border-t border-slate-200/80 space-y-2">
        <div 
          onClick={onOpenProfileModal}
          className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 transition-all cursor-pointer group"
          title="Edit Profile"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Avatar"
                className="w-8 h-8 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold flex items-center justify-center text-xs uppercase shrink-0 shadow-2xs">
                {user?.name ? user.name.charAt(0) : <User size={13} />}
              </div>
            )}
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-400 truncate capitalize font-medium">
                {user?.role} {user?.specialty ? `• ${user?.specialty}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleLogout();
            }}
            title="Sign Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

    </aside>
  );
}

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
  CheckCircle2, 
  Users, 
  Sliders, 
  Sparkles,
  Wrench,
  ShieldCheck
} from 'lucide-react';
import gsap from 'gsap';

export default function Sidebar({ onOpenCreateModal }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const robotIconRef = useRef(null);

  useEffect(() => {
    // Floating 3D Robot icon animation
    if (robotIconRef.current) {
      gsap.to(robotIconRef.current, {
        y: -4,
        rotate: 3,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Define navigation items based on User Role
  const getNavItems = () => {
    if (user?.role === 'worker') {
      return [
        { label: 'Ticket Queue', path: '/worker/dashboard', icon: Ticket },
        { label: 'Completed Tasks', path: '/worker/completed', icon: CheckCircle2 },
        { label: 'My Profile', path: '/worker/profile', icon: User }
      ];
    }
    if (user?.role === 'admin') {
      return [
        { label: 'Analytics Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'All Tickets', path: '/admin/tickets', icon: Ticket },
        { label: 'User Management', path: '/admin/users', icon: Users },
        { label: 'AI Settings', path: '/admin/settings', icon: Sliders }
      ];
    }
    // Default: Customer Role
    return [
      { label: 'My Tickets', path: '/customer/dashboard', icon: Ticket },
      { label: 'Generate Ticket', action: onOpenCreateModal, icon: PlusCircle, highlight: true },
      { label: 'Profile Settings', path: '/customer/profile', icon: User }
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 glass-sidebar h-screen sticky top-0 flex flex-col justify-between p-5 shadow-sm z-30">
      
      {/* Top Logo & App Title */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div 
            ref={robotIconRef}
            className="w-11 h-11 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 robot-glow"
          >
            <Bot size={26} />
          </div>
          <div>
            <h2 className="font-extrabold text-slate-800 tracking-tight text-lg leading-tight flex items-center gap-1">
              SupportFlow <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            </h2>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
              {user?.role === 'worker' ? 'Worker Desk' : user?.role === 'admin' ? 'Admin Panel' : 'Customer Desk'}
            </span>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="space-y-1.5">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            if (item.action) {
              return (
                <button
                  key={index}
                  onClick={item.action}
                  className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm btn-primary text-white shadow-md transition-all cursor-pointer"
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            }
            return (
              <NavLink
                key={index}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-md shadow-blue-500/20'
                      : 'text-slate-600 hover:bg-white/80 hover:text-slate-900'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile Mini-Card at Bottom */}
      <div className="pt-4 border-t border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white/70 border border-slate-200/60 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt="Avatar"
              className="w-9 h-9 rounded-xl object-cover border border-blue-200 shadow-xs"
            />
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 truncate">{user?.name || 'Sara Khan'}</p>
              <p className="text-[11px] text-slate-500 truncate capitalize flex items-center gap-1">
                {user?.role === 'worker' ? <Wrench size={10} className="text-blue-600" /> : <ShieldCheck size={10} className="text-emerald-600" />}
                {user?.role} {user?.specialty ? `• ${user?.specialty}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>

    </aside>
  );
}

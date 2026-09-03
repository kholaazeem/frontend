import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import API from '../../services/api';
import { ShieldCheck, Ticket, Users, CheckCircle2, Clock, Bot, Sparkles, BarChart2, Star, UserCheck, Wrench, Shield, Check, AlertCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' | 'users'
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [actionError, setActionError] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    fetchAdminTickets();
    fetchUsers();
  }, []);

  const fetchAdminTickets = async () => {
    try {
      const res = await API.get('/tickets');
      if (Array.isArray(res.data)) setTickets(res.data);
    } catch (e) {
      console.error('Fetch tickets error:', e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get('/auth/users');
      if (Array.isArray(res.data)) setUsers(res.data);
    } catch (e) {
      console.error('Fetch users error:', e);
    }
  };

  const handleRoleChange = async (userId, userName, newRole) => {
    setUpdatingUserId(userId);
    setActionSuccess('');
    setActionError('');
    try {
      const res = await API.put(`/auth/users/${userId}/role`, { role: newRole });
      setActionSuccess(`✓ ${userName} has been successfully assigned the role of ${newRole.toUpperCase()}!`);
      await fetchUsers();
      await fetchAdminTickets();
      setTimeout(() => setActionSuccess(''), 5000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update user role');
      setTimeout(() => setActionError(''), 5000);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.assignedWorker?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.specialty?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending' || t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'accepted' || t.status === 'assigned').length,
    completed: tickets.filter(t => t.status === 'completed' || t.status === 'resolved').length,
    workers: users.filter(u => u.role === 'worker').length || new Set(tickets.map(t => t.assignedWorker?._id).filter(Boolean)).size,
    customers: users.filter(u => u.role === 'customer').length || new Set(tickets.map(t => t.customer?._id).filter(Boolean)).size,
    admins: users.filter(u => u.role === 'admin').length
  };

  return (
    <DashboardLayout onSearch={setSearchQuery}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Admin Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/90">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              🛡️ Admin Master Control
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1.5 flex items-center gap-2">
              Platform Analytics & Authority Management <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500">Monitor all support tickets, manage users, and grant or reassign Admin authorities</p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl">
            <Bot size={22} className="text-blue-600" />
            <div>
              <span className="text-[10px] text-blue-700 font-bold block uppercase">AI Engine Status</span>
              <span className="text-xs font-extrabold text-blue-800">Smart Support AI Active</span>
            </div>
          </div>
        </div>

        {/* Feedback Alerts */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <Check className="text-emerald-600" size={16} />
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="text-red-600" size={16} />
            {actionError}
          </div>
        )}

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Tickets</span>
              <p className="text-xl font-black text-slate-800">{stats.total}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Clock size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">In Progress</span>
              <p className="text-xl font-black text-slate-800">{stats.inProgress}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Resolved Tasks</span>
              <p className="text-xl font-black text-slate-800">{stats.completed}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <Users size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Platform Users</span>
              <p className="text-xl font-black text-slate-800">{users.length || (stats.workers + stats.customers)}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            type="button"
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'tickets'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Ticket size={16} /> All Tickets Directory ({filteredTickets.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'users'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <ShieldCheck size={16} /> User Roles & Admin Authority ({users.length})
          </button>
        </div>

        {/* Tab 1: Master Tickets Table */}
        {activeTab === 'tickets' && (
          <div className="glass-panel rounded-3xl border border-white/90 shadow-lg overflow-hidden space-y-4">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-800 text-base">All System Tickets</h3>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {filteredTickets.length} total records
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Ticket ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Subject & Category</th>
                    <th className="py-3 px-4">Assigned Worker</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Urgency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {filteredTickets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                        No tickets recorded in the system yet.
                      </td>
                    </tr>
                  ) : (
                    filteredTickets.map((t) => (
                      <tr key={t._id} className="hover:bg-purple-50/30 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-purple-700">{t.ticketNumber}</td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">{t.customer?.name || 'Customer'}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-800 text-sm truncate max-w-xs">{t.subject}</p>
                          <span className="text-[10px] font-semibold text-slate-500">🏷️ {t.category}</span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-700">
                          {t.assignedWorker ? `${t.assignedWorker.name} (${t.assignedWorker.rating || 5.0}⭐)` : 'Unassigned'}
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-700">
                          {t.urgency || 'Medium'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: User Roles & Admin Authority Management */}
        {activeTab === 'users' && (
          <div className="glass-panel rounded-3xl border border-white/90 shadow-lg overflow-hidden space-y-4">
            <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <ShieldCheck size={18} className="text-purple-600" />
                  User Role & Authority Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Admin Authority: Change or reassign user roles to Admin, Worker, or Customer with one click.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                {filteredUsers.length} registered users
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Email Address</th>
                    <th className="py-3 px-4">Current Role</th>
                    <th className="py-3 px-4">Specialty</th>
                    <th className="py-3 px-4 text-right">Assign / Change Authority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-slate-400 font-medium">
                        No registered users found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const isUpdating = updatingUserId === u._id;
                      return (
                        <tr key={u._id} className="hover:bg-purple-50/20 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-slate-800">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-extrabold flex items-center justify-center text-xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <span className="truncate">{u.name}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-medium">{u.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold uppercase border inline-flex items-center gap-1 ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : u.role === 'worker'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              {u.role === 'admin' && <Shield size={12} />}
                              {u.role === 'worker' && <Wrench size={12} />}
                              {u.role === 'customer' && <UserCheck size={12} />}
                              {u.role}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 font-medium">
                            {u.specialty || (u.role === 'worker' ? 'General' : '-')}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {u.role !== 'admin' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleRoleChange(u._id, u.name, 'admin')}
                                  className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Promote this user to Admin"
                                >
                                  <Shield size={12} /> Assign Admin
                                </button>
                              )}
                              {u.role !== 'worker' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleRoleChange(u._id, u.name, 'worker')}
                                  className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Set as Worker"
                                >
                                  <Wrench size={12} /> Make Worker
                                </button>
                              )}
                              {u.role !== 'customer' && (
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => handleRoleChange(u._id, u.name, 'customer')}
                                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg font-bold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Demote to Customer"
                                >
                                  <UserCheck size={12} /> Set Customer
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}


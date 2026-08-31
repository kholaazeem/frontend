import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import API from '../../services/api';
import { ShieldCheck, Ticket, Users, CheckCircle2, Clock, Bot, Sparkles, BarChart2, Star } from 'lucide-react';

export default function AdminDashboard() {
  const [tickets, setTickets] = useState([
    {
      _id: 'tkt_1001',
      ticketNumber: 'TKT-1001',
      customer: { name: 'Sara Khan', email: 'customer@demo.com' },
      assignedWorker: { name: 'Worker Ali', specialty: 'Technical', rating: 4.9 },
      subject: 'AC cooling issue and water leaking',
      category: 'Appliance',
      status: 'in-progress',
      urgency: 'High',
      createdAt: '2026-08-30'
    },
    {
      _id: 'tkt_1002',
      ticketNumber: 'TKT-1002',
      customer: { name: 'Sara Khan', email: 'customer@demo.com' },
      assignedWorker: { name: 'Worker Usman', specialty: 'Billing', rating: 4.8 },
      subject: 'Double charge on invoice #9921',
      category: 'Billing',
      status: 'pending',
      urgency: 'High',
      createdAt: '2026-08-29'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAdminTickets();
  }, []);

  const fetchAdminTickets = async () => {
    try {
      const res = await API.get('/tickets');
      if (res.data && res.data.length > 0) setTickets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTickets = tickets.filter(t =>
    t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'accepted').length,
    completed: tickets.filter(t => t.status === 'completed').length,
    workers: 3,
    customers: 5
  };

  return (
    <DashboardLayout onSearch={setSearchQuery}>
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Admin Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/90">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
              🛡️ Admin / Supervisor Control
            </span>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1.5 flex items-center gap-2">
              System Analytics & All Tickets Directory <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500">Monitor platform metrics, manage workers, and oversee AI triage engine</p>
          </div>

          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-2xl">
            <Bot size={22} className="text-blue-600" />
            <div>
              <span className="text-[10px] text-blue-700 font-bold block uppercase">AI Dual Engine</span>
              <span className="text-xs font-extrabold text-blue-800">Gemini 1.5 + Keyword Fallback</span>
            </div>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center font-bold">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Total System Tickets</span>
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
              <span className="text-xs text-slate-500 font-medium">Registered Workers</span>
              <p className="text-xl font-black text-slate-800">{stats.workers}</p>
            </div>
          </div>
        </div>

        {/* Master Tickets Table */}
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
                {filteredTickets.map((t) => (
                  <tr key={t._id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-extrabold text-purple-700">{t.ticketNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{t.customer?.name || 'Customer'}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-800 text-sm truncate max-w-xs">{t.subject}</p>
                      <span className="text-[10px] font-semibold text-slate-500">🏷️ {t.category}</span>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {t.assignedWorker?.name || 'Worker Ali'} ({t.assignedWorker?.rating || 4.9}⭐)
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-700">
                      {t.urgency || 'Medium'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

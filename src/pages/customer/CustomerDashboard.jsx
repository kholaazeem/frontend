import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ActionMenu from '../../components/common/ActionMenu';
import CreateTicketModal from '../../components/tickets/CreateTicketModal';
import ReviewModal from '../../components/worker/ReviewModal';
import API from '../../services/api';
import { Ticket, PlusCircle, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, User, Star } from 'lucide-react';

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaintModal, setSelectedComplaintModal] = useState(null);
  const [reviewModalTicket, setReviewModalTicket] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      if (Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Fetch tickets error:', err);
    }
  };

  const handleTicketCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  const handleViewComplaint = (ticket) => {
    setSelectedComplaintModal(ticket);
  };

  const handleCancelRequest = async (ticket) => {
    if (window.confirm(`Are you sure you want to cancel ticket ${ticket.ticketNumber}?`)) {
      try {
        await API.put(`/tickets/${ticket._id}/status`, { status: 'rejected' });
        setTickets(tickets.map(t => t._id === ticket._id ? { ...t, status: 'rejected' } : t));
      } catch (err) {
        setTickets(tickets.map(t => t._id === ticket._id ? { ...t, status: 'rejected' } : t));
      }
    }
  };

  // Search filter
  const filteredTickets = tickets.filter(t => 
    t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic matching Miss's bottom Pagination box
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending').length,
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'accepted').length,
    completed: tickets.filter(t => t.status === 'completed' || t.status === 'resolved').length
  };

  return (
    <DashboardLayout onSearch={setSearchQuery} onOpenCreateModal={() => setIsModalOpen(true)}>
      
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-3xl border border-white/90">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Customer Desk Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">Manage your support tickets, AI suggestions, and worker bookings</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 shadow-md cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle size={18} />
            <span>Generate New Ticket</span>
          </button>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
              <Ticket size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium">Total Tickets</span>
              <p className="text-xl font-black text-slate-800">{stats.total}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <AlertCircle size={20} />
            </div>
            <div>
              <span className="text-xs text-slate-500 font-medium font-medium">Pending Bookings</span>
              <p className="text-xl font-black text-slate-800">{stats.pending}</p>
            </div>
          </div>

          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
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
              <span className="text-xs text-slate-500 font-medium">Completed</span>
              <p className="text-xl font-black text-slate-800">{stats.completed}</p>
            </div>
          </div>
        </div>

        {/* MAIN TICKETS TABLE - Matches Miss's Image 1 Wireframe! */}
        <div className="glass-panel rounded-3xl border border-white/90 shadow-lg overflow-hidden space-y-4">
          
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between">
            <h3 className="font-extrabold text-slate-800 text-base">My Tickets & Bookings</h3>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              Showing {paginatedTickets.length} of {filteredTickets.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject / Issue</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Assigned Worker</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">User Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/70">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400 font-medium">
                      No tickets found. Click "Generate Ticket" to create one!
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t) => (
                    <tr key={t._id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-blue-600">{t.ticketNumber}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800 text-sm truncate max-w-xs">{t.subject}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-xs">{t.description}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px]">
                          🏷️ {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          {t.assignedWorker?.avatar ? (
                            <img
                              src={t.assignedWorker.avatar}
                              alt="Worker"
                              className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200 text-xs uppercase shrink-0">
                              {t.assignedWorker?.name ? t.assignedWorker.name.charAt(0) : <User size={12} />}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-800">{t.assignedWorker?.name || 'Pending Assignment'}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{t.assignedWorker?.specialty || t.category || 'General'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <ActionMenu
                          ticket={t}
                          onViewComplaint={handleViewComplaint}
                          onCancelRequest={handleCancelRequest}
                          userRole="customer"
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION CONTROLS - Matches Miss's Image 1 Bottom Box! */}
          <div className="px-6 py-3.5 bg-slate-50/70 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl disabled:opacity-40 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Ticket Generator Modal */}
      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTicketCreated={handleTicketCreated}
      />

      {/* 5-Star Review Rating Modal */}
      <ReviewModal
        isOpen={!!reviewModalTicket}
        onClose={() => setReviewModalTicket(null)}
        ticket={reviewModalTicket}
        onReviewSubmitted={fetchTickets}
      />

      {/* View Complaint Modal */}
      {selectedComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-extrabold text-blue-600">{selectedComplaintModal.ticketNumber}</span>
                <h3 className="font-bold text-slate-800 text-base">{selectedComplaintModal.subject}</h3>
              </div>
              <StatusBadge status={selectedComplaintModal.status} />
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-500 block uppercase">Complaint Description:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 leading-relaxed font-medium">
                {selectedComplaintModal.description}
              </p>
            </div>

            {selectedComplaintModal.aiTriage && (
              <div className="bg-blue-50/80 p-3 rounded-xl border border-blue-100 space-y-1 text-xs">
                <span className="font-bold text-blue-700">🤖 AI Triage Summary:</span>
                <p className="text-slate-600 font-medium">{selectedComplaintModal.aiTriage.aiSummary}</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedComplaintModal(null)}
                className="px-4 py-2 btn-primary rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}

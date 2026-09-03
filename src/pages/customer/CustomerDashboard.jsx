import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ActionMenu from '../../components/common/ActionMenu';
import CreateTicketModal from '../../components/tickets/CreateTicketModal';
import ReviewModal from '../../components/worker/ReviewModal';
import TicketChatModal from '../../components/tickets/TicketChatModal';
import ChatWidget from '../../components/chat/ChatWidget';
import API from '../../services/api';
import { Ticket, PlusCircle, Clock, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, User, Star, BellRing, Sparkles, X, MessageSquare } from 'lucide-react';
import io from 'socket.io-client';

export default function CustomerDashboard() {
  const [tickets, setTickets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedComplaintModal, setSelectedComplaintModal] = useState(null);
  const [reviewModalTicket, setReviewModalTicket] = useState(null);
  const [chatTicket, setChatTicket] = useState(null);
  const [readMessageCounts, setReadMessageCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sf_cust_read_msgs') || '{}');
    } catch {
      return {};
    }
  });

  const handleOpenChat = (ticket) => {
    setChatTicket(ticket);
    const workerMsgs = (ticket.messages || []).filter(m => m.senderRole === 'worker' || (m.sender && String(m.sender) !== String(user?._id)));
    setReadMessageCounts(prev => {
      const updated = { ...prev, [ticket._id]: workerMsgs.length };
      try { localStorage.setItem('sf_cust_read_msgs', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };
  const [notifications, setNotifications] = useState([]);
  const [completionAlert, setCompletionAlert] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const hasAutoOpenedRef = useRef({});
  const ticketsSnapshotRef = useRef('');

  useEffect(() => {
    fetchTickets();

    // 4-second auto-poll with change-detection (no screen refresh / re-render if data is same)
    const interval = setInterval(fetchTickets, 4000);

    // Live Socket.IO listener for instant 0-second updates when available
    const socket = io('https://backend-iota-six-56.vercel.app', { transports: ['websocket', 'polling'] });
    
    socket.on('ticket_status_updated', () => {
      fetchTickets();
    });

    socket.on('ticket_message_received', () => {
      fetchTickets();
    });

    socket.on('ticket_ai_reviewed', () => {
      fetchTickets();
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await API.get('/tickets');
      if (Array.isArray(res.data)) {
        const list = res.data;

        // Compare lightweight snapshot so state is NOT set unless something actually changed
        const snap = JSON.stringify(list.map(t => ({ id: t._id, status: t.status, rating: t.rating, isRated: t.isRated })));
        if (snap === ticketsSnapshotRef.current) {
          return;
        }
        ticketsSnapshotRef.current = snap;
        setTickets(list);

        // Build notifications list dynamically from tickets
        const notifs = [];
        let unratedCompleted = null;

        list.forEach(t => {
          if (t.status === 'completed') {
            if (!t.isRated && !t.rating) {
              notifs.push({
                id: `completed_${t._id}`,
                title: `🎉 Task Completed: ${t.ticketNumber}`,
                message: `Worker finished "${t.subject}". Please rate your worker!`,
                time: t.resolvedAt ? new Date(t.resolvedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Action Needed',
                ticket: t
              });
              if (!unratedCompleted) unratedCompleted = t;
            } else {
              notifs.push({
                id: `rated_${t._id}`,
                title: `✅ Completed & Rated: ${t.ticketNumber}`,
                message: `You gave ${t.rating}⭐ rating. Thank you!`,
                time: 'Finished',
                ticket: t
              });
            }
          } else if (t.status === 'in-progress' || t.status === 'accepted') {
            notifs.push({
              id: `active_${t._id}`,
              title: `⚙️ Work In Progress: ${t.ticketNumber}`,
              message: `Worker is currently working on "${t.subject}".`,
              time: 'In Progress',
              ticket: t
            });
          }
        });

        setNotifications(notifs);

        // If there's an unrated completed task, trigger banner & auto-open rating popup!
        if (unratedCompleted) {
          setCompletionAlert({
            title: `🎉 Task Completed: ${unratedCompleted.ticketNumber}`,
            message: `Worker finished your task! Click to submit your 5-Star review.`,
            ticket: unratedCompleted
          });

          if (!hasAutoOpenedRef.current[unratedCompleted._id]) {
            hasAutoOpenedRef.current[unratedCompleted._id] = true;
            setReviewModalTicket(unratedCompleted);
          }
        }
      }
    } catch (err) {
      console.error('Fetch tickets error:', err);
    }
  };

  const handleReviewSubmitted = () => {
    if (reviewModalTicket) {
      hasAutoOpenedRef.current[reviewModalTicket._id] = true;
    }
    setCompletionAlert(null);
    setReviewModalTicket(null);
    fetchTickets();
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

  const [statusFilter, setStatusFilter] = useState('all');

  // Search and status filter
  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    if (statusFilter === 'pending') return t.status === 'pending' || t.status === 'new';
    if (statusFilter === 'in-progress') return t.status === 'in-progress' || t.status === 'accepted' || t.status === 'assigned';
    if (statusFilter === 'completed') return t.status === 'completed' || t.status === 'resolved';
    return true;
  });

  // Pagination logic matching wireframe
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const stats = {
    total: tickets.length,
    pending: tickets.filter(t => t.status === 'pending' || t.status === 'new').length,
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'accepted' || t.status === 'assigned').length,
    completed: tickets.filter(t => t.status === 'completed' || t.status === 'resolved').length
  };

  return (
    <DashboardLayout
      onSearch={setSearchQuery}
      onOpenCreateModal={() => setIsModalOpen(true)}
      notifications={notifications}
      notificationCount={notifications.length}
      onClearNotifications={() => setNotifications([])}
      onNotificationClick={(n) => {
        if (n.ticket) setReviewModalTicket(n.ticket);
      }}
    >
      
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Floating Real-time Completion Banner */}
        {completionAlert && (
          <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl text-white shadow-lg shadow-emerald-600/10 flex items-center justify-between gap-3 animate-fadeIn border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center font-bold">
                <Sparkles size={20} className="text-amber-300" />
              </div>
              <div>
                <p className="font-extrabold text-sm">{completionAlert.title}</p>
                <p className="text-xs text-white/90">{completionAlert.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setReviewModalTicket(completionAlert.ticket);
                  setCompletionAlert(null);
                }}
                className="px-4 py-1.5 bg-white text-emerald-800 font-extrabold text-xs rounded-xl shadow-sm hover:bg-emerald-50 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Star size={13} fill="currentColor" className="text-amber-500" />
                Rate Worker
              </button>
              <button
                onClick={() => setCompletionAlert(null)}
                className="p-1.5 text-white/70 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Executive Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-200/90">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Customer Workspace
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Real-time Service Desk</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Support & Bookings Console</h1>
            <p className="text-xs text-slate-500 mt-0.5">Track active complaints, monitor worker progress, and submit ratings</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm cursor-pointer self-start sm:self-auto"
          >
            <PlusCircle size={16} />
            <span>Generate New Ticket</span>
          </button>
        </div>

        {/* 4 Executive Metric Cards (Clickable Filter Controls) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div 
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`glass-card p-4 rounded-2xl cursor-pointer transition-all ${
              statusFilter === 'all' ? 'ring-2 ring-indigo-500/50 bg-indigo-50/20' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Total Requests</span>
              <div className="w-8 h-8 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold">
                <Ticket size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.total}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">All lifetime tickets</span>
          </div>

          <div 
            onClick={() => { setStatusFilter('pending'); setCurrentPage(1); }}
            className={`glass-card p-4 rounded-2xl cursor-pointer transition-all ${
              statusFilter === 'pending' ? 'ring-2 ring-amber-500/50 bg-amber-50/20' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Pending Action</span>
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
                <AlertCircle size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.pending}</p>
            <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Awaiting worker dispatch</span>
          </div>

          <div 
            onClick={() => { setStatusFilter('in-progress'); setCurrentPage(1); }}
            className={`glass-card p-4 rounded-2xl cursor-pointer transition-all ${
              statusFilter === 'in-progress' ? 'ring-2 ring-blue-500/50 bg-blue-50/20' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">In Progress</span>
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.inProgress}</p>
            <span className="text-[10px] text-blue-600 font-semibold mt-1 block">Under active resolution</span>
          </div>

          <div 
            onClick={() => { setStatusFilter('completed'); setCurrentPage(1); }}
            className={`glass-card p-4 rounded-2xl cursor-pointer transition-all ${
              statusFilter === 'completed' ? 'ring-2 ring-emerald-500/50 bg-emerald-50/20' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Resolved</span>
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.completed}</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Completed & verified</span>
          </div>
        </div>

        {/* Modern Tickets Directory Table */}
        <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          <div className="px-6 py-4 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/70">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Service Bookings & Complaints</h3>
              <p className="text-[11px] text-slate-400 font-medium">Click on any ticket to inspect AI summary and details</p>
            </div>

            {/* Status Filter Tab Pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80 self-start sm:self-auto">
              {[
                { id: 'all', label: 'All', count: stats.total },
                { id: 'pending', label: 'Pending', count: stats.pending },
                { id: 'in-progress', label: 'Active', count: stats.inProgress },
                { id: 'completed', label: 'Resolved', count: stats.completed },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => { setStatusFilter(f.id); setCurrentPage(1); }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === f.id
                      ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200/70'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === f.id ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-200/70 text-slate-500'
                  }`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Subject & Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Assigned Worker</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedTickets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-medium space-y-2">
                      <Ticket size={28} className="mx-auto opacity-30 text-slate-400" />
                      <p className="text-sm font-bold text-slate-600">No tickets found in this view</p>
                      <p className="text-xs text-slate-400">Try selecting another filter or click "Generate New Ticket" to create one.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((t) => {
                    const isAppliance = t.category?.toLowerCase().includes('appliance');
                    const isBilling = t.category?.toLowerCase().includes('billing');
                    const isTech = t.category?.toLowerCase().includes('technical');

                    return (
                      <tr key={t._id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="py-3.5 px-4 font-extrabold text-indigo-600">
                          <button
                            onClick={() => handleViewComplaint(t)}
                            className="hover:underline cursor-pointer"
                            title="Click to view details"
                          >
                            {t.ticketNumber}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p 
                            onClick={() => handleViewComplaint(t)}
                            className="font-bold text-slate-900 text-xs truncate hover:text-indigo-600 cursor-pointer"
                          >
                            {t.subject}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.description}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold">
                          <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold border inline-block ${
                            isAppliance 
                              ? 'bg-amber-50 text-amber-700 border-amber-200/80' 
                              : isBilling 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                              : isTech
                              ? 'bg-violet-50 text-violet-700 border-violet-200/80'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {t.category || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {t.assignedWorker?.avatar ? (
                              <img
                                src={t.assignedWorker.avatar}
                                alt="Worker"
                                className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center border border-indigo-100 text-[11px] uppercase shrink-0">
                                {t.assignedWorker?.name ? t.assignedWorker.name.charAt(0) : <User size={12} />}
                              </div>
                            )}
                            <div className="truncate">
                              <p className="font-bold text-slate-800 text-xs truncate">{t.assignedWorker?.name || 'Auto Dispatch'}</p>
                              <p className="text-[10px] text-slate-400 font-medium truncate">{t.assignedWorker?.specialty || t.category || 'Specialist'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={t.status} />
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Direct Message to Assigned Support Agent (Hackathon Demo Step 5) */}
                            {(() => {
                              const workerMsgs = (t.messages || []).filter(m => m.senderRole === 'worker' || (m.sender && String(m.sender) !== String(user?._id)));
                              const unreadFromWorker = Math.max(0, workerMsgs.length - (readMessageCounts[t._id] || 0));

                              return (
                                <button
                                  type="button"
                                  onClick={() => handleOpenChat(t)}
                                  className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all cursor-pointer relative"
                                  title="Message Support Agent"
                                >
                                  <MessageSquare size={13} />
                                  {unreadFromWorker > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center font-extrabold shadow-xs animate-pulse">
                                      {unreadFromWorker}
                                    </span>
                                  )}
                                </button>
                              );
                            })()}

                            {t.status === 'completed' && (
                              t.isRated || t.rating ? (
                                <span className="px-2.5 py-1 bg-amber-50 border border-amber-200 text-amber-700 font-bold rounded-lg text-xs inline-flex items-center gap-1">
                                  <Star size={11} fill="currentColor" /> {t.rating}/5
                                </span>
                              ) : (
                                <button
                                  onClick={() => setReviewModalTicket(t)}
                                  className="px-2.5 py-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold rounded-lg text-xs inline-flex items-center gap-1 shadow-xs transition-all cursor-pointer animate-pulse"
                                >
                                  <Star size={11} fill="currentColor" /> Rate Worker
                                </button>
                              )
                            )}
                            <ActionMenu
                              ticket={t}
                              onViewComplaint={handleViewComplaint}
                              onCancelRequest={handleCancelRequest}
                              userRole="customer"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })
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
        onReviewSubmitted={handleReviewSubmitted}
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

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const t = selectedComplaintModal;
                  setSelectedComplaintModal(null);
                  setChatTicket(t);
                }}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
              >
                <MessageSquare size={14} /> Message Agent
              </button>
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

      {/* Direct Ticket Conversation Modal (Customer <-> Support Agent) */}
      <TicketChatModal
        isOpen={!!chatTicket}
        onClose={() => setChatTicket(null)}
        ticket={chatTicket}
        onTicketUpdated={(updated) => {
          setTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
          if (chatTicket?._id === updated._id) setChatTicket(updated);
        }}
      />

      {/* Floating AI Support Agent Chatbot */}
      <ChatWidget onOpenCreateTicket={() => setIsModalOpen(true)} />

    </DashboardLayout>
  );
}

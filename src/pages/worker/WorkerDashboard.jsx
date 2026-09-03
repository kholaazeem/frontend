import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatusBadge from '../../components/common/StatusBadge';
import ActionMenu from '../../components/common/ActionMenu';
import WorkerNotificationBanner from '../../components/worker/WorkerNotificationBanner';
import TicketChatModal from '../../components/tickets/TicketChatModal';
import AITriageReviewModal from '../../components/worker/AITriageReviewModal';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Wrench, CheckCircle2, Clock, AlertTriangle, Star, Check, X, ShieldAlert, Lock, User, Sparkles, MessageSquare, Bot } from 'lucide-react';
import io from 'socket.io-client';

export default function WorkerDashboard() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [notification, setNotification] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [reviewAlert, setReviewAlert] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaintModal, setSelectedComplaintModal] = useState(null);
  const [resolutionModalTicket, setResolutionModalTicket] = useState(null);
  const [resolutionNoteText, setResolutionNoteText] = useState('');
  const [chatTicket, setChatTicket] = useState(null);
  const [readMessageCounts, setReadMessageCounts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sf_worker_read_msgs') || '{}');
    } catch {
      return {};
    }
  });

  const handleOpenChat = (ticket) => {
    setChatTicket(ticket);
    const customerMsgs = (ticket.messages || []).filter(m => m.senderRole === 'customer' || (m.sender && String(m.sender) !== String(user?._id)));
    setReadMessageCounts(prev => {
      const updated = { ...prev, [ticket._id]: customerMsgs.length };
      try { localStorage.setItem('sf_worker_read_msgs', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };
  const [aiReviewTicket, setAiReviewTicket] = useState(null);
  const seenReviewsRef = useRef({});
  const workerTicketsSnapshotRef = useRef('');

  useEffect(() => {
    fetchWorkerTickets();

    // 4-second auto-poll with change-detection (no screen refresh / re-render if data is same)
    const interval = setInterval(fetchWorkerTickets, 4000);

    // Socket.IO Real-time notification listener
    const socket = io('https://backend-iota-six-56.vercel.app', { transports: ['websocket', 'polling'] });
    
    socket.on('new_booking_notification', (data) => {
      if (!data.assignedWorkerId || String(data.assignedWorkerId) === String(user?._id)) {
        setNotification({
          ticketId: data.ticketId,
          ticketNumber: data.ticketNumber,
          subject: data.subject
        });
      }
      fetchWorkerTickets();
    });

    socket.on('ticket_message_received', () => {
      fetchWorkerTickets();
    });

    socket.on('ticket_ai_reviewed', () => {
      fetchWorkerTickets();
    });

    socket.on('new_review_submitted', (data) => {
      fetchWorkerTickets();
      const notif = {
        title: `⭐ New ${data.rating}-Star Review!`,
        message: `${data.customerName || 'Customer'} rated: "${data.comment || 'Great service!'}"`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setReviewAlert(notif);
    });

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const fetchWorkerTickets = async () => {
    try {
      const res = await API.get('/tickets');
      if (Array.isArray(res.data)) {
        const list = res.data;
        const snap = JSON.stringify(list.map(t => ({ id: t._id, status: t.status, rating: t.rating, urgency: t.urgency })));
        if (snap === workerTicketsSnapshotRef.current) {
          return;
        }
        workerTicketsSnapshotRef.current = snap;
        setTickets(list);

        // Build notifications for worker from current tickets
        const notifs = [];
        list.forEach(t => {
          if (t.rating) {
            notifs.push({
              id: `review_${t._id}`,
              title: `⭐ ${t.rating}-Star Customer Review`,
              message: `Ticket #${t.ticketNumber}: "${t.reviewComment || 'Job completed'}"`,
              time: 'Rated',
              ticket: t
            });

            // If this is a new rating that worker hasn't seen yet in this session:
            if (!seenReviewsRef.current[t._id]) {
              seenReviewsRef.current[t._id] = true;
              setReviewAlert({
                title: `⭐ New ${t.rating}-Star Review Received!`,
                message: `Customer rated ticket #${t.ticketNumber}: "${t.reviewComment || 'Job completed!'}"`
              });
            }
          } else if (t.status === 'pending' || t.status === 'assigned' || t.status === 'new') {
            notifs.push({
              id: `booking_${t._id}`,
              title: `🚨 New Assignment: ${t.ticketNumber}`,
              message: `Customer requested service for "${t.subject}".`,
              time: 'Action Required',
              ticket: t
            });
          }
        });

        setNotifications(notifs);

        // Show top alert banner if worker has any pending/assigned booking
        const pendingBooking = list.find(t => (t.status === 'pending' || t.status === 'assigned' || t.status === 'new'));
        if (pendingBooking) {
          setNotification(prev => prev || {
            ticketId: pendingBooking._id,
            ticketNumber: pendingBooking.ticketNumber,
            subject: pendingBooking.subject
          });
        }
      }
    } catch (err) {
      console.error('Fetch worker tickets error:', err);
    }
  };

  // Miss's Flow: Worker Accept Booking
  const handleAcceptBooking = async (ticketId) => {
    try {
      await API.put(`/tickets/${ticketId}/status`, { status: 'accepted' });
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: 'accepted' } : t));
      setNotification(null);
    } catch (err) {
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: 'accepted' } : t));
      setNotification(null);
    }
  };

  // Miss's Flow: Worker Reject Booking
  const handleRejectBooking = async (ticketId) => {
    if (window.confirm('Reject this booking request?')) {
      try {
        await API.put(`/tickets/${ticketId}/status`, { status: 'rejected' });
        setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: 'rejected' } : t));
        setNotification(null);
      } catch (err) {
        setTickets(tickets.map(t => t._id === ticketId ? { ...t, status: 'rejected' } : t));
        setNotification(null);
      }
    }
  };

  // Miss's Flow: Worker Urgency Level Selector [Low, Medium, High]
  const handleUrgencyChange = async (ticketId, newUrgency) => {
    try {
      await API.put(`/tickets/${ticketId}/status`, { urgency: newUrgency });
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, urgency: newUrgency } : t));
    } catch (err) {
      setTickets(tickets.map(t => t._id === ticketId ? { ...t, urgency: newUrgency } : t));
    }
  };

  // Miss's Flow: Worker Status Updater [Pending, Accepted, In Progress, Completed]
  const handleStatusChange = async (ticket, newStatus) => {
    if (ticket.status === 'completed' || ticket.status === 'rejected') {
      alert('Status locked! Completed or rejected tasks cannot be edited.');
      return;
    }

    if (newStatus === 'completed') {
      setResolutionModalTicket(ticket);
      return;
    }

    try {
      await API.put(`/tickets/${ticket._id}/status`, { status: newStatus });
      setTickets(tickets.map(t => t._id === ticket._id ? { ...t, status: newStatus } : t));
    } catch (err) {
      setTickets(tickets.map(t => t._id === ticket._id ? { ...t, status: newStatus } : t));
    }
  };

  const handleConfirmResolution = async () => {
    if (!resolutionModalTicket) return;
    try {
      await API.put(`/tickets/${resolutionModalTicket._id}/status`, {
        status: 'completed',
        resolutionNote: resolutionNoteText || 'Issue successfully resolved by worker.'
      });
      setTickets(tickets.map(t => t._id === resolutionModalTicket._id ? { ...t, status: 'completed', resolutionNote: resolutionNoteText } : t));
      setResolutionModalTicket(null);
      setResolutionNoteText('');
    } catch (err) {
      setTickets(tickets.map(t => t._id === resolutionModalTicket._id ? { ...t, status: 'completed', resolutionNote: resolutionNoteText } : t));
      setResolutionModalTicket(null);
      setResolutionNoteText('');
    }
  };

  const filteredTickets = tickets.filter(t => 
    t.ticketNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    assigned: tickets.length,
    inProgress: tickets.filter(t => t.status === 'in-progress' || t.status === 'accepted').length,
    completedToday: tickets.filter(t => t.status === 'completed').length,
    rating: 4.9
  };

  const ratedTickets = tickets.filter(t => t.rating);
  const avgRating = ratedTickets.length > 0
    ? (ratedTickets.reduce((acc, t) => acc + t.rating, 0) / ratedTickets.length).toFixed(1)
    : (user?.rating || 5.0);
  const totalReviews = ratedTickets.length > 0 ? ratedTickets.length : (user?.reviewCount || 0);

  return (
    <DashboardLayout
      onSearch={setSearchQuery}
      notifications={notifications}
      notificationCount={notifications.length}
      onClearNotifications={() => setNotifications([])}
    >
      
      <div className="space-y-6 max-w-7xl mx-auto">
        
        {/* Real-time Notification Alert Banner */}
        <WorkerNotificationBanner
          notification={notification}
          onAccept={handleAcceptBooking}
          onReject={handleRejectBooking}
          onClose={() => setNotification(null)}
        />

        {/* Floating Customer Review Alert Banner */}
        {reviewAlert && (
          <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl text-white shadow-xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                <Star size={22} fill="currentColor" />
              </div>
              <div>
                <p className="font-extrabold text-sm">{reviewAlert.title}</p>
                <p className="text-xs text-white/90">{reviewAlert.message}</p>
              </div>
            </div>
            <button
              onClick={() => setReviewAlert(null)}
              className="p-1.5 text-white/70 hover:text-white rounded-lg cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Worker Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-panel p-6 rounded-2xl border border-slate-200/90">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                Specialist Console
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Field Dispatch & Resolution Queue</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Assigned Work Orders & Bookings
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Manage incoming assignments, update task states, and review client feedback</p>
          </div>

          <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50/60 border border-amber-200/80 px-4 py-2.5 rounded-2xl shadow-2xs">
            <div className="w-9 h-9 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold shadow-xs">
              <Star size={16} fill="currentColor" />
            </div>
            <div>
              <span className="text-[10px] text-amber-800 font-bold block uppercase tracking-wider">Performance Rating</span>
              <span className="text-xs font-black text-slate-900">{avgRating} / 5.0 ⭐ <span className="text-slate-400 font-normal">({totalReviews} reviews)</span></span>
            </div>
          </div>
        </div>

        {/* 3 Executive Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Total Assigned</span>
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                <Wrench size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.assigned}</p>
            <span className="text-[10px] text-slate-400 font-medium mt-1 block">Active work orders</span>
          </div>

          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">In Progress</span>
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                <Clock size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.inProgress}</p>
            <span className="text-[10px] text-indigo-600 font-semibold mt-1 block">Under active service</span>
          </div>

          <div className="glass-card p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-semibold">Resolved</span>
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                <CheckCircle2 size={16} />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stats.completedToday}</p>
            <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Completed & signed off</span>
          </div>
        </div>

        {/* WORKER TASK QUEUE TABLE */}
        <div className="glass-panel rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
          
          <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white/70">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Active Job Queue</h3>
              <p className="text-[11px] text-slate-400 font-medium">Update urgency and progress status directly from the queue</p>
            </div>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
              {filteredTickets.length} {filteredTickets.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Subject & AI Diagnosis</th>
                  <th className="py-3 px-4">Urgency</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Customer Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400 font-medium space-y-2">
                      <Wrench size={28} className="mx-auto opacity-30 text-slate-400" />
                      <p className="text-sm font-bold text-slate-600">No assigned work orders right now</p>
                      <p className="text-xs text-slate-400">New customer bookings assigned to you will appear here instantly.</p>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => {
                    const isLocked = t.status === 'completed' || t.status === 'rejected';

                    return (
                      <tr key={t._id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-3.5 px-4 font-extrabold text-blue-600">{t.ticketNumber}</td>
                        
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            {t.customer?.avatar ? (
                              <img
                                src={t.customer.avatar}
                                alt="Customer"
                                className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-600 font-bold flex items-center justify-center border border-slate-200 text-xs uppercase shrink-0">
                                {t.customer?.name ? t.customer.name.charAt(0) : <User size={12} />}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-800">{t.customer?.name || 'Customer'}</p>
                              <p className="text-[10px] text-slate-400 font-semibold">{t.customer?.email}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-bold text-slate-800 text-sm truncate">{t.subject}</p>
                        {/* Human Review & Edit AI Triage Button (Hackathon Demo Step 3) */}
                        <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => setAiReviewTicket(t)}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                              t.aiTriage?.isReviewedByAgent || t.aiTriage?.isReviewedByWorker
                                ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 animate-pulse'
                            }`}
                            title="Click to review and edit AI suggestions"
                          >
                            <Sparkles size={11} />
                            <span>
                              {t.aiTriage?.isReviewedByAgent || t.aiTriage?.isReviewedByWorker
                                ? `AI: ${t.category} (Reviewed)`
                                : `Review AI: ${t.category || t.aiTriage?.predictedCategory || 'General'}`}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Urgency Selector Dropdown [Low, Medium, High] */}
                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            t.urgency === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {t.urgency || 'Medium'}
                          </span>
                        ) : (
                          <select
                            value={t.urgency || 'Medium'}
                            onChange={(e) => handleUrgencyChange(t._id, e.target.value)}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          >
                            <option value="Low">🟢 Low</option>
                            <option value="Medium">🟡 Medium</option>
                            <option value="High">🔴 High</option>
                          </select>
                        )}
                      </td>

                      {/* Status Selector Dropdown [New, Assigned, In Progress, Resolved, Rejected] */}
                      <td className="py-3.5 px-4">
                        {isLocked ? (
                          <div className="flex items-center gap-1">
                            <StatusBadge status={t.status} />
                            <Lock size={12} className="text-slate-400" title="Status locked" />
                          </div>
                        ) : (
                          <select
                            value={t.status === 'completed' ? 'resolved' : t.status === 'accepted' ? 'assigned' : t.status === 'pending' ? 'new' : t.status}
                            onChange={(e) => handleStatusChange(t, e.target.value)}
                            className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                          >
                            <option value="new">New</option>
                            <option value="assigned">Assigned</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Resolved ✅</option>
                            <option value="rejected">Rejected ❌</option>
                          </select>
                        )}
                      </td>

                      {/* Customer Rating & Review */}
                      <td className="py-3.5 px-4">
                        {t.rating ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                              <Star size={11} fill="currentColor" /> {t.rating} / 5
                            </span>
                            {t.reviewComment && (
                              <p className="text-[10px] text-slate-500 italic truncate max-w-[150px]" title={t.reviewComment}>
                                "{t.reviewComment}"
                              </p>
                            )}
                          </div>
                        ) : t.status === 'completed' || t.status === 'resolved' ? (
                          <span className="text-[11px] text-slate-400 font-medium">Awaiting review</span>
                        ) : (
                          <span className="text-[11px] text-slate-300">—</span>
                        )}
                      </td>

                      {/* Actions: Accept/Reject, Direct Chat, or View Details */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Direct Ticket Conversation / Reply Button (Hackathon Demo Step 5) */}
                          {(() => {
                            const customerMsgs = (t.messages || []).filter(m => m.senderRole === 'customer' || (m.sender && String(m.sender) !== String(user?._id)));
                            const unreadFromCustomer = Math.max(0, customerMsgs.length - (readMessageCounts[t._id] || 0));

                            return (
                              <button
                                type="button"
                                onClick={() => handleOpenChat(t)}
                                className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-all cursor-pointer relative"
                                title="Direct Conversation with Customer"
                              >
                                <MessageSquare size={14} />
                                {unreadFromCustomer > 0 && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center font-extrabold shadow-xs animate-pulse">
                                    {unreadFromCustomer}
                                  </span>
                                )}
                              </button>
                            );
                          })()}

                          {t.status === 'pending' || t.status === 'new' || t.status === 'assigned' ? (
                            <>
                              <button
                                onClick={() => handleAcceptBooking(t._id)}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-xs flex items-center gap-1"
                              >
                                <Check size={12} /> Accept
                              </button>
                              <button
                                onClick={() => handleRejectBooking(t._id)}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <X size={12} /> Reject
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => setSelectedComplaintModal(t)}
                              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </td>

                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </div>

        </div>

      </div>

      {/* Resolution Note Modal (Enforcing rule: cannot resolve without resolution note) */}
      {resolutionModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
              <CheckCircle2 className="text-emerald-600" /> Resolve Ticket & Enter Resolution Note
            </h3>
            <p className="text-xs text-slate-500">
              Ticket <span className="font-bold text-blue-600">{resolutionModalTicket.ticketNumber}</span> will be marked as Resolved. A resolution note is required before completing.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Resolution Note (Required):</label>
              <textarea
                rows={3}
                value={resolutionNoteText}
                onChange={(e) => setResolutionNoteText(e.target.value)}
                placeholder="Enter details of how you resolved the issue (e.g., Refund of $45 processed, parts replaced)..."
                required
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              {!resolutionNoteText.trim() && (
                <p className="text-[11px] text-amber-600 font-medium">* Please enter a resolution note to resolve the ticket</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setResolutionModalTicket(null);
                  setResolutionNoteText('');
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmResolution}
                disabled={!resolutionNoteText.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl cursor-pointer shadow-md"
              >
                Confirm Resolution ✅
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedComplaintModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-extrabold text-blue-600">{selectedComplaintModal.ticketNumber}</span>
                <h3 className="font-bold text-slate-800 text-sm">{selectedComplaintModal.subject}</h3>
              </div>
              <StatusBadge status={selectedComplaintModal.status} />
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-500 uppercase block">Customer Description:</span>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium">
                {selectedComplaintModal.description}
              </p>
            </div>

            {selectedComplaintModal.resolutionNote && (
              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 space-y-1 text-xs">
                <span className="font-bold text-emerald-800">✅ Resolution Note:</span>
                <p className="text-emerald-700 font-medium">{selectedComplaintModal.resolutionNote}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const t = selectedComplaintModal;
                  setSelectedComplaintModal(null);
                  setChatTicket(t);
                }}
                className="px-3 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-blue-100 transition-colors"
              >
                <MessageSquare size={14} /> Chat with Customer
              </button>
              <button
                onClick={() => setSelectedComplaintModal(null)}
                className="px-4 py-2 btn-primary rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close
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

      {/* Human AI Triage Review & Edit Modal (Agent reviews & edits AI suggestions) */}
      <AITriageReviewModal
        isOpen={!!aiReviewTicket}
        onClose={() => setAiReviewTicket(null)}
        ticket={aiReviewTicket}
        onReviewSaved={(updated) => {
          setTickets(prev => prev.map(t => t._id === updated._id ? updated : t));
          fetchWorkerTickets();
        }}
      />

    </DashboardLayout>
  );
}

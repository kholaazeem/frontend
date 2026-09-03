import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, User, Bot, Clock, Sparkles } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';

export default function TicketChatModal({ isOpen, onClose, ticket, onTicketUpdated }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (ticket) {
      setMessages(ticket.messages || []);
    }
  }, [ticket]);

  useEffect(() => {
    if (!isOpen || !ticket) return;

    // Connect socket for real-time ticket conversation updates
    const socket = io('https://backend-iota-six-56.vercel.app', { transports: ['polling'] });

    socket.on('ticket_message_received', (data) => {
      if (data.ticketId === ticket._id || data.ticketId === ticket.id) {
        if (data.ticket && data.ticket.messages) {
          setMessages(data.ticket.messages);
          if (onTicketUpdated) onTicketUpdated(data.ticket);
        } else if (data.message) {
          setMessages(prev => {
            // Avoid duplicate message by checking timestamp/text
            const exists = prev.some(m => m.text === data.message.text && Math.abs(new Date(m.createdAt) - new Date(data.message.createdAt)) < 2000);
            return exists ? prev : [...prev, data.message];
          });
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [isOpen, ticket, onTicketUpdated]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen || !ticket) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);
    setErrorMsg('');

    // Optimistic message update
    const optimisticMsg = {
      sender: user?._id,
      senderRole: user?.role || 'customer',
      senderName: user?.name || 'You',
      text: textToSend,
      createdAt: new Date()
    };
    setMessages(prev => [...prev, optimisticMsg]);

    try {
      const res = await API.post(`/tickets/${ticket._id}/messages`, { text: textToSend });
      if (res.data) {
        if (res.data.messages) {
          setMessages(res.data.messages);
        }
        if (onTicketUpdated) {
          onTicketUpdated(res.data);
        }
      }
    } catch (err) {
      console.error('Send message error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const isCustomer = user?.role === 'customer';
  const otherPartyName = isCustomer
    ? (ticket.assignedWorker?.name || 'Support Agent')
    : (ticket.customer?.name || 'Customer');
  const otherPartyRole = isCustomer ? 'Support Agent' : 'Customer';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel p-0 rounded-3xl max-w-xl w-full h-[620px] max-h-[92vh] flex flex-col shadow-2xl border border-white/90 overflow-hidden bg-white/95">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-white/90 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <MessageSquare size={20} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-600 text-xs">{ticket.ticketNumber}</span>
                <StatusBadge status={ticket.status} />
              </div>
              <h3 className="font-bold text-slate-800 text-sm truncate mt-0.5" title={ticket.subject}>
                {ticket.subject}
              </h3>
              <p className="text-[11px] text-slate-400 truncate">
                Chatting with <span className="font-semibold text-slate-700">{otherPartyName}</span> ({otherPartyRole})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        {/* AI Triage Banner in Chat if present */}
        {ticket.aiTriage?.aiSummary && (
          <div className="px-4 py-2.5 bg-blue-50/70 border-b border-blue-100 flex items-center gap-2 text-xs text-slate-600">
            <Sparkles size={14} className="text-blue-600 shrink-0" />
            <div className="truncate">
              <span className="font-bold text-blue-700">AI Summary: </span>
              <span>{ticket.aiTriage.aiSummary}</span>
            </div>
          </div>
        )}

        {/* Message Thread Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/50">
          {/* Initial Ticket Description Card */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-bold text-slate-700">Original Complaint Details</span>
              <span>{ticket.createdAt ? new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{ticket.description}</p>
          </div>

          <div className="flex items-center my-3">
            <div className="flex-1 border-t border-slate-200"></div>
            <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Direct Conversation History
            </span>
            <div className="flex-1 border-t border-slate-200"></div>
          </div>

          {messages.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs space-y-2">
              <MessageSquare size={32} className="mx-auto opacity-30 text-slate-400" />
              <p className="font-bold text-slate-600 text-sm">No messages yet in this ticket</p>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {isCustomer 
                  ? 'Send a question or update to your assigned support agent below.' 
                  : 'Send a reply or status update to the customer below.'}
              </p>
            </div>
          ) : (
            messages.map((m, idx) => {
              const isMe = m.sender === user?._id || m.senderRole === user?.role;
              const timeStr = m.createdAt 
                ? new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                : 'Just now';

              return (
                <div
                  key={m._id || idx}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-bold text-slate-700">
                      {isMe ? 'You' : m.senderName || otherPartyName}
                    </span>
                    <span className="text-[10px] capitalize px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                      {m.senderRole === 'worker' ? 'Support Agent' : m.senderRole || 'Customer'}
                    </span>
                    <span>•</span>
                    <span className="text-[10px]">{timeStr}</span>
                  </div>

                  <div
                    className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed shadow-2xs ${
                      isMe
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs'
                        : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="px-4 py-1.5 bg-red-50 text-red-600 text-xs font-semibold border-t border-red-200 text-center">
            {errorMsg}
          </div>
        )}

        {/* Message Input Footer */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Reply to ${otherPartyName}...`}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{sending ? 'Sending...' : 'Send'}</span>
            <Send size={14} />
          </button>
        </form>

      </div>
    </div>
  );
}

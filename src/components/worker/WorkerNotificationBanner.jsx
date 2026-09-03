import React, { useState } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, ArrowRight } from 'lucide-react';

export default function WorkerNotificationBanner({ notification, onAccept, onReject, onClose }) {
  if (!notification) return null;

  return (
    <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-4 rounded-3xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300 border border-white/20">
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white shrink-0 animate-bounce">
          <Bell size={20} />
        </div>
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-200 bg-white/10 px-2 py-0.5 rounded-full">
            ⚡ Real-time Booking Alert
          </span>
          <h4 className="font-extrabold text-sm text-white mt-0.5">
            New Booking Request: <span className="underline">{notification.ticketNumber}</span>
          </h4>
          <p className="text-xs text-blue-100 line-clamp-1">{notification.subject}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
        <button
          onClick={() => onReject(notification.ticketId)}
          className="flex-1 sm:flex-initial px-3.5 py-2 sm:py-1.5 bg-white/10 hover:bg-red-500 text-white text-xs font-semibold rounded-xl border border-white/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <XCircle size={14} /> Reject
        </button>
        <button
          onClick={() => onAccept(notification.ticketId)}
          className="flex-1 sm:flex-initial px-4 py-2 sm:py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-1 cursor-pointer"
        >
          <CheckCircle2 size={14} /> Accept Booking
        </button>
      </div>

    </div>
  );
}

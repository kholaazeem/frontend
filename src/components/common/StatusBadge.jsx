import React from 'react';
import { Clock, CheckCircle2, AlertCircle, XCircle, ArrowRightCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const normalized = status ? status.toLowerCase() : 'pending';

  switch (normalized) {
    case 'completed':
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200/80 shadow-2xs">
          <CheckCircle2 size={13} /> Completed
        </span>
      );
    case 'in progress':
    case 'in-progress':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200/80 shadow-2xs">
          <ArrowRightCircle size={13} className="animate-spin" /> In Progress
        </span>
      );
    case 'accepted':
    case 'assigned':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-200/80 shadow-2xs">
          <Clock size={13} /> Accepted
        </span>
      );
    case 'rejected':
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200/80 shadow-2xs">
          <XCircle size={13} /> Rejected
        </span>
      );
    default: // pending / new
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200/80 shadow-2xs">
          <AlertCircle size={13} /> Pending
        </span>
      );
  }
}

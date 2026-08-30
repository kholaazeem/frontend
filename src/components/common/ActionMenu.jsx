import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Eye, RefreshCw, XCircle, ChevronRight } from 'lucide-react';

export default function ActionMenu({ ticket, onViewComplaint, onUpdateStatus, onCancelRequest, userRole }) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isFinalized = ticket?.status === 'completed' || ticket?.status === 'rejected';

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2.5 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
      >
        <span>User Actions</span>
        <ChevronRight size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 glass-panel rounded-2xl shadow-xl border border-slate-200/90 py-1.5 z-40 animate-in fade-in duration-150">
          
          {/* Action 1: View Complaint */}
          <button
            onClick={() => {
              setIsOpen(false);
              if (onViewComplaint) onViewComplaint(ticket);
            }}
            className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} className="text-blue-600" />
            <span>View Complaint</span>
          </button>

          {/* Action 2: Update Status (Worker/Admin or when unlocked) */}
          {!isFinalized && (
            <button
              onClick={() => {
                setIsOpen(false);
                if (onUpdateStatus) onUpdateStatus(ticket);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} className="text-indigo-600" />
              <span>Update Status</span>
            </button>
          )}

          {/* Action 3: Cancel Request */}
          {!isFinalized && (
            <button
              onClick={() => {
                setIsOpen(false);
                if (onCancelRequest) onCancelRequest(ticket);
              }}
              className="w-full text-left px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors cursor-pointer"
            >
              <XCircle size={14} className="text-red-500" />
              <span>Cancel Request</span>
            </button>
          )}

          {isFinalized && (
            <div className="px-3.5 py-1.5 text-[10px] text-slate-400 font-semibold italic border-t border-slate-100">
              Status locked ({ticket.status})
            </div>
          )}

        </div>
      )}
    </div>
  );
}

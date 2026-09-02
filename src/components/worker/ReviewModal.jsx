import React, { useState } from 'react';
import { Star, X, CheckCircle2, Heart } from 'lucide-react';
import API from '../../services/api';

export default function ReviewModal({ isOpen, onClose, ticket, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const workerId = ticket.assignedWorker?._id || (typeof ticket.assignedWorker === 'string' ? ticket.assignedWorker : null);
      await API.post('/reviews', {
        ticketId: ticket._id,
        workerId: workerId || 'worker_default',
        rating,
        comment
      });
      setSubmitting(false);
      onClose();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setSubmitting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel p-6 rounded-3xl max-w-md w-full shadow-2xl space-y-5 border border-white/90">
        
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm">Task Completed! Rate Worker</h3>
              <p className="text-xs text-slate-500">Miss's Requirement: 5-Star Rating System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-center">
          
          {/* Worker Info */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-center gap-3">
            {ticket.assignedWorker?.avatar ? (
              <img
                src={ticket.assignedWorker.avatar}
                alt="Worker"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-sm uppercase shrink-0">
                {ticket.assignedWorker?.name ? ticket.assignedWorker.name.charAt(0) : 'W'}
              </div>
            )}
            <div className="text-left">
              <h4 className="font-bold text-slate-800 text-sm">{ticket.assignedWorker?.name || 'Assigned Worker'}</h4>
              <p className="text-xs text-blue-600 font-semibold">{ticket.assignedWorker?.specialty || 'Specialist'}</p>
            </div>
          </div>

          {/* 5-Star Interactive Rating Selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 block">How satisfied are you with the service?</label>
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(rating)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                >
                  <Star
                    size={32}
                    fill={(hoverRating || rating) >= star ? 'currentColor' : 'none'}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
            <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              {rating === 5 ? '⭐⭐⭐⭐⭐ Excellent (5/5)' : `${rating} Stars Selected`}
            </span>
          </div>

          {/* Feedback Comment */}
          <div className="space-y-1 text-left">
            <label className="text-xs font-semibold text-slate-700">Optional Review / Comment</label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Excellent service! Arrived quickly and resolved the issue efficiently."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 btn-primary rounded-xl font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            <Heart size={14} className="fill-white" />
            {submitting ? 'Submitting Review...' : 'Submit 5-Star Rating & Review'}
          </button>

        </form>

      </div>
    </div>
  );
}

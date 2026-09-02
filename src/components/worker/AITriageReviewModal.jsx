import React, { useState, useEffect } from 'react';
import { X, Bot, Sparkles, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import API from '../../services/api';

export default function AITriageReviewModal({ isOpen, onClose, ticket, onReviewSaved }) {
  const [category, setCategory] = useState('General');
  const [urgency, setUrgency] = useState('Medium');
  const [aiSummary, setAiSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (ticket) {
      setCategory(ticket.category || ticket.aiTriage?.predictedCategory || 'General');
      setUrgency(ticket.urgency || ticket.aiTriage?.suggestedUrgency || 'Medium');
      setAiSummary(ticket.aiTriage?.aiSummary || ticket.description || '');
      setErrorMsg('');
    }
  }, [ticket, isOpen]);

  if (!isOpen || !ticket) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await API.put(`/tickets/${ticket._id}/ai-review`, {
        category,
        urgency,
        aiSummary
      });

      if (onReviewSaved) {
        onReviewSaved(res.data);
      }
      onClose();
    } catch (err) {
      console.error('Save AI triage review error:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save AI review');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn">
      <div className="glass-panel p-6 rounded-3xl max-w-lg w-full shadow-2xl border border-white/90 space-y-5 bg-white/95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
              <Bot size={22} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                Review & Edit AI Suggestions <Sparkles size={15} className="text-purple-600 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500">Human-in-the-loop review before finalizing triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 text-red-600 text-xs font-semibold rounded-xl border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Original Complaint Context */}
        <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-bold text-slate-700">{ticket.ticketNumber} — {ticket.subject}</span>
            <span className="capitalize">{ticket.customer?.name || 'Customer'}</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed italic">"{ticket.description}"</p>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          
          {/* Category Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Category (AI Suggested)</span>
              <span className="text-[10px] text-purple-600 font-semibold">Editable</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            >
              <option value="Billing">💳 Billing & Refunds</option>
              <option value="Technical">💻 Technical & Server</option>
              <option value="Account">🔐 Account Security</option>
              <option value="Appliance">🛠️ Appliance Maintenance</option>
              <option value="General">📋 General Support</option>
            </select>
          </div>

          {/* Priority / Urgency Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Priority / Urgency (AI Suggested)</span>
              <span className="text-[10px] text-purple-600 font-semibold">Editable</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Low', 'Medium', 'High'].map((lvl) => {
                const isSelected = urgency === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setUrgency(lvl)}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isSelected
                        ? lvl === 'High'
                          ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20'
                          : lvl === 'Medium'
                          ? 'bg-amber-50 text-amber-700 border-amber-300 ring-2 ring-amber-500/20'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {lvl === 'High' ? '🔴 High' : lvl === 'Medium' ? '🟡 Medium' : '🟢 Low'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Short Summary Textarea */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>AI Resolution Summary</span>
              <span className="text-[10px] text-purple-600 font-semibold">Editable</span>
            </label>
            <textarea
              rows={3}
              value={aiSummary}
              onChange={(e) => setAiSummary(e.target.value)}
              placeholder="Edit the short summary before saving..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500/30"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary px-5 py-2 text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              <span>{saving ? 'Saving...' : 'Save & Finalize AI Triage'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

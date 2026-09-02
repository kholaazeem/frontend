import React, { useState, useEffect } from 'react';
import { X, Bot, Sparkles, UserCheck, Star, ArrowRight, CheckCircle } from 'lucide-react';
import AITriageCard from '../ai/AITriageCard';
import API from '../../services/api';

export default function CreateTicketModal({ isOpen, onClose, onTicketCreated }) {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [aiData, setAiData] = useState(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Debounced AI Triage Trigger as customer types description
  useEffect(() => {
    if (!description || description.trim().length < 5) {
      setAiData(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoadingAI(true);
      try {
        const res = await API.post('/tickets/triage-preview', { subject, description });
        setAiData(res.data);
        if (res.data.suggestedWorkers && res.data.suggestedWorkers.length > 0) {
          setSelectedWorkerId(res.data.suggestedWorkers[0]._id);
        }
      } catch (err) {
        console.error('Triage preview error:', err);
      } finally {
        setLoadingAI(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [subject, description]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);
    try {
      const payload = {
        subject,
        description,
        category: aiData?.predictedCategory || 'General',
        urgency: aiData?.suggestedUrgency || 'Medium',
        assignedWorkerId: selectedWorkerId,
        aiTriage: aiData
      };

      const res = await API.post('/tickets', payload);
      setSubmitting(false);
      onClose();
      if (onTicketCreated) onTicketCreated(res.data);
    } catch (err) {
      setSubmitting(false);
      setErrorMsg(err.response?.data?.message || 'Failed to generate ticket');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel p-6 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/90 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-xs">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-1.5">
                Generate Ticket & Book Worker <Sparkles size={16} className="text-blue-600 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-500">Miss's Workflow: Enter complaint ➔ AI Predicts Category ➔ Select Worker</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {errorMsg && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-semibold border border-red-200">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Step 1: Complaint Form */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Complaint Title / Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. AC leaking water in living room"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Detailed Issue Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what happened... (AI will automatically analyze category and urgency as you type)"
              required
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Step 2: AI Triage Live Preview Card */}
          <AITriageCard aiData={aiData} loading={loadingAI} />

          {/* Step 3: Suggested Worker Selection Grid (Miss's exact requirement!) */}
          {aiData?.suggestedWorkers && aiData.suggestedWorkers.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200/80">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck size={16} className="text-blue-600" />
                Select Suggested Worker for Booking:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {aiData.suggestedWorkers.map((worker) => {
                  const isSelected = selectedWorkerId === worker._id;
                  return (
                    <div
                      key={worker._id}
                      onClick={() => setSelectedWorkerId(worker._id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                          : 'bg-white/80 border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {worker.avatar ? (
                          <img
                            src={worker.avatar}
                            alt={worker.name}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center border border-slate-200 text-xs uppercase shrink-0">
                            {worker.name ? worker.name.charAt(0) : <UserCheck size={14} />}
                          </div>
                        )}
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-800 truncate">{worker.name}</p>
                          <p className="text-[10px] text-blue-600 font-semibold">{worker.specialty || 'Worker'}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                        <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                          <Star size={12} fill="currentColor" /> {worker.rating || 5.0}
                        </span>
                        {isSelected ? (
                          <span className="text-blue-600 font-bold flex items-center gap-0.5">
                            <CheckCircle size={12} /> Selected
                          </span>
                        ) : (
                          <span className="text-slate-400 font-medium">Click to select</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit Action Button */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer shadow-md"
            >
              {submitting ? 'Generating Booking...' : 'Confirm Booking & Create Ticket'}
              <ArrowRight size={16} />
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}

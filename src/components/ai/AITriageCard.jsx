import React, { useEffect, useRef } from 'react';
import { Bot, Sparkles, Zap, ShieldCheck, AlertTriangle } from 'lucide-react';
import gsap from 'gsap';

export default function AITriageCard({ aiData, loading }) {
  const cardRef = useRef(null);
  const robotRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { scale: 0.95, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' }
      );
    }

    if (robotRef.current) {
      gsap.to(robotRef.current, {
        y: -3,
        duration: 1.5,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }, [aiData]);

  if (!aiData) return null;

  return (
    <div ref={cardRef} className="glass-card p-5 rounded-2xl border border-blue-200/90 bg-gradient-to-r from-blue-50/70 via-white to-cyan-50/70 shadow-md relative overflow-hidden space-y-3">
      
      {/* Top Title & AI Engine Badge */}
      <div className="flex items-center justify-between border-b border-blue-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div ref={robotRef} className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm robot-glow">
            <Bot size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1">
              AI Triage Engine <Sparkles size={12} className="text-blue-600 animate-pulse" />
            </h4>
            <p className="text-[10px] text-slate-500">Real-time complaint analysis</p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 shadow-2xs">
          <Sparkles size={11} className="text-blue-600" />
          Smart AI Analysis
        </span>
      </div>

      {/* Suggested Category & Urgency Badges */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Predicted Category</span>
          <span className="font-extrabold text-blue-700 text-sm flex items-center gap-1">
            🏷️ {aiData.predictedCategory || 'General'}
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">Suggested Urgency</span>
          <span className={`font-extrabold text-sm flex items-center gap-1 ${
            aiData.suggestedUrgency === 'High' ? 'text-red-600' : aiData.suggestedUrgency === 'Medium' ? 'text-amber-600' : 'text-emerald-600'
          }`}>
            ⚡ {aiData.suggestedUrgency || 'Medium'} Priority
          </span>
        </div>
      </div>

      {/* AI Summary Text */}
      <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 space-y-1">
        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">AI Summary</span>
        <p className="text-xs text-slate-700 font-medium leading-relaxed">
          {loading ? 'AI analyzing complaint details...' : aiData.aiSummary}
        </p>
      </div>

    </div>
  );
}

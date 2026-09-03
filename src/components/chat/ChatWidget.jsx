import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, Minimize2, ChevronDown } from 'lucide-react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ChatWidget({ onOpenCreateTicket }) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.name ? user.name.split(' ')[0] : 'there'}! 👋 I am your SupportFlow AI Agent. How can I help you today? Ask me about booking a worker, ticket status, or technical/billing questions.`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickQuestions = [
    'How do I book a worker?',
    'Check my ticket status',
    'AC or Appliance repair problem',
    'Billing or refund inquiry'
  ];

  const handleSend = async (textToSend) => {
    const text = textToSend || inputValue;
    if (!text || text.trim().length === 0 || loading) return;

    const userMsg = {
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setLoading(true);

    try {
      const res = await API.post('/tickets/chat', { message: text });
      const botReply = res.data?.reply || "I'm here to help! You can book a specialized technician by clicking 'Generate Ticket' above.";
      
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      // Intelligent local fallback if backend is unreachable
      let fallbackReply = "I understand your inquiry! You can submit a support ticket using '+ Generate Ticket' at the top of your dashboard to connect with our specialist team.";
      const lower = text.toLowerCase();
      if (lower.includes('status') || lower.includes('ticket')) {
        fallbackReply = "You can view all your active tickets and their live status in the dashboard table. Once completed, a rating modal will automatically pop up!";
      } else if (lower.includes('book') || lower.includes('worker')) {
        fallbackReply = "To book a worker, click '+ Generate Ticket' at the top right. You can select any registered worker and our AI will automatically triage the issue.";
      }

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: fallbackReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50">
      
      {/* Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-102 transition-all duration-200 cursor-pointer border border-slate-700/60"
        >
          <div className="relative">
            <Bot size={18} className="text-indigo-400" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 border border-slate-900 rounded-full animate-pulse"></span>
          </div>
          <span className="font-bold text-xs pr-0.5">AI Copilot</span>
          <span className="text-[10px] bg-indigo-500/30 text-indigo-200 font-bold px-1.5 py-0.5 rounded-full border border-indigo-400/30">Live</span>
        </button>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] max-w-sm sm:w-96 h-[500px] max-h-[85vh] bg-white rounded-2xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.2)] border border-slate-200/90 flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-blue-500 rounded-xl flex items-center justify-center font-bold text-white shadow-2xs">
                <Bot size={16} />
              </div>
              <div>
                <h4 className="font-extrabold text-xs leading-tight flex items-center gap-1.5">
                  SupportFlow AI Copilot
                </h4>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                  <span>Instant Assistance</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-slate-400 hover:text-white"
                title="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {messages.map((m, idx) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={idx}
                  className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                      <Bot size={14} />
                    </div>
                  )}
                  
                  <div className={`max-w-[80%] space-y-1 ${isBot ? 'items-start' : 'items-end'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs leading-relaxed ${
                        isBot
                          ? 'bg-white border border-slate-200/80 text-slate-700 shadow-xs rounded-tl-xs'
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs rounded-tr-xs'
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[10px] text-slate-400 block px-1">
                      {m.time}
                    </span>
                  </div>

                  {!isBot && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-1">
                      <User size={14} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-1">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Bot size={14} />
                </div>
                <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-2 rounded-2xl shadow-xs">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  <span className="text-[11px] text-slate-500 font-medium ml-1">AI Agent thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Suggestions */}
          <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200/60 overflow-x-auto flex gap-1.5 scrollbar-none">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                disabled={loading}
                className="whitespace-nowrap text-[10px] font-semibold px-2.5 py-1 bg-white hover:bg-blue-50 hover:text-blue-600 border border-slate-200 rounded-full text-slate-600 transition-colors shrink-0 cursor-pointer shadow-2xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything or describe issue..."
              disabled={loading}
              className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/40 text-slate-700"
            />
            <button
              type="submit"
              disabled={loading || !inputValue.trim()}
              className="p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white rounded-xl transition-all cursor-pointer shadow-sm"
              title="Send message"
            >
              <Send size={15} />
            </button>
          </form>

        </div>
      )}

    </div>
  );
}

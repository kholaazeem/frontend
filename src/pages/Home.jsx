import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Wrench, Clock, Star, Bell, MessageSquare, ArrowRight, Zap, Shield, Headphones, ChevronRight, Sparkles, CheckCircle2, Ticket, Menu, X, Sun, Moon } from 'lucide-react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';

export default function Home() {
  const { theme, toggleTheme, isDark } = useTheme();
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorHaloRef = useRef(null);
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);
  const [uptimeVal, setUptimeVal] = useState(0);
  const [ratingVal, setRatingVal] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      if (cursorRef.current) cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      if (cursorHaloRef.current) gsap.to(cursorHaloRef.current, { x: clientX, y: clientY, duration: 0.2, ease: "power2.out" });
    };
    const container = containerRef.current;
    if (container) container.addEventListener('mousemove', handleMouseMove);
    const tl = gsap.timeline();
    tl.fromTo('.hero-anim', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "power3.out" });
    gsap.to('.fl-1', { y: -18, duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to('.fl-2', { y: 22, duration: 2.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.4 });
    gsap.to('.fl-3', { y: -14, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.8 });
    gsap.to('.robot-float', { y: -12, duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to('.hero-blob', { scale: 1.08, opacity: 0.7, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut" });
    return () => { if (container) container.removeEventListener('mousemove', handleMouseMove); };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsAnimated) {
        setStatsAnimated(true);
        gsap.to({ v: 0 }, { v: 500, duration: 2, ease: "power2.out", onUpdate: function() { setTicketCount(Math.floor(this.targets()[0].v)); } });
        gsap.to({ v: 0 }, { v: 99.9, duration: 2, ease: "power2.out", onUpdate: function() { setUptimeVal(Number(this.targets()[0].v.toFixed(1))); } });
        gsap.to({ v: 0 }, { v: 4.9, duration: 2, ease: "power2.out", onUpdate: function() { setRatingVal(Number(this.targets()[0].v.toFixed(1))); } });
      }
    }, { threshold: 0.4 });
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, [statsAnimated]);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const features = [
    { title: "AI Ticket Triage", desc: "Automatically categorize and prioritize every complaint using smart AI analysis.", icon: Bot, color: "bg-blue-50 text-blue-600" },
    { title: "Worker Dispatch", desc: "Assign field technicians to on-site jobs with a single click.", icon: Wrench, color: "bg-indigo-50 text-indigo-600" },
    { title: "Real-Time Tracking", desc: "Monitor ticket progress and worker status with live updates.", icon: Clock, color: "bg-sky-50 text-sky-600" },
    { title: "5-Star Ratings", desc: "Collect customer feedback with auto-popup rating modals.", icon: Star, color: "bg-amber-50 text-amber-600" },
    { title: "Smart Notifications", desc: "Instant alerts for task completions, new bookings, and reviews.", icon: Bell, color: "bg-rose-50 text-rose-600" },
    { title: "AI Copilot Chat", desc: "Built-in conversational AI assistant for instant customer help.", icon: MessageSquare, color: "bg-emerald-50 text-emerald-600" },
  ];

  return (
    <div ref={containerRef} className="relative min-h-screen bg-white text-slate-900 overflow-x-hidden md:cursor-none">
      {/* Custom Cursor (Desktops only, hidden on touch screens) */}
      <div ref={cursorHaloRef} className="hidden md:block fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2" style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)' }} />
      <div ref={cursorRef} className="hidden md:block fixed top-0 left-0 w-4 h-4 bg-blue-500 rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2" style={{ boxShadow: '0 0 20px rgba(59,130,246,0.7), 0 0 40px rgba(59,130,246,0.3)' }} />

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-shadow">
                <Bot size={20} />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-slate-900">Support<span className="text-blue-600">Flow</span></span>
            </Link>
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">{link.label}</a>
              ))}
            </div>
            <div className="hidden md:flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 hover:bg-slate-50 transition-all cursor-pointer shadow-xs flex items-center justify-center"
              >
                {isDark ? <Sun size={17} className="text-amber-400 animate-pulse" /> : <Moon size={17} className="text-indigo-600" />}
              </button>
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-4 py-2">Try Free Trial</Link>
              <Link to="/register" className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/25 flex items-center gap-1.5">Contact Us<ChevronRight size={14} /></Link>
            </div>
            <div className="md:hidden flex items-center gap-2">
              <button
                type="button"
                onClick={toggleTheme}
                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-indigo-600 transition-all cursor-pointer"
              >
                {isDark ? <Sun size={18} className="text-amber-400 animate-pulse" /> : <Moon size={18} className="text-indigo-600" />}
              </button>
              <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 text-slate-600 cursor-pointer">{mobileMenu ? <X size={22} /> : <Menu size={22} />}</button>
            </div>
          </div>
        </div>
        {mobileMenu && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-4 space-y-3">
            {navLinks.map(link => (<a key={link.label} href={link.href} className="block text-sm font-medium text-slate-600 py-1.5">{link.label}</a>))}
            <div className="pt-2 space-y-2">
              <Link to="/login" className="block text-center text-sm font-semibold text-blue-600 py-2">Sign In</Link>
              <Link to="/register" className="block text-center text-sm font-semibold text-white bg-blue-600 py-2.5 rounded-xl">Get Started</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/80 via-blue-50/40 to-white pointer-events-none" />
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-blue-200/30 rounded-full blur-[120px] hero-blob pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-[85vh] py-16 lg:py-0">

            {/* Left Text */}
            <div className="order-2 lg:order-1 space-y-6 lg:space-y-8">
              <div className="hero-anim inline-flex items-center gap-2 bg-blue-100/80 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold border border-blue-200/50">
                <Sparkles size={14} className="text-blue-500" />
                AI-Powered Platform
              </div>

              <h1 className="hero-anim text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-slate-900">
                Smart Customer Support{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">That Never Sleeps</span>
              </h1>

              <p className="hero-anim text-lg text-slate-500 leading-relaxed max-w-lg">
                Create Realistic AI Chatbots in Minutes — Perfect for Websites, Apps, and Customer Support. Resolve complaints 10x faster.
              </p>

              <div className="hero-anim flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 hover:-translate-y-0.5 text-center">
                  Start Free Trial <ArrowRight size={16} />
                </Link>
                <button onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-7 py-3.5 rounded-xl font-semibold text-sm border border-slate-200 hover:border-blue-300 transition-all shadow-sm cursor-pointer text-center">
                  See How It Works
                </button>
              </div>

              <div className="hero-anim flex items-center gap-2 text-sm">
                <Link to="/" className="text-blue-600 font-medium hover:underline">Home</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-400">AI Support Platform</span>
              </div>
            </div>

            {/* Right — Cute Robot */}
            <div className="order-1 lg:order-2 flex justify-center items-center relative">
              <div className="absolute top-10 right-10 w-64 h-64 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />

              {/* Floating chat bubbles */}
              <div className="absolute top-12 right-16 fl-1 p-3 bg-white rounded-2xl shadow-lg shadow-blue-100/50 border border-blue-50">
                <MessageSquare size={22} className="text-blue-500" />
              </div>
              <div className="absolute top-28 left-8 fl-2 p-2.5 bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-50">
                <Sparkles size={18} className="text-sky-500" />
              </div>
              <div className="absolute bottom-20 right-12 fl-3 p-2.5 bg-white rounded-xl shadow-lg shadow-blue-100/50 border border-blue-50">
                <Star size={18} className="text-amber-500" />
              </div>

              {/* Robot Character */}
              <div className="robot-float relative">
                <div className="w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 relative flex flex-col items-center justify-center">
                  {/* Head */}
                  <div className="relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex flex-col items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50 animate-pulse" />
                      <div className="w-1.5 h-6 bg-gradient-to-b from-blue-400 to-slate-300 rounded-full" />
                    </div>
                    <div className="w-44 sm:w-52 lg:w-60 h-44 sm:h-52 lg:h-56 bg-gradient-to-b from-slate-100 to-white rounded-[2.5rem] border-2 border-slate-200/80 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-6 left-4 right-4 bottom-10 bg-gradient-to-b from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center gap-5 shadow-inner">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sky-400 rounded-full shadow-lg shadow-sky-400/60 animate-pulse" />
                        <div className="w-5 h-5 sm:w-6 sm:h-6 bg-sky-400 rounded-full shadow-lg shadow-sky-400/60 animate-pulse" style={{ animationDelay: '0.3s' }} />
                      </div>
                      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-10 h-1.5 bg-slate-300 rounded-full" />
                      <div className="absolute top-1/2 -left-2.5 -translate-y-1/2 w-5 h-10 bg-blue-500 rounded-l-xl shadow-md" />
                      <div className="absolute top-1/2 -right-2.5 -translate-y-1/2 w-5 h-10 bg-blue-500 rounded-r-xl shadow-md" />
                    </div>
                  </div>
                  {/* Body */}
                  <div className="w-28 sm:w-32 lg:w-36 h-16 sm:h-20 bg-gradient-to-b from-white to-slate-50 rounded-b-3xl border-2 border-t-0 border-slate-200/80 shadow-lg -mt-2 relative">
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-md shadow-blue-500/50 animate-pulse" />
                    </div>
                  </div>
                  {/* Chat bubbles on robot */}
                  <div className="absolute -right-4 top-8 bg-blue-500 text-white px-3 py-2 rounded-2xl rounded-br-sm text-xs font-semibold shadow-lg fl-1">Hello! 👋</div>
                  <div className="absolute -left-2 top-1/3 bg-blue-100 text-blue-700 px-3 py-2 rounded-2xl rounded-bl-sm text-xs font-semibold shadow-md fl-2">How can I help?</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS BAR ═══════════ */}
      <section ref={statsRef} className="py-14 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-600">{ticketCount}+</div>
              <div className="text-sm text-slate-500 font-medium">Tickets Resolved</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-sky-600">{uptimeVal}%</div>
              <div className="text-sm text-slate-500 font-medium">Uptime Guarantee</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-amber-500">{ratingVal}</div>
              <div className="text-sm text-slate-500 font-medium">Average Rating</div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-emerald-500">24/7</div>
              <div className="text-sm text-slate-500 font-medium">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES GRID ═══════════ */}
      <section id="features" className="py-20 sm:py-28 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Features</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">
              Everything You Need for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">World-Class Support</span>
            </h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Our platform combines cutting-edge AI with powerful workflow tools.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group">
                  <div className={`w-14 h-14 ${f.color} rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section id="how-it-works" className="py-20 sm:py-28 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-blue-600 uppercase tracking-wider">Process</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2 mb-4">How SupportFlow Works</h2>
            <p className="text-lg text-slate-500">A seamless 3-step process from complaint to resolution.</p>
          </div>
          <div className="relative">
            <div className="hidden md:block absolute top-16 left-[15%] right-[15%] border-t-2 border-dashed border-blue-200 z-0" />
            <div className="grid md:grid-cols-3 gap-10 relative z-10">
              {[
                { num: "1", title: "Customer Submits", desc: "Submit a complaint or service request via the portal or AI chatbot.", icon: Ticket, color: "border-blue-100" },
                { num: "2", title: "AI Analyzes & Assigns", desc: "AI categorizes the issue and dispatches the best available specialist.", icon: Bot, color: "border-sky-100" },
                { num: "3", title: "Resolve & Rate", desc: "Technician resolves the issue and customer provides instant feedback.", icon: Star, color: "border-amber-100" },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                      <div className={`w-20 h-20 bg-white rounded-full border-2 ${step.color} flex items-center justify-center shadow-xl`}>
                        <Icon size={32} className="text-blue-600" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">{step.num}</div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">{step.title}</h3>
                    <p className="text-slate-500 text-sm max-w-xs">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section id="pricing" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-sky-800" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 leading-tight">Ready to Transform Your Customer Support?</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">Join thousands of companies using SupportFlow to deliver magical customer experiences.</p>
          <Link to="/register" className="inline-flex items-center justify-center bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 gap-2">
            Get Started Free <ArrowRight size={18} />
          </Link>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-blue-200">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-300" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-300" /> 14-day free trial</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={16} className="text-emerald-300" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* ═══════════ FOOTER ═══════════ */}
      <footer className="bg-slate-950 py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white"><Bot size={16} /></div>
              <span className="text-base font-bold text-white">SupportFlow</span>
            </div>
            <div className="text-slate-500 text-sm">© 2024 SupportFlow. All rights reserved.</div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

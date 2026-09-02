import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Wrench, Clock, Star, Bell, MessageSquare, ArrowRight, Zap, Shield, Headphones, ChevronRight, Sparkles, CheckCircle2, Ticket } from 'lucide-react';
import gsap from 'gsap';

export default function Home() {
  const containerRef = useRef(null);
  const cursorRef = useRef(null);
  const cursorHaloRef = useRef(null);
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const statsRef = useRef(null);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // Stats Counters
  const [tickets, setTickets] = useState(0);
  const [uptime, setUptime] = useState(0);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Custom Cursor Logic
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      
      // Update cursor dot instantly
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${clientX}px, ${clientY}px, 0)`;
      }
      
      // Update cursor halo with slight delay via GSAP
      if (cursorHaloRef.current) {
        gsap.to(cursorHaloRef.current, {
          x: clientX,
          y: clientY,
          duration: 0.15,
          ease: "power2.out"
        });
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    // Hero Entrance Animations
    const tl = gsap.timeline();
    tl.fromTo('.hero-text', 
      { y: 50, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out" }
    );

    // Floating Icons Animation
    gsap.to('.float-icon-1', { y: -20, duration: 2, yoyo: true, repeat: -1, ease: "sine.inOut" });
    gsap.to('.float-icon-2', { y: 25, duration: 2.5, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.5 });
    gsap.to('.float-icon-3', { y: -15, duration: 1.8, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1 });
    gsap.to('.float-icon-4', { y: 20, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.2 });
    gsap.to('.float-icon-5', { y: -25, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 0.7 });

    // Background Blob Pulsing
    gsap.to('.bg-blob', {
      scale: 1.1,
      opacity: 0.6,
      duration: 4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut"
    });

    // Cleanup
    return () => {
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
    };
  }, []);

  // Stats Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !statsAnimated) {
          setStatsAnimated(true);
          
          gsap.to({ val: 0 }, {
            val: 500,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
              setTickets(Math.floor(this.targets()[0].val));
            }
          });
          
          gsap.to({ val: 0 }, {
            val: 99.9,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
              setUptime(Number(this.targets()[0].val.toFixed(1)));
            }
          });

          gsap.to({ val: 0 }, {
            val: 4.9,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
              setRating(Number(this.targets()[0].val.toFixed(1)));
            }
          });
        }
      },
      { threshold: 0.5 }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [statsAnimated]);

  const features = [
    { title: "AI Ticket Triage", desc: "Automatically categorize and prioritize every complaint using smart AI analysis", icon: <Bot className="w-8 h-8 text-indigo-500" /> },
    { title: "Worker Dispatch", desc: "Assign field technicians to on-site jobs with one click", icon: <Wrench className="w-8 h-8 text-blue-500" /> },
    { title: "Real-Time Tracking", desc: "Monitor ticket progress and worker status with live polling", icon: <Clock className="w-8 h-8 text-indigo-500" /> },
    { title: "5-Star Ratings", desc: "Collect customer feedback with auto-popup rating modals", icon: <Star className="w-8 h-8 text-yellow-500" /> },
    { title: "Smart Notifications", desc: "Instant bell alerts for task completions, new bookings, and reviews", icon: <Bell className="w-8 h-8 text-rose-500" /> },
    { title: "AI Copilot Chat", desc: "Built-in conversational AI assistant for instant customer help", icon: <MessageSquare className="w-8 h-8 text-emerald-500" /> }
  ];

  return (
    <div 
      ref={containerRef} 
      className="relative min-h-screen bg-slate-50 text-slate-900 overflow-hidden"
      style={{ cursor: 'none' }}
    >
      {/* Custom Cursor Elements */}
      <div 
        ref={cursorHaloRef}
        className="fixed top-0 left-0 w-10 h-10 bg-indigo-500/30 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 backdrop-blur-[2px]"
      />
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-4 h-4 bg-indigo-600 rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(79,70,229,0.8)]"
      />

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full glass-panel border-b border-white/20 bg-white/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-indigo-600 rounded-lg robot-glow">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600">
                SupportFlow
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition-all shadow-md hover:shadow-lg flex items-center">
                Get Started
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex flex-col justify-center min-h-[90vh]">
        {/* Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-300/30 rounded-full blur-[100px] bg-blob pointer-events-none" />
        <div className="absolute top-20 right-20 w-[300px] h-[300px] bg-blue-300/30 rounded-full blur-[80px] bg-blob pointer-events-none" style={{ animationDelay: '2s' }} />

        {/* Floating Icons */}
        <div className="absolute top-40 left-[15%] float-icon-1 p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl rotate-12">
          <Bot className="w-8 h-8 text-indigo-600" />
        </div>
        <div className="absolute top-60 right-[15%] float-icon-2 p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl -rotate-12">
          <Headphones className="w-8 h-8 text-blue-600" />
        </div>
        <div className="absolute bottom-40 left-[20%] float-icon-3 p-3 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl -rotate-6">
          <Star className="w-6 h-6 text-yellow-500" />
        </div>
        <div className="absolute bottom-60 right-[25%] float-icon-4 p-4 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl rotate-6">
          <Zap className="w-8 h-8 text-amber-500" />
        </div>
        <div className="absolute top-32 right-[35%] float-icon-5 p-3 bg-white/50 backdrop-blur-md rounded-2xl shadow-xl rotate-12 hidden lg:block">
          <Shield className="w-6 h-6 text-emerald-500" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-4 py-2 rounded-full font-medium text-sm mb-8 hero-text shadow-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI-Powered Platform 2.0</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 hero-text leading-tight">
            AI-Powered Customer Support <br className="hidden md:block"/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">That Never Sleeps</span>
          </h1>
          
          <p className="text-xl text-slate-600 mb-10 max-w-3xl mx-auto hero-text leading-relaxed">
            Automate ticket triage, dispatch field workers, and resolve complaints 10x faster with intelligent AI agents.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 hero-text">
            <Link to="/register" className="w-full sm:w-auto btn-primary bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_30px_rgba(79,70,229,0.6)] flex items-center justify-center text-lg">
              Start Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <button 
              onClick={() => {
                document.getElementById('how-it-works').scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold border-2 border-slate-200 hover:border-indigo-600 hover:text-indigo-600 transition-all text-slate-700 bg-white/50 backdrop-blur-sm flex items-center justify-center text-lg"
            >
              See How It Works
            </button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-12 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x-0 md:divide-x divide-slate-100 text-center">
            <div className="p-4">
              <div className="text-4xl font-bold text-indigo-600 mb-2">{tickets}+</div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Tickets Resolved</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-blue-600 mb-2">{uptime}%</div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Uptime</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-yellow-500 mb-2">{rating}</div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">Average Rating</div>
            </div>
            <div className="p-4">
              <div className="text-4xl font-bold text-emerald-500 mb-2">24/7</div>
              <div className="text-sm text-slate-500 font-medium uppercase tracking-wider">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="py-24 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything You Need to Deliver <br className="hidden sm:block"/> <span className="text-indigo-600">World-Class Support</span></h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Our platform combines cutting-edge AI with powerful workflow tools to revolutionize how you handle customer issues.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="glass-card bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-slate-100 group">
                <div className="mb-6 p-4 bg-slate-50 rounded-xl inline-block group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">How SupportFlow Works</h2>
            <p className="text-lg text-slate-600">A seamless process from complaint submission to five-star resolution.</p>
          </div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-indigo-200 via-blue-200 to-indigo-200 -translate-y-1/2 border-dashed border-t-2 border-indigo-200 z-0"></div>
            
            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {/* Step 1 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-indigo-100 flex items-center justify-center mb-6 shadow-lg z-10 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">1</span>
                  <Ticket className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Customer Submits</h3>
                <p className="text-slate-600">Customer submits a complaint or service request via portal or chat.</p>
              </div>

              {/* Step 2 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-blue-100 flex items-center justify-center mb-6 shadow-lg z-10 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">2</span>
                  <Bot className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">AI Analyzes & Assigns</h3>
                <p className="text-slate-600">AI automatically categorizes the issue and dispatches the best specialist.</p>
              </div>

              {/* Step 3 */}
              <div className="relative flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-white rounded-full border-4 border-yellow-100 flex items-center justify-center mb-6 shadow-lg z-10 relative">
                  <span className="absolute -top-3 -right-3 w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">3</span>
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Worker Resolves & Rates</h3>
                <p className="text-slate-600">Technician fixes the issue on-site and customer provides instant feedback.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-indigo-900"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Transform Your Customer Support?</h2>
          <p className="text-indigo-200 text-xl mb-10 max-w-2xl mx-auto">Join thousands of companies using SupportFlow to deliver magical customer experiences every single day.</p>
          <Link to="/register" className="inline-flex items-center justify-center bg-white text-indigo-900 hover:bg-indigo-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
            Get Started Free
            <ArrowRight className="w-5 h-5 ml-2 text-indigo-600" />
          </Link>
          <div className="mt-8 flex justify-center items-center space-x-6 text-sm text-indigo-200">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> No credit card required</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-2 text-emerald-400" /> 14-day free trial</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Bot className="w-6 h-6 text-indigo-500" />
            <span className="text-xl font-bold text-white">SupportFlow</span>
          </div>
          
          <div className="text-slate-400 text-sm mb-4 md:mb-0">
            © 2024 SupportFlow. All rights reserved.
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

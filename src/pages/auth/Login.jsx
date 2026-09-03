import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot, Mail, Lock, Sparkles, ArrowRight, ShieldCheck, UserCheck, Wrench, Eye, EyeOff } from 'lucide-react';
import gsap from 'gsap';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const cardRef = useRef(null);
  const robotRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
    );

    gsap.to(robotRef.current, {
      y: -8,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    const cleanEmail = email ? email.trim().toLowerCase() : '';
    if (!cleanEmail) {
      setLocalError('Please enter your email address');
      return;
    }
    try {
      const u = await login(cleanEmail, password);
      if (u.role === 'customer') navigate('/customer/dashboard');
      else if (u.role === 'worker') navigate('/worker/dashboard');
      else if (u.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div ref={cardRef} className="glass-panel p-5 sm:p-8 rounded-3xl max-w-md w-full mx-3 shadow-2xl space-y-5 sm:space-y-6 relative border border-white/80">
        <div className="text-center space-y-2">
          <div ref={robotRef} className="w-20 h-20 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30 text-white robot-glow">
            <Bot size={42} strokeWidth={1.8} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight flex items-center justify-center gap-2">
            SupportFlow <Sparkles className="text-blue-600 w-5 h-5 animate-pulse" />
          </h1>
          <p className="text-sm text-slate-500">AI-Powered Support Desk & Worker Portal</p>
        </div>

        {localError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-200 text-center">
            {localError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                required
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="12345admin"
                required
                className="w-full pl-10 pr-11 py-2.5 bg-white/90 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Auto-Fill */}
          <div className="flex items-center justify-between text-[11px] bg-purple-50/80 border border-purple-100 rounded-xl px-3 py-1.5 text-purple-700">
            <span className="font-semibold">🔑 Demo Admin: admin@gmail.com</span>
            <button
              type="button"
              onClick={() => { setEmail('admin@gmail.com'); setPassword('12345admin'); }}
              className="text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer"
            >
              Auto-fill
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 btn-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? 'Logging in...' : 'Sign In to Portal'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center space-y-2">
          <div className="text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 font-semibold hover:underline">
              Register here
            </Link>
          </div>
          <div>
            <Link to="/" className="text-xs text-slate-400 hover:text-indigo-600 font-medium transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

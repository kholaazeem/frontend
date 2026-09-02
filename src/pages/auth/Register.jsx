import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bot, Mail, Lock, User, Sparkles, ArrowRight, ShieldCheck, UserCheck, Wrench } from 'lucide-react';
import gsap from 'gsap';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [specialty, setSpecialty] = useState('General');
  const [localError, setLocalError] = useState('');

  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const cardRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(
      cardRef.current,
      { y: 30, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'power3.out' }
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    try {
      const u = await register({ name, email, password, role, specialty });
      if (u.role === 'customer') navigate('/customer/dashboard');
      else if (u.role === 'worker') navigate('/worker/dashboard');
      else if (u.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setLocalError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-300/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div ref={cardRef} className="glass-panel p-8 rounded-3xl max-w-md w-full shadow-2xl space-y-6 relative border border-white/80">
        
        <div className="text-center space-y-1">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto shadow-md text-white mb-2">
            <Bot size={32} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Create Account</h1>
          <p className="text-xs text-slate-500">Join SupportFlow AI Platform</p>
        </div>

        {localError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-xs font-medium border border-red-200 text-center">
            {localError}
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Select Account Type</label>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => setRole('customer')}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                role === 'customer'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserCheck size={14} /> Customer
            </button>
            <button
              type="button"
              onClick={() => setRole('worker')}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                role === 'worker'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Wrench size={14} /> Worker
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`py-2 px-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                role === 'admin'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck size={14} /> Admin
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sara Khan"
                required
                className="w-full pl-10 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                required
                className="w-full pl-10 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
                className="w-full pl-10 pr-4 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>

          {role === 'worker' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Worker Field Specialty</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full px-3 py-2 bg-white/90 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="Technical">Technical Support</option>
                <option value="Billing">Billing & Refunds</option>
                <option value="Account">Account Security</option>
                <option value="Appliance">Appliance Maintenance</option>
                <option value="General">General Support</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 btn-primary rounded-xl font-semibold text-sm flex items-center justify-center gap-2 group cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Complete Registration'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

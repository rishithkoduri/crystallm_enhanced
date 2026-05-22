import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, Activity, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Auth() {
  const [authMode, setAuthMode] = useState('login'); 
  const [formData, setFormData] = useState({ name: '', email: '', password: '', dob: '' }); // Added dob
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const { login, register, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    
    let result;
    if (authMode === 'login') {
      result = await login(formData.email, formData.password);
      if (result.success) navigate('/generate');
      else setError(result.error);
    } 
    else if (authMode === 'register') {
      result = await register(formData.name, formData.email, formData.password, formData.dob);
      if (result.success) navigate('/generate');
      else setError(result.error);
    } 
    else if (authMode === 'reset') {
      result = await resetPassword(formData.email, formData.dob, formData.password);
      if (result.success) {
        setSuccessMsg("Access Key successfully recalibrated. You may now login.");
        setAuthMode('login'); 
        setFormData({ name: '', email: '', password: '', dob: '' }); 
      } else {
        setError(result.error);
      }
    }
  };

  const inputClass = "w-full bg-black/[0.02] dark:bg-white/[0.02] border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-black dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:border-red-500/50 focus:bg-black/[0.05] dark:focus:bg-white/[0.04] transition-all font-mono text-sm shadow-inner";
  const labelClass = "block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2";

  return (
    <div className="min-h-screen flex items-center justify-center px-6 transition-colors duration-500 bg-[#fafafa] dark:bg-[#0a0a0a]">
      
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.03] dark:opacity-[0.02]">
        <Activity size={600} strokeWidth={0.5} className="text-black dark:text-white" />
      </div>

      <div className="w-full max-w-md z-10">
        <div className="mb-10 text-center">
          <ShieldAlert size={40} strokeWidth={1} className="mx-auto text-red-600 dark:text-red-500 mb-4" />
          <h2 className="text-4xl font-black tracking-tighter text-black dark:text-white mb-2">
            {authMode === 'login' && 'Access Portal'}
            {authMode === 'register' && 'Request Access'}
            {authMode === 'reset' && 'System Override'}
          </h2>
          <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
            Secure Core Authentication
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-[#0f0f0f] border border-black/5 dark:border-white/5 shadow-2xl">
          
          {error && <div className="mb-6 p-4 rounded-xl bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-xs font-mono text-center">{error}</div>}
          {successMsg && <div className="mb-6 p-4 rounded-xl bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-700 dark:text-green-400 text-xs font-mono text-center">{successMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {authMode === 'register' && (
              <div>
                <label className={labelClass}><span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span> Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} placeholder="Researcher Name" />
              </div>
            )}
            
            <div>
              <label className={labelClass}><span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span> Email Address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} placeholder="researcher@institute.edu" />
            </div>

            {/* NEW: Show DOB field for Security Check during Register and Reset */}
            {(authMode === 'register' || authMode === 'reset') && (
              <div>
                <label className={labelClass}>
                  <span className="w-1 h-1 rounded-full bg-red-600 dark:bg-red-500"></span> 
                  {authMode === 'reset' ? 'Security Verification (DOB)' : 'Date of Birth'}
                </label>
                <input 
                  type="date" 
                  name="dob" 
                  value={formData.dob} 
                  onChange={handleChange} 
                  required 
                  className={`${inputClass} [&::-webkit-calendar-picker-indicator]:dark:invert`} 
                />
              </div>
            )}

            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-600"></span> 
                  {authMode === 'reset' ? 'New Access Key' : 'Access Key'}
                </label>
                
                {authMode === 'login' && (
                  <button type="button" onClick={() => { setAuthMode('reset'); setError(''); setSuccessMsg(''); }} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black dark:hover:text-white transition-colors">
                    System Override
                  </button>
                )}
              </div>
              <input type="password" name="password" value={formData.password} onChange={handleChange} required className={inputClass} placeholder="••••••••" />
            </div>

            <button type="submit" className="w-full py-4 mt-4 rounded-xl font-bold text-sm bg-black text-white hover:bg-red-600 dark:bg-white dark:text-black dark:hover:bg-red-600 dark:hover:text-white active:scale-95 transition-all flex items-center justify-center gap-3 group">
              {authMode === 'login' && 'Initialize Session'}
              {authMode === 'register' && 'Register Signature'}
              {authMode === 'reset' && 'Recalibrate Key'}
              
              {authMode === 'reset' ? (
                <RotateCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500" />
              ) : (
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-black/10 dark:border-white/5 text-center">
            {authMode === 'login' && (
              <button onClick={() => { setAuthMode('register'); setError(''); setSuccessMsg(''); }} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                Don't have clearance? Apply here.
              </button>
            )}
            {(authMode === 'register' || authMode === 'reset') && (
              <button onClick={() => { setAuthMode('login'); setError(''); setSuccessMsg(''); }} className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black dark:hover:text-white transition-colors">
                Return to Login.
              </button>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    const res = await login(data.email, data.password);
    setLoading(false);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-blob-1 pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] rounded-full bg-blob-2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 md:p-10 rounded-[32px] glass-card border border-white/20 dark:border-slate-800 shadow-2xl relative z-10 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold">
            🔑
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Sign in to manage listed pets and view adoptions.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                placeholder="you@example.com"
                className={`w-full bg-slate-50/50 dark:bg-slate-950 border rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white ${
                  errors.email ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200/80 dark:border-slate-800'
                }`}
              />
            </div>
            {errors.email && (
              <span className="text-[11px] font-bold text-red-500">{errors.email.message}</span>
            )}
          </div>

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
              <a href="#" className="text-[11px] font-bold text-primary hover:underline">Forgot password?</a>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="password"
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
                className={`w-full bg-slate-50/50 dark:bg-slate-950 border rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white ${
                  errors.password ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-200/80 dark:border-slate-800'
                }`}
              />
            </div>
            {errors.password && (
              <span className="text-[11px] font-bold text-red-500">{errors.password.message}</span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2 mt-4"
          >
            <LogIn size={16} />
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
            Create account
            <ArrowRight size={12} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

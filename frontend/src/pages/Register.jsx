import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { 
  Mail, Lock, User, Phone, MapPin, Building,
  ArrowRight, ShieldCheck, UserCheck, HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Register = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, text: 'Too Short', color: 'bg-slate-200' });
  const [selectedRole, setSelectedRole] = useState('ADOPTER');

  const { 
    register, 
    handleSubmit, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
    }
  });

  const passwordVal = watch('password');

  // Real-time password strength meter
  React.useEffect(() => {
    if (!passwordVal) {
      setPasswordStrength({ score: 0, text: 'Empty', color: 'bg-slate-200' });
      return;
    }
    let score = 0;
    if (passwordVal.length >= 8) score += 1;
    if (/[A-Z]/.test(passwordVal)) score += 1;
    if (/[0-9]/.test(passwordVal)) score += 1;
    if (/[^A-Za-z0-9]/.test(passwordVal)) score += 1;

    let text = 'Weak';
    let color = 'bg-red-500';

    if (passwordVal.length < 6) {
      text = 'Too Short';
      color = 'bg-red-500';
    } else if (score === 2) {
      text = 'Medium';
      color = 'bg-yellow-500';
    } else if (score >= 3) {
      text = 'Strong';
      color = 'bg-success';
    }

    setPasswordStrength({ score, text, color });
  }, [passwordVal]);

  const onSubmit = async (data) => {
    setLoading(true);
    const signupData = {
      ...data,
      role: selectedRole
    };
    const res = await registerUser(signupData);
    setLoading(false);
    if (res.success) {
      navigate('/');
    }
  };

  const rolesList = [
    { value: 'ADOPTER', label: 'Adopter', desc: 'I want to adopt a pet', icon: '🏠' },
    { value: 'OWNER', label: 'Owner', desc: 'I want to find a home for a pet', icon: '🐕' },
    { value: 'SHELTER', label: 'Shelter', desc: 'I operate an animal shelter', icon: '🏥' },
    { value: 'NGO', label: 'NGO', desc: 'We help protect animals', icon: '🤝' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-16 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-10 left-1/4 w-[450px] h-[450px] rounded-full bg-blob-1 pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-blob-2 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl p-8 md:p-10 rounded-[32px] glass-card border border-white/20 dark:border-slate-800 shadow-2xl relative z-10 space-y-8"
      >
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto text-xl font-bold">
            ✍️
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold tracking-tight">Create Account</h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">Join Home4Pet to discover adoptable pets or list new pets.</p>
        </div>

        {/* Role Selector Cards */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Registering As</label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {rolesList.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                  selectedRole === role.value 
                    ? 'border-primary bg-primary/5 text-primary dark:bg-primary/20 dark:text-primary-light shadow-md' 
                    : 'border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 text-slate-600 dark:text-slate-350'
                }`}
              >
                <span className="text-2xl mb-2">{role.icon}</span>
                <span className="font-bold text-xs">{role.label}</span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">{role.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">First Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="text"
                  {...register('firstName', { required: 'First Name is required' })}
                  placeholder="John"
                  className={`w-full bg-slate-50/50 dark:bg-slate-950 border rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white ${
                    errors.firstName ? 'border-red-500' : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.firstName && <span className="text-[10px] font-bold text-red-500">{errors.firstName.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Last Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="text"
                  {...register('lastName', { required: 'Last Name is required' })}
                  placeholder="Doe"
                  className={`w-full bg-slate-50/50 dark:bg-slate-950 border rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white ${
                    errors.lastName ? 'border-red-500' : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.lastName && <span className="text-[10px] font-bold text-red-500">{errors.lastName.message}</span>}
            </div>
          </div>

          {/* Email Address & Phone Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      message: 'Invalid email'
                    }
                  })}
                  placeholder="john@example.com"
                  className={`w-full bg-slate-50/50 dark:bg-slate-950 border rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white ${
                    errors.email ? 'border-red-500' : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                />
              </div>
              {errors.email && <span className="text-[10px] font-bold text-red-500">{errors.email.message}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number (Optional)</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Password & Strength Meter */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
              <input
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                placeholder="••••••••"
                className={`w-full bg-slate-50/50 dark:bg-slate-950 border rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white ${
                  errors.password ? 'border-red-500' : 'border-slate-200/80 dark:border-slate-800'
                }`}
              />
            </div>
            {errors.password && <span className="text-[10px] font-bold text-red-500">{errors.password.message}</span>}
            
            {/* Password strength UI */}
            {passwordVal && (
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-450">
                  <span>Complexity Strength:</span>
                  <span className={`${passwordStrength.score >= 3 ? 'text-success' : passwordStrength.score === 2 ? 'text-yellow-500' : 'text-red-500'}`}>
                    {passwordStrength.text}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden flex">
                  <div 
                    className={`h-full ${passwordStrength.color} transition-all duration-300`} 
                    style={{ width: `${Math.max(10, (passwordStrength.score + 1) * 20)}%` }} 
                  />
                </div>
              </div>
            )}
          </div>

          {/* Address & City */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Street Address</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="text"
                  {...register('address')}
                  placeholder="123 Main St"
                  className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">City</label>
              <div className="relative">
                <Building size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="text"
                  {...register('city')}
                  placeholder="Seattle"
                  className="w-full bg-slate-50/50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-sm flex items-center justify-center gap-2 mt-4"
          >
            {loading ? 'Creating Account...' : 'Register Now'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-bold hover:underline inline-flex items-center gap-0.5">
            Log in here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;

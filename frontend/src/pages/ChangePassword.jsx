import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authService } from '../api/services';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import { Lock, Save } from 'lucide-react';

const ChangePassword = () => {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await authService.changePassword(data);
      if (res.success) {
        toast.success("Password changed successfully!");
        reset();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password. Make sure current password is correct.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl md:text-3xl font-display font-extrabold">Change Account Password</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Protect your account by setting a secure credentials token.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-md">
            
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="password"
                  {...register('currentPassword', { required: 'Current password is required' })}
                  placeholder="••••••••"
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                />
              </div>
              {errors.currentPassword && <span className="text-[10px] font-bold text-red-500">{errors.currentPassword.message}</span>}
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="password"
                  {...register('newPassword', { 
                    required: 'New password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters long'
                    }
                  })}
                  placeholder="••••••••"
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                />
              </div>
              {errors.newPassword && <span className="text-[10px] font-bold text-red-500">{errors.newPassword.message}</span>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-primary/10 transition-all text-sm flex items-center gap-2"
            >
              <Save size={16} />
              {submitting ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default ChangePassword;

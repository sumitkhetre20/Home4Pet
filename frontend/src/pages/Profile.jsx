import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { userService } from '../api/services';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';
import { User, Phone, MapPin, Building, Save } from 'lucide-react';

const Profile = () => {
  const { user, login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      city: '',
    }
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await userService.getMe();
        if (res.success && res.data) {
          const profile = res.data;
          setValue('firstName', profile.firstName || '');
          setValue('lastName', profile.lastName || '');
          setValue('phone', profile.phone || '');
          setValue('address', profile.address || '');
          setValue('city', profile.city || '');
        }
      } catch (err) {
        toast.error("Failed to load profile details.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const res = await userService.updateMe(data);
      if (res.success) {
        toast.success("Profile updated successfully!");
        // Update user inside context
        localStorage.setItem('user', JSON.stringify(res.data));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Nav */}
        <Sidebar />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl md:text-3xl font-display font-extrabold">My Profile Settings</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Keep your profile information accurate for adoption checks.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
            
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
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
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
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                  />
                </div>
                {errors.lastName && <span className="text-[10px] font-bold text-red-500">{errors.lastName.message}</span>}
              </div>
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5 opacity-60 cursor-not-allowed">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address (Cannot change)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl py-3.5 px-4 text-sm text-slate-500 cursor-not-allowed"
              />
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-4 top-4 text-slate-400" />
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="+1 (555) 123-4567"
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                />
              </div>
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
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
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
                    className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary text-slate-850 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 bg-primary hover:bg-primary-dark disabled:opacity-50 text-white rounded-2xl font-bold shadow-md shadow-primary/10 transition-all text-sm flex items-center gap-2"
            >
              <Save size={16} />
              {submitting ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;

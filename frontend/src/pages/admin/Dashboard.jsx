import React, { useState, useEffect } from 'react';
import { adminService } from '../../api/services';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { ShieldAlert, Users, PawPrint, CheckSquare, CreditCard, Bell } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSync } from '../../context/SyncContext';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { syncVersion } = useSync();

  useEffect(() => {
    let active = true;
    const fetchStats = async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const res = await adminService.getDashboardStats();
        if (active && res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.warn('Failed to load admin stats.');
      } finally {
        if (showLoader && active) setLoading(false);
      }
    };

    fetchStats(true);

    const interval = setInterval(() => fetchStats(false), 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [syncVersion]);

  if (loading) return <Loader fullScreen />;

  const metricCards = [
    { label: 'Total Registrations', val: stats?.totalUsers, icon: <Users size={22} />, color: 'from-blue-500/10 to-blue-600/10 text-blue-600 border-blue-200/50' },
    { label: 'Pets Listed', val: stats?.totalPets, icon: <PawPrint size={22} />, color: 'from-purple-500/10 to-purple-600/10 text-purple-600 border-purple-200/50' },
    { label: 'Pending Requests', val: stats?.pendingAdoptions, icon: <CheckSquare size={22} />, color: 'from-amber-500/10 to-amber-600/10 text-amber-600 border-amber-200/50' },
    { label: 'Completed Payments', val: stats?.completedPayments, icon: <CreditCard size={22} />, color: 'from-success/10 to-success-dark/10 text-success border-success-light/20' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Admin Sidebar */}
        <Sidebar isAdmin />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-8">
          
          {/* Header */}
          <div className="pb-6 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl md:text-3xl font-display font-extrabold flex items-center gap-2">
              <ShieldAlert size={28} className="text-red-500" />
              Administrative Overview
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Monitor site engagement, pet counts, audit receipts, and moderate registrations.</p>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metricCards.map((card, i) => (
              <div 
                key={i} 
                className={`p-6 bg-gradient-to-tr ${card.color} border rounded-3xl flex items-center justify-between shadow-sm`}
              >
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{card.label}</span>
                  <h3 className="text-3xl font-black mt-2 font-display">{card.val ?? 0}</h3>
                </div>
                <div className="p-3 bg-white dark:bg-slate-950 rounded-2xl shadow-sm shrink-0">
                  {card.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Analytics placeholder — populated when real data is available */}
          <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-3xl space-y-4">
            <h4 className="font-display font-bold text-base">Monthly Adoptions Trend</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
              Chart will appear here once adoption data is available.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;

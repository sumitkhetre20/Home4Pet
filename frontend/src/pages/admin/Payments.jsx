import React, { useState, useEffect, useCallback } from 'react';
import { paymentService } from '../../api/services';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { Calendar, Filter } from 'lucide-react';
import { formatCurrency } from '../../utils/formatHelper';
import { useSync } from '../../context/SyncContext';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('COMPLETED');
  const [loading, setLoading] = useState(true);
  const { syncVersion } = useSync();

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentService.adminGetPayments(statusFilter);
      // adminGetPayments returns a Page — extract .content
      if (res.success && res.data) {
        setPayments(res.data.content ?? res.data);
      }
    } catch (err) {
      console.warn('Failed to load payments.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, syncVersion]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-success/10 text-success border-success/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Admin Sidebar */}
        <Sidebar isAdmin />

        {/* Content Box */}
        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
          
          {/* Header */}
          <div className="pb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold">Audits & Payments</h1>
              <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold mt-1">Audit all platform fees, verify transactions, and monitor invoice ledgers.</p>
            </div>
            
            {/* Filter */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50/50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700 dark:text-slate-350 cursor-pointer"
              >
              <option value="COMPLETED">Completed Payments</option>
                <option value="PENDING">Pending Payments</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl py-16">
              <h3 className="text-lg font-display font-bold">No transactions found</h3>
              <p className="text-slate-550 dark:text-slate-455 text-xs max-w-sm mt-1">
                There are no transaction records currently listed under: {statusFilter.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-3">Pet</th>
                    <th className="py-4 px-3">Transaction ID</th>
                    <th className="py-4 px-3">Request ID</th>
                    <th className="py-4 px-3">Date</th>
                    <th className="py-4 px-3">Method</th>
                    <th className="py-4 px-3">Amount</th>
                    <th className="py-4 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-semibold text-slate-700 dark:text-slate-300">
                  {payments.map((pay) => (
                    <tr key={pay.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                      <td className="py-4 px-3 font-semibold text-slate-700 dark:text-slate-300">{pay.petName || '—'}</td>
                      <td className="py-4 px-3 text-slate-500 font-medium">#{pay.id}</td>
                      <td className="py-4 px-3 text-slate-550 font-bold">#Req-{pay.adoptionRequestId}</td>
                      <td className="py-4 px-3 text-xs text-slate-500 font-normal flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(pay.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-3">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold text-slate-500">
                          {pay.paymentMethod || 'CARD'}
                        </span>
                      </td>
                      <td className="py-4 px-3 font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(pay.amount)}
                      </td>
                      <td className="py-4 px-3">
                        <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(pay.status)}`}>
                          {pay.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminPayments;

import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { paymentService } from '../api/services';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { CheckCircle2, XCircle, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSync } from '../context/SyncContext';
import { formatCurrency } from '../utils/formatHelper';

const Payments = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { syncVersion, notifySync } = useSync();

  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  // Stripe redirects back with ?payment_success=true or ?payment_cancelled=true
  const isSuccess  = searchParams.get('payment_success')  === 'true';
  const isCancelled = searchParams.get('payment_cancelled') === 'true';

  const fetchPayments = useCallback(async () => {
    try {
      const res = await paymentService.getMyPayments(0);
      if (res.success && res.data) {
        setPayments(res.data.content || []);
        return res.data.content || [];
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load payments ledger.');
    } finally {
      setLoading(false);
    }
    return [];
  }, []);

  // Handle Stripe redirect result once on mount
  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    if (isSuccess && sessionId) {
      setVerifying(true);
      let attempts = 0;
      const maxAttempts = 8;

      const checkPayment = async () => {
        attempts++;
        try {
          // Call sync-payment so backend marks it COMPLETED if not already done
          await paymentService.syncPayment(sessionId);
        } catch (_) {/* ignore — may already be completed */}

        const currentPayments = await fetchPayments();
        const verifiedPayment = currentPayments.find(
          (p) => p.stripeSessionId === sessionId && p.status === 'COMPLETED'
        );

        if (verifiedPayment) {
          setVerifying(false);
          toast.success('🎉 Payment successful! Your adoption is confirmed.');
          notifySync();
          navigate('/payments', { replace: true });
        } else if (attempts >= maxAttempts) {
          setVerifying(false);
          toast.success('🎉 Payment session complete!');
          notifySync();
          navigate('/payments', { replace: true });
        } else {
          setTimeout(checkPayment, 1500);
        }
      };

      checkPayment();
    } else if (isSuccess) {
      toast.success('🎉 Payment successful! Your adoption is confirmed.');
      notifySync();
      navigate('/payments', { replace: true });
    } else if (isCancelled) {
      toast.error('Payment was cancelled. You can try again from Adoption Requests.');
      navigate('/payments', { replace: true });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  // Re-fetch on mount and sync events
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments, syncVersion]);

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED': return 'bg-success/10 text-success border-success/20';
      case 'PENDING':   return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'FAILED':    return 'bg-red-500/10 text-red-650 border-red-500/20';
      case 'REFUNDED':  return 'bg-slate-100 text-slate-500 border-slate-200';
      default:          return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">

        <Sidebar />

        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">

          {/* Success / Cancelled banners */}
          {isSuccess && !verifying && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-success/10 border border-success/20 rounded-2xl text-success text-sm font-semibold">
              <CheckCircle2 size={20} />
              Payment confirmed! Your adoption request has been completed.
            </div>
          )}
          {isCancelled && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-650 text-sm font-semibold">
              <XCircle size={20} />
              Payment was cancelled. Go to Adoption Requests to try again.
            </div>
          )}

          {verifying && (
            <div className="mb-6 flex items-center justify-center gap-3 p-6 bg-primary/5 border border-primary/20 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0" />
              <span>Verifying payment status with Stripe... Please wait.</span>
            </div>
          )}

          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800">
            <h1 className="text-2xl md:text-3xl font-display font-extrabold">Payments Ledger</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1">Review all adoption fees paid or pending transactions.</p>
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-955 rounded-2xl py-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-2xl mb-4">💳</div>
              <h3 className="text-lg font-display font-bold">No transactions found</h3>
              <p className="text-slate-550 dark:text-slate-455 text-xs max-w-sm mt-1 font-medium">
                Your payment history is clear. Paid fees for approved adoption requests will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-4 px-3">Pet</th>
                    <th className="py-4 px-3">Transaction ID</th>
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
                      <td className="py-4 px-3 text-xs text-slate-500 flex items-center gap-1">
                        <Calendar size={13} className="text-slate-400" />
                        {new Date(pay.createdAt || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-3">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[10px] uppercase font-bold text-slate-500">
                          {pay.paymentMethod || 'STRIPE'}
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

export default Payments;

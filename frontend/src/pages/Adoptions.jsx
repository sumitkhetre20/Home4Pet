import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adoptionService, paymentService } from '../api/services';
import Sidebar from '../components/Sidebar';
import Loader from '../components/Loader';
import { Landmark, MessageSquare, CreditCard, Check, X, ShieldAlert, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSync } from '../context/SyncContext';
import { formatCurrency } from '../utils/formatHelper';

const Adoptions = () => {
  const { hasRole } = useAuth();
  const [searchParams] = useSearchParams();
  const receivedParam = searchParams.get('received') === 'true';
  const { syncVersion, notifySync } = useSync();

  const [activeTab, setActiveTab] = useState(receivedParam ? 'received' : 'sent');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);
  const [checkoutLoadingId, setCheckoutLoadingId] = useState(null);

  const [showNoteModal, setShowNoteModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState('');
  const [noteMessage, setNoteMessage] = useState('');

  const canViewReceived = hasRole('OWNER') || hasRole('SHELTER') || hasRole('NGO') || hasRole('ADMIN');

  const fetchRequests = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const sentRes = await adoptionService.getMyRequests(0, 50);
      if (sentRes.success && sentRes.data) {
        setSentRequests(sentRes.data.content || []);
      }
      if (canViewReceived) {
        const recRes = await adoptionService.getReceivedRequests(0, 50);
        if (recRes.success && recRes.data) {
          setReceivedRequests(recRes.data.content || []);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load adoption requests.');
    } finally {
      setLoading(false);
    }
  }, [canViewReceived]);

  // Re-fetch on mount and sync events; poll silently every 5s
  useEffect(() => {
    fetchRequests(true);
  }, [fetchRequests, syncVersion]);

  useEffect(() => {
    const interval = setInterval(() => fetchRequests(false), 5000);
    return () => clearInterval(interval);
  }, [fetchRequests]);

  const handleOpenActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setNoteMessage('');
    setShowNoteModal(true);
  };

  const handleActionConfirm = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    setSubmittingAction(true);
    try {
      const res = await adoptionService.updateRequestStatus(selectedRequest.id, {
        status: actionType,
        adminNote: noteMessage,
      });
      if (res.success) {
        toast.success(`Request successfully ${actionType.toLowerCase()}!`);
        setShowNoteModal(false);
        notifySync();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleStripeCheckout = async (req) => {
    setCheckoutLoadingId(req.id);
    try {
      const res = await paymentService.createCheckoutSession(req.petId);
      if (res.success && res.data?.checkoutUrl) {
        // Redirect to Stripe Checkout — backend handles everything on webhook
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error('Could not create checkout session. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoadingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING':   return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'APPROVED':  return 'bg-success/10 text-success border-success/20';
      case 'REJECTED':  return 'bg-red-500/10 text-red-650 border-red-500/20';
      case 'CANCELLED': return 'bg-slate-100 text-slate-500 border-slate-200';
      case 'COMPLETED': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      default:          return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  if (loading) return <Loader fullScreen />;

  const requestsToShow = activeTab === 'sent' ? sentRequests : receivedRequests;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">

        <Sidebar />

        <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">

          {/* Header & Tabs */}
          <div className="pb-6 mb-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-extrabold">Adoption Inbox</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold mt-1 font-medium">Review and process your submitted and received adoption requests.</p>
            </div>

            {canViewReceived && (
              <div className="flex bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-850">
                <button
                  onClick={() => setActiveTab('sent')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'sent'
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Sent Applications
                </button>
                <button
                  onClick={() => setActiveTab('received')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'received'
                      ? 'bg-white dark:bg-slate-900 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Received Requests
                </button>
              </div>
            )}
          </div>

          {/* Request List */}
          {requestsToShow.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-950 rounded-2xl py-16">
              <div className="w-14 h-14 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-2xl mb-4">📬</div>
              <h3 className="text-lg font-display font-bold">No requests found</h3>
              <p className="text-slate-550 dark:text-slate-450 text-xs max-w-sm mt-1 font-medium">
                {activeTab === 'sent'
                  ? "You haven't submitted any adoption applications yet."
                  : "You haven't received any adoption requests on your pets."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requestsToShow.map((req) => (
                <div
                  key={req.id}
                  className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow"
                >
                  {/* Pet Info */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-xl">🐾</span>
                      <div>
                        <h4 className="font-display font-bold text-slate-850 dark:text-white">
                          Request for pet ID: {req.petId}
                          {req.petAdoptionFee != null && (
                            <span className="ml-2 text-xs font-semibold text-slate-400">
                              (Fee: {formatCurrency(req.petAdoptionFee)})
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                          {activeTab === 'sent'
                            ? `Sent to Owner ID: ${req.ownerId || 'N/A'}`
                            : `Adopter Email: ${req.userEmail || 'Anonymous'}`}
                        </span>
                      </div>
                    </div>

                    {req.message && (
                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-xs text-slate-655 dark:text-slate-400 flex items-start gap-2">
                        <MessageSquare size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="italic font-medium">"{req.message}"</p>
                      </div>
                    )}

                    {req.adminNote && (
                      <div className="p-3 bg-amber-500/5 rounded-xl border border-amber-500/10 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-2">
                        <ShieldAlert size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="font-semibold">Host Note: {req.adminNote}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                    <span className={`px-3 py-1 border rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(req.status)}`}>
                      {req.status}
                    </span>

                    {/* Owner: approve / reject pending requests */}
                    {activeTab === 'received' && req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenActionModal(req, 'APPROVED')}
                          className="p-2.5 bg-success hover:bg-success-dark text-white rounded-xl shadow-sm transition-colors"
                          title="Approve Request"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleOpenActionModal(req, 'REJECTED')}
                          className="p-2.5 bg-red-500 hover:bg-red-650 text-white rounded-xl shadow-sm transition-colors"
                          title="Reject Request"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {/* Adopter: pay fee if approved and not yet paid */}
                    {activeTab === 'sent' && req.status === 'APPROVED' && !req.hasPaidPayment && (
                      <button
                        onClick={() => handleStripeCheckout(req)}
                        disabled={checkoutLoadingId === req.id}
                        className="px-4 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white rounded-xl font-bold shadow-md shadow-primary/10 text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <CreditCard size={14} />
                        {checkoutLoadingId === req.id ? 'Redirecting...' : 'Pay Adoption Fee'}
                      </button>
                    )}

                    {/* Paid status badge — shown for both adopter and owner once paid */}
                    {req.hasPaidPayment && (
                      <span className="px-3 py-1.5 bg-success/10 text-success border border-success/20 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <BadgeCheck size={14} />
                        Payment Completed
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Approve / Reject note modal */}
      {showNoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowNoteModal(false)} />
          <div className="bg-white dark:bg-slate-900 border border-white/20 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative z-10 space-y-4">
            <h3 className="font-display font-bold text-xl">
              {actionType === 'APPROVED' ? 'Approve Adoption Request' : 'Reject Adoption Request'}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">Add an optional message/note for the adopter regarding meeting timings, terms, or reasons.</p>
            <form onSubmit={handleActionConfirm} className="space-y-4">
              <textarea
                rows={4}
                value={noteMessage}
                onChange={(e) => setNoteMessage(e.target.value)}
                placeholder="Hi, let's meet this Saturday at 2pm..."
                className="w-full bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-850 rounded-2xl p-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-850 dark:text-white"
              />
              <div className="flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="px-4 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-450 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingAction}
                  className={`px-5 py-2.5 text-white rounded-xl font-bold transition-all shadow-sm ${
                    actionType === 'APPROVED' ? 'bg-success hover:bg-success-dark' : 'bg-red-500 hover:bg-red-650'
                  }`}
                >
                  {submittingAction ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Adoptions;

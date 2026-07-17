import React, { useState, useEffect } from 'react';
import { adoptionService } from '../../api/services';
import Sidebar from '../../components/Sidebar';
import Loader from '../../components/Loader';
import { Check, X, ShieldAlert, Filter, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAdoptions = () => {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await adoptionService.adminGetRequests(statusFilter, 0);
      if (res.success && res.data?.content) {
        setRequests(res.data.content);
      }
    } catch (err) {
      console.warn('Failed to load adoption requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleAction = async (requestId, nextStatus) => {
    const reason = window.prompt(`Enter optional administrative note/reason for marking this request as ${nextStatus.toLowerCase()}:`);
    if (reason === null) return; // cancel click

    setSubmittingAction(true);
    try {
      const res = await adoptionService.updateRequestStatus(requestId, {
        status: nextStatus,
        adminNote: reason
      });
      if (res.success) {
        toast.success(`Request ${nextStatus.toLowerCase()} successfully.`);
        // Refresh
        fetchRequests();
      }
    } catch (err) {
      toast.error("Failed to update adoption request status.");
    } finally {
      setSubmittingAction(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'APPROVED': return 'bg-success/10 text-success border-success/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-650 border-red-500/20';
      case 'COMPLETED': return 'bg-blue-550/10 text-blue-600 border-blue-500/20';
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
              <h1 className="text-2xl md:text-3xl font-display font-extrabold">Moderate Adoption Actions</h1>
              <p className="text-slate-550 dark:text-slate-400 text-xs font-semibold mt-1">Review applicant requests, check host descriptions, and verify statuses.</p>
            </div>
            
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50/50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700 dark:text-slate-300 cursor-pointer"
              >
                <option value="PENDING">Pending Requests</option>
                <option value="APPROVED">Approved Requests</option>
                <option value="REJECTED">Rejected Requests</option>
                <option value="COMPLETED">Completed Requests</option>
              </select>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center p-12 bg-slate-50 dark:bg-slate-955 rounded-2xl py-16">
              <h3 className="text-lg font-display font-bold">No requests found</h3>
              <p className="text-slate-550 dark:text-slate-455 text-xs max-w-sm mt-1">
                There are no adoption requests currently listed under status: {statusFilter.toLowerCase()}.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((req) => (
                <div key={req.id} className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-3xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center text-lg">📝</div>
                      <div>
                        <h4 className="font-display font-bold text-slate-850 dark:text-white">Request #{req.id} (Pet ID: {req.petId})</h4>
                        <span className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Adopter: {req.userEmail}</span>
                      </div>
                    </div>
                    {req.message && (
                      <p className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-xl text-xs text-slate-655 dark:text-slate-400 font-semibold italic">
                        "{req.message}"
                      </p>
                    )}
                    {req.adminNote && (
                      <p className="text-[11px] text-amber-500 font-bold">
                        Reason/Note: {req.adminNote}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <span className={`px-2.5 py-0.5 border rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusBadge(req.status)}`}>
                      {req.status}
                    </span>
                    {req.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          className="px-3.5 py-2 bg-success hover:bg-success-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <Check size={14} /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          className="px-3.5 py-2 bg-red-500 hover:bg-red-650 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                        >
                          <X size={14} /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminAdoptions;

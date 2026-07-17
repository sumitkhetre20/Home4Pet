import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSync } from '../context/SyncContext';
import { useAuth } from '../context/AuthContext';
import { paymentService } from '../api/services';

// Stripe lands here after checkout. Calls sync-payment then redirects to /payments.
const PaymentRedirect = ({ type }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { notifySync } = useSync();
  const { loading: authLoading } = useAuth();
  const ran = useRef(false);

  useEffect(() => {
    // Wait until AuthContext has restored the token from localStorage
    if (authLoading) return;
    if (ran.current) return;
    ran.current = true;

    const sessionId = searchParams.get('session_id') || '';

    if (type === 'success' && sessionId) {
      // Call backend to mark payment COMPLETED before navigating
      paymentService
        .syncPayment(sessionId)
        .catch(() => {/* best-effort — Payments page will retry */})
        .finally(() => {
          notifySync();
          navigate(`/payments?payment_success=true&session_id=${sessionId}`, { replace: true });
        });
    } else if (type === 'success') {
      notifySync();
      navigate('/payments?payment_success=true', { replace: true });
    } else {
      navigate('/payments?payment_cancelled=true', { replace: true });
    }
  }, [authLoading, navigate, type, notifySync, searchParams]);

  return null;
};

export default PaymentRedirect;

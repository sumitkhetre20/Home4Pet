import React, { createContext, useContext, useState, useCallback } from 'react';

// Centralized state synchronization context for Home4Pet.
// Increments `syncVersion` to trigger re-fetching on any changes (payment, status, notifications).
const SyncContext = createContext(null);

export const SyncProvider = ({ children }) => {
  const [syncVersion, setSyncVersion] = useState(0);

  const notifySync = useCallback(() => {
    setSyncVersion((v) => v + 1);
  }, []);

  return (
    <SyncContext.Provider value={{ syncVersion, notifySync }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync must be used within SyncProvider');
  return ctx;
};

// Backward compatibility wrappers for files referencing payment version events
export const usePaymentVersion = () => {
  const { syncVersion } = useSync();
  return syncVersion;
};

export const useNotifyPayment = () => {
  const { notifySync } = useSync();
  return notifySync;
};

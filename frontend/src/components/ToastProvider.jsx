/**
 * ToastProvider.jsx
 * Simple toast/snackbar context used across the app. Exposes add/remove helpers.
 */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

let idCounter = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const add = useCallback((message, type = 'info', ttl = 4000) => {
    const id = idCounter++;
    setToasts((t) => [...t, { id, message, type }]);
    if (ttl > 0) {
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), ttl);
    }
    return id;
  }, []);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      <div className="fixed right-4 bottom-4 flex flex-col gap-2 z-50">
        {toasts.map((t) => (
          <div key={t.id} className={`max-w-sm w-full px-4 py-3 rounded shadow-md text-white ${t.type === 'error' ? 'bg-red-500' : t.type === 'success' ? 'bg-green-500' : 'bg-gray-800'}`}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

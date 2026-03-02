import React, { createContext, useCallback, useContext, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', message, duration = 4000 }) => {
    const id = ++idCounter;
    setToasts((t) => [...t, { id, type, message }]);
    if (duration > 0) {
      setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration);
    }
  }, []);

  const success = useCallback((message, opts = {}) => addToast({ type: 'success', message, duration: opts.duration ?? 4000 }), [addToast]);
  const error = useCallback((message, opts = {}) => addToast({ type: 'error', message, duration: opts.duration ?? 6000 }), [addToast]);
  const info = useCallback((message, opts = {}) => addToast({ type: 'info', message, duration: opts.duration ?? 4000 }), [addToast]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  return (
    <ToastContext.Provider value={{ success, error, info, addToast, remove }}>
      {children}

      <div className="fixed z-50 top-6 right-6 flex flex-col gap-3 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            onClick={() => remove(t.id)}
            className={`max-w-xs w-full cursor-pointer p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-out break-words ${
              t.type === 'success'
                ? 'bg-emerald-50 border-l-4 border-emerald-600 text-emerald-700'
                : t.type === 'error'
                ? 'bg-red-50 border-l-4 border-red-600 text-red-700'
                : 'bg-white border border-zinc-200 text-zinc-800'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="text-xl select-none">{t.type === 'success' ? '✓' : t.type === 'error' ? '!' : 'i'}</div>
              <div className="text-sm font-medium leading-snug">{t.message}</div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastProvider;

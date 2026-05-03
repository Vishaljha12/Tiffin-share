import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be within ToastProvider");
  return ctx;
}

const ICONS = {
  success: "✅",
  error: "❌",
  info: "ℹ️",
  warning: "⚠️",
  gift: "🎁",
  claim: "🎉",
  swap: "🤝",
  fire: "🔥",
};

const COLORS = {
  success: "border-green-500/40 bg-green-500/10",
  error: "border-red-500/40 bg-red-500/10",
  info: "border-blue-500/40 bg-blue-500/10",
  warning: "border-yellow-500/40 bg-yellow-500/10",
  gift: "border-pink-500/40 bg-pink-500/10",
  claim: "border-orange-500/40 bg-orange-500/10",
  swap: "border-cyan-500/40 bg-cyan-500/10",
  fire: "border-orange-500/40 bg-orange-500/10",
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timers.current[id]) {
      clearTimeout(timers.current[id]);
      delete timers.current[id];
    }
  }, []);

  const toast = useCallback((message, type = "info", duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    timers.current[id] = setTimeout(() => removeToast(id), duration);
    return id;
  }, [removeToast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      Object.values(timers.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: -20, scale: 0.95, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl cursor-pointer ${COLORS[t.type] || COLORS.info}`}
              onClick={() => removeToast(t.id)}
            >
              <span className="text-xl flex-shrink-0">{ICONS[t.type] || ICONS.info}</span>
              <p className="text-sm text-white font-medium leading-snug flex-grow">{t.message}</p>
              <button 
                className="text-white/40 hover:text-white/70 transition-colors text-xs flex-shrink-0"
                onClick={(e) => { e.stopPropagation(); removeToast(t.id); }}
              >
                ✕
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

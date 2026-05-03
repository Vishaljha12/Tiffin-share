import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ children, onClose, isOpen = true }) {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="glass-card p-6 w-full max-w-md relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-[-40px] right-[-40px] w-28 h-28 bg-orange-500/20 blur-3xl rounded-full pointer-events-none" />
          {children}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="mt-4 w-full px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-gray-300 text-sm transition-colors"
          >
            Cancel
          </motion.button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ToastProps {
  message: string;
  show: boolean;
  onClose: () => void;
  type?: "success" | "error";
}

export default function Toast({ message, show, onClose, type = "success" }: ToastProps) {
  useEffect(() => {
    if (show) {
      const t = setTimeout(onClose, 3000);
      return () => clearTimeout(t);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-lg text-sm font-medium shadow-lg ${
            type === "success"
              ? "bg-[#70E844] text-[#131313]"
              : "bg-[#FE454E] text-white"
          }`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import React, { useEffect } from "react";

const STATUS_STYLES = {
  success: {
    container: "bg-emerald-500",
    icon: "✓",
  },
  error: {
    container: "bg-rose-500",
    icon: "⚠",
  },
  info: {
    container: "bg-sky-500",
    icon: "ℹ",
  },
};

export default function StatusToast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => onClose?.(), toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const { message, type = "info" } = toast;
  const styles = STATUS_STYLES[type] || STATUS_STYLES.info;

  return (
    <div className="fixed top-6 right-6 z-[60] animate-[slide-in_0.35s_ease]">
      <style>
        {`
          @keyframes slide-in {
            from {
              opacity: 0;
              transform: translateY(-10px) scale(0.98);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
      <div
        className={`flex items-start gap-3 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-slate-900/20 min-w-[260px] max-w-xs ${styles.container}`}
      >
        <span className="text-lg font-bold leading-none pt-0.5">{styles.icon}</span>
        <p className="text-sm leading-relaxed flex-1">{message}</p>
        <button
          type="button"
          onClick={onClose}
          className="text-white/80 hover:text-white text-sm font-semibold"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
    </div>
  );
}

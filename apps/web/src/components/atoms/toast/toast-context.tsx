"use client";

import React, { createContext, useCallback, useContext, useState } from "react";

export type ToastType = "success" | "error" | "info";

export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description: string;
  action?: ToastAction;
  duration?: number; // duration in ms, 0 means persistent
}

interface ToastContextValue {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  toast: {
    success: (title: string, description: string, action?: ToastAction) => string;
    error: (title: string, description: string, action?: ToastAction) => string;
    info: (title: string, description: string, action?: ToastAction) => string;
  };
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastCount = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (toastData: Omit<ToastItem, "id">) => {
      const id = `toast-${Date.now()}-${++toastCount}`;
      // Default durations from FRAME 14:
      // "تحت الشمال · 4 ثواني · الخطأ بيستنى الضغط"
      const duration =
        toastData.duration !== undefined
          ? toastData.duration
          : toastData.type === "error"
            ? 0
            : 4000;

      const newToast: ToastItem = {
        ...toastData,
        id,
        duration,
      };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description: string, action?: ToastAction) =>
      addToast({ type: "success", title, description, action }),
    [addToast]
  );

  const error = useCallback(
    (title: string, description: string, action?: ToastAction) =>
      addToast({ type: "error", title, description, action, duration: 0 }),
    [addToast]
  );

  const info = useCallback(
    (title: string, description: string, action?: ToastAction) =>
      addToast({ type: "info", title, description, action }),
    [addToast]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    toast: {
      success,
      error,
      info,
    },
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}


"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { Toast, ToastContextType } from '~/constants/toast';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const borderByType = {
  success: "border-l-green-600 dark:border-l-green-500",
  error: "border-l-red-600 dark:border-l-red-500",
  info: "border-l-blue-600 dark:border-l-blue-500",
};

const iconByType = {
  success: "text-green-600 dark:text-green-500",
  error: "text-red-600 dark:text-red-500",
  info: "text-blue-600 dark:text-blue-500",
};

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isClient, setIsClient] = useState(false);
  const errorKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsClient(true);
  }, []);

  const addToast = (type: Toast["type"], title: string, message?: string) => {
    if (!isClient) return;
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, title, message, timestamp: Date.now() };
    if (type === "error") {
      const errorKey = `${title}-${message}`;
      if (errorKeys.current.has(errorKey)) return;
      errorKeys.current.add(errorKey);
      setTimeout(() => errorKeys.current.delete(errorKey), 5000);
    }
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showSuccess = (title: string, message?: string) => addToast("success", title, message);
  const showError = (title: string, message?: string) => addToast("error", title, message);
  const showInfo = (title: string, message?: string) => addToast("info", title, message);

  return (
    <ToastContext.Provider value={{ toasts, showSuccess, showError, showInfo, removeToast }}>
      {children}
      {isClient && (
        <div className="fixed bottom-4 right-4 z-50 space-y-2" suppressHydrationWarning>
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="max-w-sm w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-none p-3 shadow"
            >
              <div className="flex items-start gap-3">
                <span className={`flex-shrink-0 mt-0.5 ${iconByType[toast.type]}`} aria-hidden>
                  {toast.type === "success" && <CheckCircle className="h-4 w-4" />}
                  {toast.type === "error" && <AlertCircle className="h-4 w-4" />}
                  {toast.type === "info" && <Info className="h-4 w-4" />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{toast.title}</p>
                  {toast.message && (
                    <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">{toast.message}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
} 
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
  showWarning: (message: string, duration?: number) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Styled components
const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const ToastContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
  max-width: 400px;
`;

const ToastItem = styled.div<{ type: Toast['type']; isExiting?: boolean }>`
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borders.radius.md};
  box-shadow: ${({ theme }) => theme.effects.shadow.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 300px;
  animation: ${({ isExiting }) => (isExiting ? slideOut : slideIn)} 0.3s ease-in-out;
  
  background-color: ${({ theme, type }) => {
    switch (type) {
      case 'success':
        return theme.colors.status.success;
      case 'error':
        return theme.colors.status.error;
      case 'warning':
        return theme.colors.status.warning;
      case 'info':
        return theme.colors.primary.main;
      default:
        return theme.colors.background.secondary;
    }
  }};
  
  color: ${({ theme }) => theme.colors.text.inverse};
  border-left: 4px solid ${({ theme, type }) => {
    switch (type) {
      case 'success':
        return theme.colors.status.successDark;
      case 'error':
        return theme.colors.status.errorDark;
      case 'warning':
        return theme.colors.status.warningDark;
      case 'info':
        return theme.colors.primary.dark;
      default:
        return theme.colors.border.light;
    }
  }};
`;

const ToastMessage = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const ToastCloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.inverse};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.fontSize.lg};
  font-weight: bold;
  margin-left: ${({ theme }) => theme.spacing.sm};
  padding: 0;
  opacity: 0.7;
  
  &:hover {
    opacity: 1;
  }
`;

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [exitingToasts, setExitingToasts] = useState<Set<string>>(new Set());

  const generateId = () => `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = generateId();
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration || 5000,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    // Add to exiting toasts for animation
    setExitingToasts(prev => new Set(prev).add(id));
    
    // Remove after animation completes
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
      setExitingToasts(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
    setExitingToasts(new Set());
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'success', duration });
  }, [addToast]);

  const showError = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'error', duration });
  }, [addToast]);

  const showWarning = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'warning', duration });
  }, [addToast]);

  const showInfo = useCallback((message: string, duration?: number) => {
    addToast({ message, type: 'info', duration });
  }, [addToast]);

  const value: ToastContextType = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toasts.length > 0 && (
        <ToastContainer>
          {toasts.map(toast => (
            <ToastItem
              key={toast.id}
              type={toast.type}
              isExiting={exitingToasts.has(toast.id)}
            >
              <ToastMessage>{toast.message}</ToastMessage>
              <ToastCloseButton
                onClick={() => removeToast(toast.id)}
                aria-label="Close notification"
              >
                ×
              </ToastCloseButton>
            </ToastItem>
          ))}
        </ToastContainer>
      )}
    </ToastContext.Provider>
  );
};
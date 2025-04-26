import React from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "error";
  title?: string;
  icon?: React.ReactNode;
  onClose?: () => void;
}

const alertVariants = {
  info: "bg-blue-50 text-blue-800 [--icon-color:theme(colors.blue.400)]",
  success: "bg-green-50 text-green-800 [--icon-color:theme(colors.green.400)]",
  warning: "bg-yellow-50 text-yellow-800 [--icon-color:theme(colors.yellow.400)]",
  error: "bg-red-50 text-red-800 [--icon-color:theme(colors.red.400)]",
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "info", title, icon, onClose, children, ...props }, ref) => {
    return (
      <div ref={ref} role="alert" className={cn("rounded-lg p-4", alertVariants[variant], className)} {...props}>
        <div className="flex">
          {icon && (
            <div className="flex-shrink-0">
              <span className="text-[--icon-color]">{icon}</span>
            </div>
          )}
          <div className={cn("flex-1", icon && "ml-3")}>
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {children && <div className={cn("text-sm", title && "mt-2")}>{children}</div>}
          </div>
          {onClose && (
            <button
              type="button"
              className="ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex text-[--icon-color] hover:bg-[--icon-color]/10 focus:outline-none focus:ring-2 focus:ring-[--icon-color]/50"
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = "Alert";

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "error";
  title: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
}

const toastVariants = {
  default: "bg-white",
  success: "bg-green-50",
  error: "bg-red-50",
};

const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ className, variant = "default", title, description, action, onClose, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5",
          toastVariants[variant],
          className
        )}
        {...props}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">{title}</p>
              {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
            </div>
            {(action || onClose) && (
              <div className="ml-4 flex flex-shrink-0">
                {action}
                {onClose && (
                  <button
                    type="button"
                    className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

Toast.displayName = "Toast";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg";
}

const progressSizes = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, max = 100, size = "md", ...props }, ref) => {
    const percentage = (value / max) * 100;

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn("overflow-hidden rounded-full bg-gray-200", progressSizes[size], className)}
        {...props}
      >
        <div
          className="h-full bg-[#FF5A5F] transition-all duration-500 ease-in-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export { Alert, Toast, Progress };

import React from "react";
import { cn } from "@/lib/utils";

interface FormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const Form = React.forwardRef<HTMLFormElement, FormProps>(({ className, children, onSubmit, ...props }, ref) => {
  return (
    <form ref={ref} onSubmit={onSubmit} className={cn("space-y-6", className)} {...props}>
      {children}
    </form>
  );
});

Form.displayName = "Form";

const FormGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {children}
      </div>
    );
  }
);

FormGroup.displayName = "FormGroup";

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

const FormLabel = React.forwardRef<HTMLLabelElement, FormLabelProps>(
  ({ className, children, required, ...props }, ref) => {
    return (
      <label ref={ref} className={cn("block text-sm font-medium text-gray-700", className)} {...props}>
        {children}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }
);

FormLabel.displayName = "FormLabel";

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    return <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />;
  }
);

FormDescription.displayName = "FormDescription";

interface FormErrorProps extends React.HTMLAttributes<HTMLParagraphElement> {
  error?: string;
}

const FormError = React.forwardRef<HTMLParagraphElement, FormErrorProps>(({ className, error, ...props }, ref) => {
  if (!error) return null;

  return (
    <p ref={ref} className={cn("text-sm font-medium text-red-600", className)} {...props}>
      {error}
    </p>
  );
});

FormError.displayName = "FormError";

const FormActions = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("flex items-center justify-end space-x-2", className)} {...props} />;
  }
);

FormActions.displayName = "FormActions";

export { Form, FormGroup, FormLabel, FormDescription, FormError, FormActions };

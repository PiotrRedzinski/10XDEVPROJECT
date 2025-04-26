import React from "react";
import { cn } from "@/lib/utils";

// Heading components
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

const headingVariants = {
  h1: "text-4xl font-semibold tracking-tight",
  h2: "text-3xl font-semibold tracking-tight",
  h3: "text-2xl font-semibold tracking-tight",
  h4: "text-xl font-semibold tracking-tight",
  h5: "text-lg font-semibold tracking-tight",
  h6: "text-base font-semibold tracking-tight",
};

export const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, as = "h1", children, ...props }, ref) => {
    const Component = as;
    return (
      <Component ref={ref} className={cn(headingVariants[as], "text-gray-900", className)} {...props}>
        {children}
      </Component>
    );
  }
);

Heading.displayName = "Heading";

// Text component
interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  variant?: "default" | "secondary" | "muted" | "small";
}

const textVariants = {
  default: "text-base text-gray-900 leading-7",
  secondary: "text-base text-gray-600 leading-7",
  muted: "text-sm text-gray-500 leading-6",
  small: "text-sm text-gray-900 leading-6",
};

export const Text = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <p ref={ref} className={cn(textVariants[variant], className)} {...props}>
        {children}
      </p>
    );
  }
);

Text.displayName = "Text";

// Display component for larger, more impactful text
interface DisplayProps extends React.HTMLAttributes<HTMLHeadingElement> {
  size?: "1" | "2";
}

const displayVariants = {
  "1": "text-7xl font-semibold tracking-tight",
  "2": "text-6xl font-semibold tracking-tight",
};

export const Display = React.forwardRef<HTMLHeadingElement, DisplayProps>(
  ({ className, size = "1", children, ...props }, ref) => {
    return (
      <h1 ref={ref} className={cn(displayVariants[size], "text-gray-900", className)} {...props}>
        {children}
      </h1>
    );
  }
);

Display.displayName = "Display";

// Label component for form labels and similar text
interface LabelProps extends React.HTMLAttributes<HTMLLabelElement> {
  variant?: "default" | "secondary";
}

const labelVariants = {
  default: "text-sm font-medium text-gray-900",
  secondary: "text-sm font-medium text-gray-700",
};

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <label ref={ref} className={cn(labelVariants[variant], className)} {...props}>
        {children}
      </label>
    );
  }
);

Label.displayName = "Label";

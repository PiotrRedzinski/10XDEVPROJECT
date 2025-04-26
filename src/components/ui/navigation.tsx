import React from "react";
import { cn } from "@/lib/utils";

interface NavigationProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
}

const Navigation = React.forwardRef<HTMLElement, NavigationProps>(
  ({ className, sticky = true, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        className={cn("bg-white border-b border-gray-200", sticky && "sticky top-0 z-40", className)}
        {...props}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">{children}</div>
        </div>
      </nav>
    );
  }
);

Navigation.displayName = "Navigation";

const NavigationBrand = React.forwardRef<HTMLAnchorElement, React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <a ref={ref} className={cn("flex items-center text-xl font-semibold text-gray-900", className)} {...props}>
        {children}
      </a>
    );
  }
);

NavigationBrand.displayName = "NavigationBrand";

const NavigationItems = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("hidden md:flex md:items-center md:space-x-6", className)} {...props}>
        {children}
      </div>
    );
  }
);

NavigationItems.displayName = "NavigationItems";

interface NavigationItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
}

const NavigationItem = React.forwardRef<HTMLAnchorElement, NavigationItemProps>(
  ({ className, active, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          "inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200",
          active
            ? "border-b-2 border-[#FF5A5F] text-gray-900"
            : "text-gray-500 hover:border-b-2 hover:border-gray-300 hover:text-gray-700",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

NavigationItem.displayName = "NavigationItem";

const NavigationMobileToggle = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "md:hidden inline-flex items-center justify-center rounded-md p-2 text-gray-400",
          "hover:bg-gray-100 hover:text-gray-500",
          "focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF5A5F]",
          className
        )}
        {...props}
      >
        <span className="sr-only">Open main menu</span>
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
    );
  }
);

NavigationMobileToggle.displayName = "NavigationMobileToggle";

const NavigationMobileMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "md:hidden",
          "absolute inset-x-0 top-full bg-white border-b border-gray-200",
          "transition transform origin-top",
          className
        )}
        {...props}
      >
        <div className="space-y-1 pb-3 pt-2">{children}</div>
      </div>
    );
  }
);

NavigationMobileMenu.displayName = "NavigationMobileMenu";

export { Navigation, NavigationBrand, NavigationItems, NavigationItem, NavigationMobileToggle, NavigationMobileMenu };

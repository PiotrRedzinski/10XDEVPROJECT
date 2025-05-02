import React from "react";
import { cn } from "@/lib/utils";

interface ListProps extends React.OlHTMLAttributes<HTMLUListElement> {
  variant?: "default" | "separated";
}

const List = React.forwardRef<HTMLUListElement, ListProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <ul
        ref={ref}
        className={cn("space-y-1", variant === "separated" && "divide-y divide-gray-200", className)}
        {...props}
      >
        {children}
      </ul>
    );
  }
);

List.displayName = "List";

interface ListItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  interactive?: boolean;
}

const ListItem = React.forwardRef<HTMLLIElement, ListItemProps>(
  ({ className, interactive = false, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn(
          "py-3",
          interactive && "transition-colors duration-200 hover:bg-gray-50 cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </li>
    );
  }
);

ListItem.displayName = "ListItem";

const ListItemTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, children, ...props }, ref) => (
    <h4 ref={ref} className={cn("text-sm font-medium text-gray-900", className)} {...props}>
      {children}
    </h4>
  )
);

ListItemTitle.displayName = "ListItemTitle";

const ListItemDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-gray-500", className)} {...props} />
);

ListItemDescription.displayName = "ListItemDescription";

const ListItemIcon = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100", className)}
      {...props}
    />
  )
);

ListItemIcon.displayName = "ListItemIcon";

export { List, ListItem, ListItemTitle, ListItemDescription, ListItemIcon };

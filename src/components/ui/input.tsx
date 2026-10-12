import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn("h-11 w-full rounded-xl border border-white/10 bg-white/6 px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-brand-400 focus:ring-2 focus:ring-brand-400/20", className)}
      {...props}
    />
  ),
);
Input.displayName = "Input";

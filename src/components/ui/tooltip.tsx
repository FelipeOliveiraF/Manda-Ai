import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;

export function TooltipContent({ children, ...props }: TooltipPrimitive.TooltipContentProps) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content sideOffset={8} className="z-50 rounded-lg bg-black px-2.5 py-1.5 text-xs font-medium text-white shadow-xl" {...props}>
        {children}
        <TooltipPrimitive.Arrow className="fill-black" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

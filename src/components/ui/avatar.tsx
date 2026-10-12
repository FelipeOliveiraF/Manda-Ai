import { cn } from "../../lib/utils";

interface AvatarProps {
  name: string;
  src?: string;
  className?: string;
}

export function Avatar({ name, src, className }: AvatarProps) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
  return (
    <span className={cn("inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-500 font-bold text-white", className)} aria-label={name}>
      {src ? <img className="size-full object-cover" src={src} alt="" /> : initials}
    </span>
  );
}

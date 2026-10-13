type BrandIconProps = {
  className?: string;
  title?: string;
};

export function MostraAiMark({ className = "", title }: BrandIconProps) {
  return (
    <svg
      className={`mostra-ai-mark ${className}`.trim()}
      viewBox="0 0 48 48"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M10 8.5h28a6.5 6.5 0 0 1 6.5 6.5v16a6.5 6.5 0 0 1-6.5 6.5H25.5L16 44v-6.5h-6A6.5 6.5 0 0 1 3.5 31V15A6.5 6.5 0 0 1 10 8.5Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M13.5 28.5v-11L24 26l10.5-8.5v11" stroke="currentColor" strokeWidth="3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MostraAiChatIcon({ className = "", title }: BrandIconProps) {
  return (
    <svg
      className={`mostra-ai-chat-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M6.5 4.5h10A4.5 4.5 0 0 1 21 9v4a4.5 4.5 0 0 1-4.5 4.5H12L7.5 21v-3.5h-1A4.5 4.5 0 0 1 2 13V9a4.5 4.5 0 0 1 4.5-4.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7 9h10M7 13h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17.5 3v3M16 4.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function MostraAiRoomIcon({ className = "", title }: BrandIconProps) {
  return (
    <svg
      className={`mostra-ai-room-icon ${className}`.trim()}
      viewBox="0 0 24 24"
      fill="none"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d="M4 5.5h16a2.5 2.5 0 0 1 2.5 2.5v8a2.5 2.5 0 0 1-2.5 2.5h-7L8 22v-3.5H4A2.5 2.5 0 0 1 1.5 16V8A2.5 2.5 0 0 1 4 5.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M6.5 15V9l5.5 4 5.5-4v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

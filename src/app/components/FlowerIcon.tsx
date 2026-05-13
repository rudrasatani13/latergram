export function FlowerIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
      <circle cx="12" cy="6" r="2.5" fill="currentColor" opacity="0.8" />
      <circle cx="12" cy="18" r="2.5" fill="currentColor" opacity="0.8" />
      <circle cx="6" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
      <circle cx="18" cy="12" r="2.5" fill="currentColor" opacity="0.8" />
      <circle cx="8.5" cy="8.5" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="15.5" cy="8.5" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="8.5" cy="15.5" r="2" fill="currentColor" opacity="0.6" />
      <circle cx="15.5" cy="15.5" r="2" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** Two-tone wordmark: "ResizePhoto" + highlighted "InKB" so the long name stays readable. */
export default function BrandName({ dark = false, className = "" }: { dark?: boolean; className?: string }) {
  return (
    <span className={`font-display font-extrabold tracking-tight ${className}`}>
      <span className={dark ? "text-card" : "text-ink"}>ResizePhoto</span>
      <span className={dark ? "text-marker" : "text-pen"}>InKB</span>
    </span>
  );
}

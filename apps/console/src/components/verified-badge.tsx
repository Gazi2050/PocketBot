import { IconRosetteDiscountCheckFilled } from "@tabler/icons-react";

/** The blue checkmark for integrations made by PocketBot (admin-submitted). */
export function VerifiedBadge({
  size = 14,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <span
      title="Verified — made by PocketBot"
      className={`inline-flex shrink-0 text-[#0c82f2] ${className}`}
    >
      <IconRosetteDiscountCheckFilled size={size} aria-label="Verified" />
    </span>
  );
}

import { MessageCircle } from "lucide-react";
import { getVehicleInquiryUrl } from "@/lib/site-config";

interface WhatsAppCTAProps {
  vehicleName: string;
  landedLabel: string;
  className?: string;
  compact?: boolean;
  onClick?: (event: React.MouseEvent) => void;
}

/** Primary emerald WhatsApp dispatch link, prefilled with the vehicle name
 * and landed price — stops click-through to any parent card handler. */
export function WhatsAppCTA({
  vehicleName,
  landedLabel,
  className = "",
  compact = false,
  onClick,
}: WhatsAppCTAProps) {
  const href = getVehicleInquiryUrl(vehicleName, landedLabel);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.(event);
      }}
      className={`flex items-center justify-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500 text-[10px] font-medium uppercase tracking-widest text-zinc-950 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4),0_8px_24px_rgba(16,185,129,0.25)] transition-all duration-300 hover:bg-emerald-400 ${
        compact ? "px-3 py-2" : "min-h-[44px] px-4 py-3"
      } ${className}`}
    >
      <MessageCircle className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
      WhatsApp Modfem
    </a>
  );
}

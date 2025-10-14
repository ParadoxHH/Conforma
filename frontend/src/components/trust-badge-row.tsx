import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const badges = [
  {
    text: "Texas-Only",
    tooltip: "Conforma is currently available only for projects within the state of Texas.",
  },
  {
    text: "Audit Trail on Every Milestone",
    tooltip: "All actions are logged for a transparent and verifiable history.",
  },
];

type TrustBadgeRowProps = {
  className?: string;
};

export function TrustBadgeRow({ className }: TrustBadgeRowProps) {
  return (
    <div className={cn("flex w-full justify-center", className)}>
      <div className="flex w-full max-w-3xl flex-wrap items-center justify-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-4 text-sm font-semibold text-slate-600 shadow-sm shadow-slate-900/5 backdrop-blur">
        <TooltipProvider>
          {badges.map((badge) => (
            <Tooltip key={badge.text}>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100/60 px-4 py-1.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-800">
                  <span className="h-2 w-2 rounded-full bg-primary/70" />
                  {badge.text}
                </span>
              </TooltipTrigger>
              <TooltipContent className="text-slate-600">
                <p>{badge.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>
    </div>
  );
}

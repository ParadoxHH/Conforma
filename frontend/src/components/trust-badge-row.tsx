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

export function TrustBadgeRow() {
  return (
    <div className="flex justify-center items-center space-x-4 py-4">
      <TooltipProvider>
        {badges.map((badge) => (
          <Tooltip key={badge.text}>
            <TooltipTrigger asChild>
              <span className="text-sm font-medium text-slate-600 cursor-default">
                {badge.text}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{badge.tooltip}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
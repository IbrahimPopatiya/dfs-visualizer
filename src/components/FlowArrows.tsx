import { motion } from "framer-motion";

interface FlowArrowsProps {
  action: string;
}

function AnimatedArrow({
  label,
  direction,
  isActive,
}: {
  label: string;
  direction: "right" | "down" | "down-right";
  isActive: boolean;
}) {
  const arrowColor = isActive ? "hsl(var(--primary))" : "hsl(var(--muted-foreground) / 0.3)";
  const labelColor = isActive
    ? "text-primary font-semibold"
    : "text-muted-foreground/40";

  if (direction === "right") {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`font-mono text-[11px] ${labelColor} whitespace-nowrap`}>
          {label}
        </span>
        <svg width="80" height="24" viewBox="0 0 80 24">
          <motion.line
            x1="4"
            y1="12"
            x2="68"
            y2="12"
            stroke={arrowColor}
            strokeWidth={2}
            strokeDasharray={isActive ? "0" : "4 4"}
            animate={{ stroke: arrowColor }}
            transition={{ duration: 0.3 }}
          />
          <motion.polygon
            points="68,6 80,12 68,18"
            fill={arrowColor}
            animate={{ fill: arrowColor }}
            transition={{ duration: 0.3 }}
          />
          {isActive && (
            <motion.circle
              cx="4"
              cy="12"
              r="3"
              fill={arrowColor}
              animate={{ cx: [4, 68] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </svg>
      </div>
    );
  }

  if (direction === "down") {
    return (
      <div className="flex items-center gap-1">
        <svg width="24" height="50" viewBox="0 0 24 50">
          <motion.line
            x1="12"
            y1="4"
            x2="12"
            y2="38"
            stroke={arrowColor}
            strokeWidth={2}
            strokeDasharray={isActive ? "0" : "4 4"}
            animate={{ stroke: arrowColor }}
            transition={{ duration: 0.3 }}
          />
          <motion.polygon
            points="6,38 12,50 18,38"
            fill={arrowColor}
            animate={{ fill: arrowColor }}
            transition={{ duration: 0.3 }}
          />
          {isActive && (
            <motion.circle
              cx="12"
              cy="4"
              r="3"
              fill={arrowColor}
              animate={{ cy: [4, 38] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </svg>
        <span className={`font-mono text-[11px] ${labelColor} whitespace-nowrap`}>
          {label}
        </span>
      </div>
    );
  }

  return null;
}

export default function FlowArrows({ action }: FlowArrowsProps) {
  const isPush = action === "push" || action === "push_neighbors";
  const isPop = action === "pop";
  const isPrint = action === "print";

  return {
    // Arrow from Graph to Stack (push)
    graphToStack: (
      <AnimatedArrow
        label={isPush ? "Push to stack" : "→ Stack"}
        direction="right"
        isActive={isPush}
      />
    ),
    // Arrow from Stack to Current (pop)
    stackToCurrent: (
      <AnimatedArrow
        label={isPop ? "Pop from stack" : "→ Current"}
        direction="down"
        isActive={isPop}
      />
    ),
    // Arrow from Current to Output (print)
    currentToOutput: (
      <AnimatedArrow
        label={isPrint ? "Print node" : "→ Output"}
        direction="down"
        isActive={isPrint}
      />
    ),
  };
}

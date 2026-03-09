import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FlowArrows from "./FlowArrows";

// Graph definition matching the reference images
// a -> c, b; b -> d; c -> e; d -> f
const GRAPH: Record<string, string[]> = {
  a: ["c", "b"],
  b: ["d"],
  c: ["e"],
  d: ["f"],
  e: [],
  f: [],
};

// Node positions for the graph layout
const NODE_POSITIONS: Record<string, { x: number; y: number }> = {
  a: { x: 200, y: 60 },
  c: { x: 340, y: 60 },
  b: { x: 200, y: 180 },
  e: { x: 340, y: 180 },
  d: { x: 200, y: 300 },
  f: { x: 340, y: 300 },
};

const EDGES: [string, string][] = [
  ["a", "c"],
  ["a", "b"],
  ["b", "d"],
  ["c", "e"],
  ["d", "f"],
];

interface DFSStep {
  action: "push" | "pop" | "print" | "check_neighbors" | "push_neighbors" | "done";
  node?: string;
  stack: string[];
  current: string | null;
  printed: string[];
  visited: Set<string>;
  description: string;
  highlightEdge?: [string, string];
  pushingNodes?: string[];
}

function generateDFSSteps(): DFSStep[] {
  const steps: DFSStep[] = [];
  const stack: string[] = [];
  const visited = new Set<string>();
  const printed: string[] = [];

  // Initial state
  steps.push({
    action: "push",
    node: "a",
    stack: [],
    current: null,
    printed: [],
    visited: new Set(),
    description: "Start DFS: Push source node 'a' onto the stack",
  });

  stack.push("a");
  steps.push({
    action: "push",
    node: "a",
    stack: [...stack],
    current: null,
    printed: [],
    visited: new Set(),
    description: "Node 'a' is now on top of the stack",
  });

  while (stack.length > 0) {
    const node = stack.pop()!;

    if (visited.has(node)) {
      steps.push({
        action: "pop",
        node,
        stack: [...stack],
        current: node,
        printed: [...printed],
        visited: new Set(visited),
        description: `Pop '${node}' — already visited, skip it`,
      });
      continue;
    }

    steps.push({
      action: "pop",
      node,
      stack: [...stack],
      current: node,
      printed: [...printed],
      visited: new Set(visited),
      description: `Pop '${node}' from stack → set as current node`,
    });

    visited.add(node);
    printed.push(node);

    steps.push({
      action: "print",
      node,
      stack: [...stack],
      current: node,
      printed: [...printed],
      visited: new Set(visited),
      description: `Mark '${node}' as visited and add to output`,
    });

    const neighbors = GRAPH[node];
    if (neighbors.length > 0) {
      steps.push({
        action: "check_neighbors",
        node,
        stack: [...stack],
        current: node,
        printed: [...printed],
        visited: new Set(visited),
        description: `Check neighbors of '${node}': [${neighbors.join(", ")}]`,
      });

      const toPush: string[] = [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
          toPush.push(neighbor);
        }
      }

      if (toPush.length > 0) {
        steps.push({
          action: "push_neighbors",
          node,
          stack: [...stack],
          current: node,
          printed: [...printed],
          visited: new Set(visited),
          description: `Push unvisited neighbors [${toPush.join(", ")}] onto stack`,
          pushingNodes: toPush,
        });
      }
    } else {
      steps.push({
        action: "check_neighbors",
        node,
        stack: [...stack],
        current: node,
        printed: [...printed],
        visited: new Set(visited),
        description: `Node '${node}' has no unvisited neighbors`,
      });
    }
  }

  steps.push({
    action: "done",
    stack: [],
    current: null,
    printed: [...printed],
    visited: new Set(visited),
    description: "Stack is empty — DFS traversal complete!",
  });

  return steps;
}

const ALL_STEPS = generateDFSSteps();

function GraphEdge({ from, to, isHighlighted }: { from: string; to: string; isHighlighted: boolean }) {
  const start = NODE_POSITIONS[from];
  const end = NODE_POSITIONS[to];
  const r = 24;

  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len;
  const ny = dy / len;

  const x1 = start.x + nx * r;
  const y1 = start.y + ny * r;
  const x2 = end.x - nx * (r + 8);
  const y2 = end.y - ny * (r + 8);

  return (
    <g>
      <defs>
        <marker
          id={`arrow-${from}-${to}`}
          markerWidth="8"
          markerHeight="6"
          refX="8"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 8 3, 0 6"
            fill={isHighlighted ? "hsl(168, 55%, 38%)" : "hsl(20, 10%, 55%)"}
          />
        </marker>
      </defs>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={isHighlighted ? "hsl(168, 55%, 38%)" : "hsl(20, 10%, 55%)"}
        strokeWidth={isHighlighted ? 3 : 2}
        markerEnd={`url(#arrow-${from}-${to})`}
        animate={{
          stroke: isHighlighted ? "hsl(168, 55%, 38%)" : "hsl(20, 10%, 55%)",
          strokeWidth: isHighlighted ? 3 : 2,
        }}
        transition={{ duration: 0.3 }}
      />
    </g>
  );
}

function GraphNode({
  id,
  x,
  y,
  isVisited,
  isCurrent,
  isStart,
}: {
  id: string;
  x: number;
  y: number;
  isVisited: boolean;
  isCurrent: boolean;
  isStart: boolean;
}) {
  const fillColor = isCurrent
    ? "hsl(168, 55%, 38%)"
    : isVisited
    ? "hsl(168, 45%, 60%)"
    : "hsl(0, 0%, 100%)";
  const strokeColor = isCurrent
    ? "hsl(168, 60%, 30%)"
    : isVisited
    ? "hsl(168, 45%, 45%)"
    : "hsl(20, 10%, 65%)";
  const textColor = isCurrent || isVisited ? "white" : "hsl(160, 30%, 15%)";

  return (
    <motion.g
      animate={{
        scale: isCurrent ? 1.15 : 1,
      }}
      style={{ originX: `${x}px`, originY: `${y}px` }}
    >
      {isCurrent && (
        <motion.circle
          cx={x}
          cy={y}
          r={30}
          fill="none"
          stroke="hsl(168, 55%, 38%)"
          strokeWidth={2}
          initial={{ r: 24, opacity: 1 }}
          animate={{ r: 34, opacity: 0 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      )}
      <motion.circle
        cx={x}
        cy={y}
        r={24}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2.5}
        animate={{ fill: fillColor, stroke: strokeColor }}
        transition={{ duration: 0.4 }}
      />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={16}
        fontWeight={700}
        fontFamily="'JetBrains Mono', monospace"
        fill={textColor}
      >
        {id}
      </text>
      {isStart && !isCurrent && !isVisited && (
        <text x={x - 10} y={y - 32} fontSize={18}>
          🌱
        </text>
      )}
    </motion.g>
  );
}

function StackVisual({ stack }: { stack: string[] }) {
  const maxSlots = 6;

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-secondary font-bold text-lg mb-2 font-mono">Stack</h3>
      <div className="relative">
        {/* Push arrow */}
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 text-accent text-2xl"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          ↓
        </motion.div>
        <div className="flex flex-col-reverse border-2 border-border rounded-lg overflow-hidden bg-card min-w-[70px]">
          {Array.from({ length: maxSlots }).map((_, i) => {
            const item = stack[i];
            return (
              <div
                key={i}
                className="w-[70px] h-[40px] border-t border-border flex items-center justify-center first:border-t-0"
              >
                <AnimatePresence mode="popLayout">
                  {item && (
                    <motion.div
                      key={`${item}-${i}`}
                      initial={{ scale: 0, y: -20, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0, x: 30, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="bg-accent text-accent-foreground font-mono font-bold text-lg w-[58px] h-[32px] rounded flex items-center justify-center uppercase"
                    >
                      {item}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        <div className="text-center text-xs text-muted-foreground mt-1">TOP ↑</div>
      </div>
    </div>
  );
}

export default function DFSVisualizer() {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = ALL_STEPS[stepIndex];

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setStepIndex(0);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => Math.min(i + 1, ALL_STEPS.length - 1));
  }, []);

  const prev = useCallback(() => {
    setStepIndex((i) => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setStepIndex((i) => {
          if (i >= ALL_STEPS.length - 1) {
            setIsPlaying(false);
            return i;
          }
          return i + 1;
        });
      }, speed);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, speed]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center py-8 px-4">
      {/* Title */}
      <motion.h1
        className="text-4xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        DFS Algorithm
      </motion.h1>
      <p className="text-muted-foreground font-mono text-sm mb-6">
        Depth-First Search — Step by Step Visualization
      </p>

      {(() => {
        const arrows = FlowArrows({ action: step.action });
        return (
          <div className="flex flex-col lg:flex-row gap-4 items-center w-full max-w-5xl">
            {/* Graph */}
            <div className="flex-1 flex flex-col items-center">
              <div className="bg-card rounded-2xl p-6 shadow-lg border border-border relative">
                <div className="absolute -top-3 left-4 bg-accent text-accent-foreground px-3 py-0.5 rounded-full font-mono text-xs font-bold">
                  Graph
                </div>
                <svg width="440" height="380" viewBox="0 0 440 380">
                  {EDGES.map(([from, to]) => (
                    <GraphEdge
                      key={`${from}-${to}`}
                      from={from}
                      to={to}
                      isHighlighted={step.visited.has(from) && step.visited.has(to)}
                    />
                  ))}
                  {Object.entries(NODE_POSITIONS).map(([id, pos]) => (
                    <GraphNode
                      key={id}
                      id={id}
                      x={pos.x}
                      y={pos.y}
                      isVisited={step.visited.has(id)}
                      isCurrent={step.current === id}
                      isStart={id === "a"}
                    />
                  ))}
                </svg>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-muted-foreground font-mono text-sm">Current Node:</span>
                <AnimatePresence mode="wait">
                  {step.current ? (
                    <motion.span
                      key={step.current}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180 }}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground font-mono font-bold text-xl"
                    >
                      {step.current}
                    </motion.span>
                  ) : (
                    <motion.span key="none" className="text-muted-foreground font-mono">—</motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Flow arrow: Graph → Stack */}
            <div className="hidden lg:flex flex-col items-center justify-start pt-24">
              {arrows.graphToStack}
            </div>

            {/* Right side: Stack + arrows + Output */}
            <div className="flex flex-col items-center gap-2">
              <StackVisual stack={step.stack} />
              <div className="flex flex-col items-center">
                {arrows.stackToCurrent}
              </div>
              <div className="flex flex-col items-center">
                <h3 className="text-secondary font-bold text-lg mb-2 font-mono">Output</h3>
                <div className="bg-card rounded-xl border border-border px-4 py-3 min-w-[180px] min-h-[48px] flex items-center gap-1 flex-wrap justify-center relative">
                  <div className="absolute -top-3 right-3 bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-mono text-[10px] font-bold">
                    Printed
                  </div>
                  <AnimatePresence>
                    {step.printed.map((node, i) => (
                      <motion.span
                        key={`${node}-${i}`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-primary-foreground font-mono font-bold text-base"
                      >
                        {node}
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {step.printed.length === 0 && (
                    <span className="text-muted-foreground font-mono text-sm italic">empty</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Description */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mt-6 bg-card border border-border rounded-xl px-6 py-4 max-w-xl text-center shadow"
        >
          <p className="font-mono text-foreground text-sm md:text-base">
            {step.description}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Controls */}
      <div className="mt-6 flex items-center gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-mono text-sm hover:bg-muted transition-colors"
        >
          ⟲ Reset
        </button>
        <button
          onClick={prev}
          disabled={stepIndex === 0}
          className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-mono text-sm hover:bg-muted transition-colors disabled:opacity-30"
        >
          ◀ Prev
        </button>
        {isPlaying ? (
          <button
            onClick={pause}
            className="px-6 py-2 rounded-lg bg-secondary text-secondary-foreground font-mono text-sm font-bold hover:opacity-90 transition-opacity"
          >
            ⏸ Pause
          </button>
        ) : (
          <button
            onClick={play}
            className="px-6 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-sm font-bold hover:opacity-90 transition-opacity"
          >
            ▶ Play
          </button>
        )}
        <button
          onClick={next}
          disabled={stepIndex === ALL_STEPS.length - 1}
          className="px-4 py-2 rounded-lg bg-card border border-border text-foreground font-mono text-sm hover:bg-muted transition-colors disabled:opacity-30"
        >
          Next ▶
        </button>
      </div>

      {/* Speed control */}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-muted-foreground font-mono text-xs">Speed:</span>
        {[2500, 1500, 800].map((s) => (
          <button
            key={s}
            onClick={() => setSpeed(s)}
            className={`px-3 py-1 rounded font-mono text-xs border transition-colors ${
              speed === s
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-border hover:bg-muted"
            }`}
          >
            {s === 2500 ? "Slow" : s === 1500 ? "Normal" : "Fast"}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4 w-full max-w-md">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((stepIndex + 1) / ALL_STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-center text-muted-foreground font-mono text-xs mt-1">
          Step {stepIndex + 1} / {ALL_STEPS.length}
        </p>
      </div>
    </div>
  );
}

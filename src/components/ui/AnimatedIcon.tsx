import { motion, TargetAndTransition, Transition } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AnimatedIconProps {
  icon: LucideIcon;
  size?: number;
  className?: string;
  glowColor?: string;
  animation?: "float" | "pulse" | "spin" | "bounce" | "none";
  hoverAnimation?: "scale" | "rotate" | "glow" | "shake" | "none";
}

const animations: Record<string, TargetAndTransition> = {
  float: {
    y: [0, -8, 0],
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" } as Transition,
  },
  pulse: {
    scale: [1, 1.1, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" } as Transition,
  },
  spin: {
    rotate: 360,
    transition: { duration: 8, repeat: Infinity, ease: "linear" } as Transition,
  },
  bounce: {
    y: [0, -12, 0],
    transition: { duration: 0.6, repeat: Infinity, ease: "easeOut" } as Transition,
  },
  none: {},
};

const hoverAnimations: Record<string, TargetAndTransition> = {
  scale: { scale: 1.2, transition: { duration: 0.2, type: "spring", stiffness: 400 } as Transition },
  rotate: { rotate: 15, scale: 1.1, transition: { duration: 0.2 } as Transition },
  glow: { filter: "drop-shadow(0 0 15px currentColor)", scale: 1.1 },
  shake: { 
    rotate: [0, -10, 10, -10, 10, 0], 
    transition: { duration: 0.5 } as Transition
  },
  none: {},
};

export const AnimatedIcon = ({
  icon: Icon,
  size = 24,
  className = "",
  glowColor = "hsl(145 63% 49%)",
  animation = "none",
  hoverAnimation = "scale",
}: AnimatedIconProps) => {
  return (
    <motion.div
      className={cn("inline-flex items-center justify-center", className)}
      animate={animations[animation]}
      whileHover={hoverAnimations[hoverAnimation]}
      style={{
        filter: animation !== "none" ? `drop-shadow(0 0 10px ${glowColor})` : undefined,
      }}
    >
      <Icon size={size} />
    </motion.div>
  );
};

export default AnimatedIcon;
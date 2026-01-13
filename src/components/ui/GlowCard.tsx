import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlowCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  glowColor?: "primary" | "gold" | "cyan" | "pink" | "violet";
  intensity?: "subtle" | "medium" | "strong";
  hover?: boolean;
  className?: string;
}

const glowColors = {
  primary: {
    glow: "hsl(145 63% 49%)",
    gradient: "from-emerald-500/20 to-cyan-500/10",
  },
  gold: {
    glow: "hsl(45 100% 50%)",
    gradient: "from-amber-500/20 to-yellow-500/10",
  },
  cyan: {
    glow: "hsl(180 80% 50%)",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
  pink: {
    glow: "hsl(330 80% 60%)",
    gradient: "from-pink-500/20 to-rose-500/10",
  },
  violet: {
    glow: "hsl(270 70% 60%)",
    gradient: "from-violet-500/20 to-purple-500/10",
  },
};

const intensityStyles = {
  subtle: { blur: 20, opacity: 0.2 },
  medium: { blur: 30, opacity: 0.35 },
  strong: { blur: 40, opacity: 0.5 },
};

export const GlowCard = ({
  children,
  glowColor = "primary",
  intensity = "medium",
  hover = true,
  className,
  ...props
}: GlowCardProps) => {
  const color = glowColors[glowColor];
  const intensityConfig = intensityStyles[intensity];

  return (
    <motion.div
      className={cn(
        "relative bg-card rounded-xl p-6 border border-border overflow-hidden",
        "transition-all duration-300",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={hover ? { 
        y: -4, 
        scale: 1.01,
        transition: { duration: 0.2 }
      } : undefined}
      {...props}
    >
      {/* Glow effect behind */}
      <motion.div
        className={cn(
          "absolute -inset-1 rounded-xl -z-10",
          `bg-gradient-to-br ${color.gradient}`
        )}
        style={{
          filter: `blur(${intensityConfig.blur}px)`,
          opacity: 0,
        }}
        animate={hover ? undefined : { opacity: intensityConfig.opacity * 0.5 }}
        whileHover={{ opacity: intensityConfig.opacity }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Inner gradient overlay */}
      <motion.div
        className={cn(
          "absolute inset-0 rounded-xl opacity-0",
          `bg-gradient-to-br ${color.gradient}`
        )}
        whileHover={{ opacity: 0.5 }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};

export default GlowCard;
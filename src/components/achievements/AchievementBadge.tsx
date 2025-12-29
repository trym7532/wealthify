import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AchievementBadgeProps {
  icon: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  size?: "sm" | "md" | "lg";
  showProgress?: boolean;
  onClick?: () => void;
}

export default function AchievementBadge({
  icon,
  name,
  description,
  progress,
  target,
  isCompleted,
  size = "md",
  showProgress = true,
  onClick,
}: AchievementBadgeProps) {
  const percentage = Math.min((progress / target) * 100, 100);
  
  const sizeClasses = {
    sm: "w-12 h-12 text-lg",
    md: "w-16 h-16 text-2xl",
    lg: "w-20 h-20 text-3xl",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center gap-2 cursor-pointer"
            onClick={onClick}
          >
            <div className="relative">
              <motion.div
                className={cn(
                  "rounded-full flex items-center justify-center border-2 transition-all duration-300",
                  sizeClasses[size],
                  isCompleted
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 border-primary shadow-[0_0_20px_rgba(46,204,113,0.3)]"
                    : "bg-muted/50 border-border/50 grayscale opacity-60"
                )}
                animate={isCompleted ? { 
                  boxShadow: [
                    "0 0 20px rgba(46,204,113,0.3)",
                    "0 0 30px rgba(46,204,113,0.5)",
                    "0 0 20px rgba(46,204,113,0.3)"
                  ]
                } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className={cn(
                  "transition-all",
                  !isCompleted && "filter grayscale"
                )}>
                  {icon}
                </span>
              </motion.div>
              
              {isCompleted && (
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center shadow-lg"
                >
                  <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </motion.div>
              )}
            </div>
            
            <div className="text-center max-w-[80px]">
              <p className={cn(
                "text-xs font-medium truncate",
                isCompleted ? "text-foreground" : "text-muted-foreground"
              )}>
                {name}
              </p>
              
              {showProgress && !isCompleted && (
                <div className="mt-1 space-y-0.5">
                  <Progress value={percentage} className="h-1 w-16" />
                  <p className="text-[10px] text-muted-foreground">
                    {progress}/{target}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-[200px]">
          <p className="font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
          {!isCompleted && (
            <p className="text-xs text-primary mt-1">
              Progress: {progress}/{target} ({Math.round(percentage)}%)
            </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

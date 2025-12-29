import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Twitter, Facebook, Linkedin, Share2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface AchievementCardProps {
  icon: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  isCompleted: boolean;
  unlockedAt?: string | null;
  category: string;
  onShare?: (platform: "twitter" | "facebook" | "linkedin") => void;
}

export default function AchievementCard({
  icon,
  name,
  description,
  progress,
  target,
  isCompleted,
  unlockedAt,
  category,
  onShare,
}: AchievementCardProps) {
  const percentage = Math.min((progress / target) * 100, 100);

  const categoryColors: Record<string, string> = {
    savings: "from-green-500/20 to-emerald-500/20",
    budgets: "from-blue-500/20 to-cyan-500/20",
    goals: "from-purple-500/20 to-violet-500/20",
    transactions: "from-orange-500/20 to-amber-500/20",
    milestones: "from-pink-500/20 to-rose-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "relative overflow-hidden transition-all duration-300",
        isCompleted 
          ? "border-primary/30 shadow-[0_0_20px_rgba(46,204,113,0.15)]" 
          : "border-border/50 opacity-80"
      )}>
        {/* Gradient background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-30",
          categoryColors[category] || categoryColors.milestones
        )} />
        
        <CardContent className="relative p-4">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <motion.div
              animate={isCompleted ? {
                scale: [1, 1.1, 1],
              } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 border",
                isCompleted
                  ? "bg-primary/10 border-primary/30"
                  : "bg-muted/50 border-border/50 grayscale"
              )}
            >
              {icon}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className={cn(
                    "font-semibold",
                    isCompleted ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {description}
                  </p>
                </div>
                
                {isCompleted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </motion.div>
                )}
              </div>

              {/* Progress */}
              <div className="mt-3 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className={cn(
                    "capitalize px-2 py-0.5 rounded-full text-[10px] font-medium",
                    isCompleted 
                      ? "bg-primary/20 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    {category}
                  </span>
                  <span className="text-muted-foreground">
                    {isCompleted ? "Completed!" : `${progress}/${target}`}
                  </span>
                </div>
                
                <Progress 
                  value={percentage} 
                  className={cn(
                    "h-2",
                    isCompleted && "[&>div]:bg-primary"
                  )}
                />
              </div>

              {/* Unlocked date & Share */}
              {isCompleted && (
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Unlocked {unlockedAt ? format(new Date(unlockedAt), "MMM d, yyyy") : "recently"}
                  </span>
                  
                  {onShare && (
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-[#1DA1F2]"
                        onClick={() => onShare("twitter")}
                      >
                        <Twitter className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-[#4267B2]"
                        onClick={() => onShare("facebook")}
                      >
                        <Facebook className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:text-[#0077B5]"
                        onClick={() => onShare("linkedin")}
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

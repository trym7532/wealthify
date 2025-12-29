import { useState } from "react";
import { Target, Trophy, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAchievements } from "@/hooks/useAchievements";
import { Link } from "react-router-dom";

export default function AchievementsWidget() {
  const [open, setOpen] = useState(false);
  const { allAchievements, isLoading } = useAchievements();

  const completedCount = allAchievements.filter(a => a.is_completed).length;
  const totalCount = allAchievements.length;
  const overallProgress = (completedCount / totalCount) * 100;

  // Get recent achievements and in-progress ones
  const recentCompleted = allAchievements
    .filter(a => a.is_completed)
    .slice(0, 3);
  
  const nearCompletion = allAchievements
    .filter(a => !a.is_completed && (a.progress / a.target) >= 0.5)
    .sort((a, b) => (b.progress / b.target) - (a.progress / a.target))
    .slice(0, 3);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-primary/10"
        >
          <Target className="w-5 h-5" />
          {completedCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {completedCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-80 p-0 bg-card border-border shadow-xl z-[100]"
        sideOffset={8}
      >
        {/* Header with overall progress */}
        <div className="p-4 border-b border-border bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Achievements</h3>
              <p className="text-xs text-muted-foreground">
                {completedCount} of {totalCount} unlocked
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-primary">{Math.round(overallProgress)}%</span>
            </div>
          </div>
          <Progress value={overallProgress} className="h-2 mt-3" />
        </div>
        
        <ScrollArea className="h-[280px]">
          <div className="p-3 space-y-4">
            {/* Near Completion */}
            {nearCompletion.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Almost There
                </p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {nearCompletion.map((achievement, index) => {
                      const percentage = Math.min((achievement.progress / achievement.target) * 100, 100);
                      return (
                        <motion.div
                          key={achievement.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="p-3 rounded-lg bg-muted/50 border border-border hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{achievement.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{achievement.name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Progress value={percentage} className="h-1.5 flex-1" />
                                <span className="text-[10px] text-muted-foreground shrink-0">
                                  {achievement.progress}/{achievement.target}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Recent Achievements */}
            {recentCompleted.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-1">
                  Recently Unlocked
                </p>
                <div className="space-y-2">
                  <AnimatePresence>
                    {recentCompleted.map((achievement, index) => (
                      <motion.div
                        key={achievement.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                      >
                        <div className="flex items-center gap-3">
                          <motion.span
                            animate={{ 
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ 
                              duration: 2,
                              repeat: Infinity,
                            }}
                            className="text-xl"
                          >
                            {achievement.icon}
                          </motion.span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {achievement.name}
                            </p>
                            <p className="text-[10px] text-primary">
                              Completed!
                            </p>
                          </div>
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Empty State */}
            {recentCompleted.length === 0 && nearCompletion.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Target className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">Start tracking to unlock achievements!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* View All Link */}
        <div className="p-3 border-t border-border">
          <Link 
            to="/hub?tab=achievements" 
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            View All Achievements
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}

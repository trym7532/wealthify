import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementBadge from "@/components/achievements/AchievementBadge";
import AchievementCard from "@/components/achievements/AchievementCard";
import AchievementUnlockedModal from "@/components/achievements/AchievementUnlockedModal";
import { Trophy, Star, TrendingUp, Sparkles, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = [
  { value: "all", label: "All", icon: Star },
  { value: "savings", label: "Savings", icon: TrendingUp },
  { value: "budgets", label: "Budgets", icon: Trophy },
  { value: "goals", label: "Goals", icon: Sparkles },
  { value: "transactions", label: "Transactions", icon: Filter },
  { value: "milestones", label: "Milestones", icon: Star },
];

export default function AchievementsSection() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { 
    allAchievements, 
    isLoading, 
    newlyUnlocked, 
    clearNewlyUnlocked,
    shareToSocial 
  } = useAchievements();

  const completedCount = allAchievements.filter(a => a.is_completed).length;
  const totalCount = allAchievements.length;
  const overallProgress = (completedCount / totalCount) * 100;

  const filteredAchievements = selectedCategory === "all" 
    ? allAchievements 
    : allAchievements.filter(a => a.category === selectedCategory);

  // Separate completed and in-progress achievements
  const completed = filteredAchievements.filter(a => a.is_completed);
  const inProgress = filteredAchievements.filter(a => !a.is_completed);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-muted/50 rounded-xl animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-40 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Unlocked Modal */}
      <AchievementUnlockedModal
        achievement={newlyUnlocked}
        onClose={clearNewlyUnlocked}
        onShare={shareToSocial}
      />

      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-primary/20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
          <CardContent className="relative p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">
                    {completedCount} / {totalCount}
                  </h2>
                  <p className="text-muted-foreground">Achievements Unlocked</p>
                </div>
              </div>
              
              <div className="flex-1 max-w-md">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Overall Progress</span>
                  <span className="font-medium text-primary">{Math.round(overallProgress)}%</span>
                </div>
                <Progress value={overallProgress} className="h-3" />
              </div>
            </div>

            {/* Recent badges preview */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground mb-4">Recent Achievements</p>
              <div className="flex flex-wrap gap-4">
                {completed.slice(0, 5).map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    icon={achievement.icon}
                    name={achievement.name}
                    description={achievement.description}
                    progress={achievement.progress}
                    target={achievement.target}
                    isCompleted={achievement.is_completed}
                    size="sm"
                    showProgress={false}
                  />
                ))}
                {completed.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No achievements yet. Start tracking to unlock your first badge!
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.value}
              value={cat.value}
              className="flex items-center gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <cat.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{cat.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* In Progress */}
              {inProgress.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    In Progress
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {inProgress.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        icon={achievement.icon}
                        name={achievement.name}
                        description={achievement.description}
                        progress={achievement.progress}
                        target={achievement.target}
                        isCompleted={achievement.is_completed}
                        category={achievement.category}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Completed */}
              {completed.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-primary" />
                    Completed
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {completed.map((achievement) => (
                      <AchievementCard
                        key={achievement.id}
                        icon={achievement.icon}
                        name={achievement.name}
                        description={achievement.description}
                        progress={achievement.progress}
                        target={achievement.target}
                        isCompleted={achievement.is_completed}
                        unlockedAt={achievement.unlocked_at}
                        category={achievement.category}
                        onShare={(platform) => shareToSocial(achievement as any, platform)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {filteredAchievements.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                    <Star className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg">No achievements in this category</h3>
                  <p className="text-muted-foreground mt-1">
                    Keep using Wealthify to unlock more achievements!
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
}

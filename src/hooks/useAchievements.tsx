import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useCallback, useState } from "react";

export interface Achievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description: string;
  icon: string;
  progress: number;
  target: number;
  is_completed: boolean;
  category: string;
  unlocked_at: string | null;
  shared_at: string | null;
}

export interface AchievementDefinition {
  type: string;
  name: string;
  description: string;
  icon: string;
  category: "savings" | "budgets" | "goals" | "transactions" | "milestones";
  target: number;
  checkProgress: (data: any) => number;
}

const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  // Savings Achievements
  {
    type: "first_savings",
    name: "First Steps",
    description: "Save your first $100",
    icon: "🌱",
    category: "savings",
    target: 100,
    checkProgress: (data) => data.totalSavings || 0,
  },
  {
    type: "savings_500",
    name: "Building Momentum",
    description: "Save $500 total",
    icon: "💪",
    category: "savings",
    target: 500,
    checkProgress: (data) => data.totalSavings || 0,
  },
  {
    type: "savings_1000",
    name: "Thousand Club",
    description: "Save $1,000 total",
    icon: "🏆",
    category: "savings",
    target: 1000,
    checkProgress: (data) => data.totalSavings || 0,
  },
  {
    type: "savings_5000",
    name: "Money Master",
    description: "Save $5,000 total",
    icon: "💎",
    category: "savings",
    target: 5000,
    checkProgress: (data) => data.totalSavings || 0,
  },
  {
    type: "savings_10000",
    name: "Financial Freedom",
    description: "Save $10,000 total",
    icon: "👑",
    category: "savings",
    target: 10000,
    checkProgress: (data) => data.totalSavings || 0,
  },

  // Budget Achievements
  {
    type: "first_budget",
    name: "Budget Beginner",
    description: "Create your first budget",
    icon: "📊",
    category: "budgets",
    target: 1,
    checkProgress: (data) => data.budgetCount || 0,
  },
  {
    type: "budget_master",
    name: "Budget Master",
    description: "Create 5 different budgets",
    icon: "📈",
    category: "budgets",
    target: 5,
    checkProgress: (data) => data.budgetCount || 0,
  },
  {
    type: "under_budget",
    name: "Under Budget",
    description: "Stay under budget for 3 categories",
    icon: "🎯",
    category: "budgets",
    target: 3,
    checkProgress: (data) => data.underBudgetCount || 0,
  },

  // Goals Achievements
  {
    type: "first_goal",
    name: "Goal Setter",
    description: "Create your first financial goal",
    icon: "🎯",
    category: "goals",
    target: 1,
    checkProgress: (data) => data.goalCount || 0,
  },
  {
    type: "goal_achieved",
    name: "Goal Crusher",
    description: "Complete your first goal",
    icon: "🏅",
    category: "goals",
    target: 1,
    checkProgress: (data) => data.completedGoals || 0,
  },
  {
    type: "goals_3",
    name: "Triple Threat",
    description: "Complete 3 financial goals",
    icon: "🔥",
    category: "goals",
    target: 3,
    checkProgress: (data) => data.completedGoals || 0,
  },
  {
    type: "goals_5",
    name: "High Achiever",
    description: "Complete 5 financial goals",
    icon: "⭐",
    category: "goals",
    target: 5,
    checkProgress: (data) => data.completedGoals || 0,
  },

  // Transaction Achievements
  {
    type: "first_transaction",
    name: "Tracker",
    description: "Log your first transaction",
    icon: "📝",
    category: "transactions",
    target: 1,
    checkProgress: (data) => data.transactionCount || 0,
  },
  {
    type: "transactions_50",
    name: "Consistent Logger",
    description: "Log 50 transactions",
    icon: "📋",
    category: "transactions",
    target: 50,
    checkProgress: (data) => data.transactionCount || 0,
  },
  {
    type: "transactions_100",
    name: "Detail Oriented",
    description: "Log 100 transactions",
    icon: "🔍",
    category: "transactions",
    target: 100,
    checkProgress: (data) => data.transactionCount || 0,
  },

  // Milestone Achievements
  {
    type: "first_week",
    name: "Week Warrior",
    description: "Use Wealthify for 7 days",
    icon: "📅",
    category: "milestones",
    target: 7,
    checkProgress: (data) => data.daysActive || 0,
  },
  {
    type: "first_month",
    name: "Monthly Maven",
    description: "Use Wealthify for 30 days",
    icon: "🗓️",
    category: "milestones",
    target: 30,
    checkProgress: (data) => data.daysActive || 0,
  },
  {
    type: "net_worth_positive",
    name: "In The Green",
    description: "Achieve positive net worth",
    icon: "💚",
    category: "milestones",
    target: 1,
    checkProgress: (data) => (data.netWorth > 0 ? 1 : 0),
  },
];

export function useAchievements() {
  const queryClient = useQueryClient();
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);

  // Fetch existing achievements
  const { data: achievements = [], isLoading } = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;
      return data as Achievement[];
    },
  });

  // Fetch user stats for progress calculation
  const { data: userStats } = useQuery({
    queryKey: ["userStats"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const [
        { data: accounts },
        { data: transactions },
        { data: goals },
        { data: budgets },
        { data: profile },
      ] = await Promise.all([
        supabase.from("linked_accounts").select("balance").eq("user_id", user.id),
        supabase.from("transactions").select("*").eq("user_id", user.id),
        supabase.from("financial_goals").select("*").eq("user_id", user.id),
        supabase.from("budgets").select("*").eq("user_id", user.id),
        supabase.from("profiles").select("created_at").eq("id", user.id).single(),
      ]);

      const totalBalance = accounts?.reduce((sum, acc) => sum + Number(acc.balance), 0) || 0;
      const completedGoals = goals?.filter(g => Number(g.current_amount) >= Number(g.target_amount)).length || 0;
      
      // Calculate days active
      const createdAt = profile?.created_at ? new Date(profile.created_at) : new Date();
      const daysActive = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      // Calculate under budget categories
      const underBudgetCount = budgets?.filter(b => {
        const spent = transactions
          ?.filter(t => t.category === b.category && t.transaction_type === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
        return spent < Number(b.limit_amount);
      }).length || 0;

      return {
        totalSavings: totalBalance,
        transactionCount: transactions?.length || 0,
        goalCount: goals?.length || 0,
        completedGoals,
        budgetCount: budgets?.length || 0,
        underBudgetCount,
        daysActive,
        netWorth: totalBalance,
      };
    },
  });

  // Mutation to unlock achievement
  const unlockMutation = useMutation({
    mutationFn: async (achievement: Omit<Achievement, "id" | "unlocked_at" | "shared_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("user_achievements")
        .insert({
          user_id: user.id,
          achievement_type: achievement.achievement_type,
          achievement_name: achievement.achievement_name,
          description: achievement.description,
          icon: achievement.icon,
          progress: achievement.progress,
          target: achievement.target,
          is_completed: true,
          category: achievement.category,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Achievement;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
      setNewlyUnlocked(data);
    },
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      const { data, error } = await supabase
        .from("user_achievements")
        .update({ progress })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  // Share achievement mutation
  const shareMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from("user_achievements")
        .update({ shared_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });

  // Check and unlock achievements
  const checkAchievements = useCallback(() => {
    if (!userStats) return;

    ACHIEVEMENT_DEFINITIONS.forEach((def) => {
      const existing = achievements.find((a) => a.achievement_type === def.type);
      const progress = def.checkProgress(userStats);

      if (!existing && progress >= def.target) {
        // Unlock new achievement
        unlockMutation.mutate({
          achievement_type: def.type,
          achievement_name: def.name,
          description: def.description,
          icon: def.icon,
          progress: progress,
          target: def.target,
          is_completed: true,
          category: def.category,
        });
      }
    });
  }, [userStats, achievements, unlockMutation]);

  // Auto-check achievements when stats change
  useEffect(() => {
    if (userStats) {
      checkAchievements();
    }
  }, [userStats, checkAchievements]);

  // Get all achievements with progress
  const getAllAchievements = useCallback(() => {
    return ACHIEVEMENT_DEFINITIONS.map((def) => {
      const existing = achievements.find((a) => a.achievement_type === def.type);
      const progress = userStats ? def.checkProgress(userStats) : 0;

      return {
        ...def,
        id: existing?.id || def.type,
        progress,
        is_completed: existing?.is_completed || false,
        unlocked_at: existing?.unlocked_at || null,
        shared_at: existing?.shared_at || null,
      };
    });
  }, [achievements, userStats]);

  const clearNewlyUnlocked = useCallback(() => {
    setNewlyUnlocked(null);
  }, []);

  const shareToSocial = useCallback((achievement: Achievement, platform: "twitter" | "facebook" | "linkedin") => {
    const text = `🎉 I just unlocked the "${achievement.achievement_name}" achievement on Wealthify! ${achievement.icon} ${achievement.description}`;
    const url = window.location.origin;

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
    shareMutation.mutate(achievement.id);
  }, [shareMutation]);

  return {
    achievements,
    allAchievements: getAllAchievements(),
    isLoading,
    newlyUnlocked,
    clearNewlyUnlocked,
    checkAchievements,
    shareToSocial,
    userStats,
  };
}

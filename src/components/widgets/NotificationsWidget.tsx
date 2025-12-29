import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "achievement";
  read: boolean;
  created_at: string;
}

export default function NotificationsWidget() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Generate notifications from various sources
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get insights as notifications
      const { data: insights } = await supabase
        .from("ml_insights")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      // Get achievements as notifications
      const { data: achievements } = await supabase
        .from("user_achievements")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_completed", true)
        .order("unlocked_at", { ascending: false })
        .limit(5);

      // Get goals near completion
      const { data: goals } = await supabase
        .from("financial_goals")
        .select("*")
        .eq("user_id", user.id);

      const notifs: Notification[] = [];

      // Add insights as notifications
      insights?.forEach((insight) => {
        notifs.push({
          id: `insight-${insight.id}`,
          title: insight.title,
          message: insight.description,
          type: insight.insight_type === "warning" ? "warning" : "info",
          read: insight.is_read || false,
          created_at: insight.created_at || new Date().toISOString(),
        });
      });

      // Add recent achievements
      achievements?.forEach((ach) => {
        notifs.push({
          id: `achievement-${ach.id}`,
          title: `Achievement Unlocked: ${ach.achievement_name}`,
          message: ach.description || "",
          type: "achievement",
          read: true,
          created_at: ach.unlocked_at,
        });
      });

      // Add goal progress notifications
      goals?.forEach((goal) => {
        const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
        if (progress >= 75 && progress < 100) {
          notifs.push({
            id: `goal-${goal.id}`,
            title: `Almost There! 🎯`,
            message: `Your "${goal.goal_name}" goal is ${Math.round(progress)}% complete`,
            type: "success",
            read: false,
            created_at: goal.updated_at || goal.created_at || new Date().toISOString(),
          });
        }
      });

      return notifs.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      // For insights, mark as read in DB
      if (id.startsWith("insight-")) {
        const insightId = id.replace("insight-", "");
        await supabase
          .from("ml_insights")
          .update({ is_read: true })
          .eq("id", insightId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("ml_insights")
      .update({ is_read: true })
      .eq("user_id", user.id);

    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  };

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-primary/10 border-primary/30 text-primary";
      case "warning":
        return "bg-warning/10 border-warning/30 text-warning";
      case "achievement":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400";
      default:
        return "bg-muted border-border text-muted-foreground";
    }
  };

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "achievement":
        return "🏆";
      case "success":
        return "✅";
      case "warning":
        return "⚠️";
      default:
        return "💡";
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-primary/10"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        align="end" 
        className="w-80 p-0 bg-card border-border shadow-xl z-[100]"
        sideOffset={8}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7"
              onClick={markAllAsRead}
            >
              <Check className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[320px]">
          <AnimatePresence>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Bell className="w-10 h-10 mb-3 opacity-50" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="p-2 space-y-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-3 rounded-lg border transition-all cursor-pointer hover:scale-[1.02]",
                      getTypeStyles(notification.type),
                      !notification.read && "ring-1 ring-primary/50"
                    )}
                    onClick={() => markAsRead.mutate(notification.id)}
                  >
                    <div className="flex gap-3">
                      <span className="text-lg shrink-0">
                        {getTypeIcon(notification.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={cn(
                          "text-sm font-medium truncate",
                          !notification.read && "text-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {notification.message}
                        </p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

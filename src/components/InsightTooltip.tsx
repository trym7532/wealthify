import { ReactNode, useState, useEffect } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Lightbulb } from "lucide-react";

interface InsightTooltipProps {
  children: ReactNode;
  insight: string;
  type?: 'info' | 'warning' | 'success' | 'tip';
  showForNewUsers?: boolean;
  tooltipId?: string;
}

export default function InsightTooltip({ 
  children, 
  insight, 
  type = 'info',
  showForNewUsers = false,
  tooltipId
}: InsightTooltipProps) {
  const [shouldShow, setShouldShow] = useState(false); // Hidden by default; shown only for first-time users

  const { data: profile } = useQuery({
    queryKey: ['user-profile-tutorial'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from('profiles')
        .select('has_seen_tutorial')
        .eq('id', user.id)
        .maybeSingle();
      return data;
    },
    enabled: showForNewUsers,
  });

  useEffect(() => {
    if (showForNewUsers && profile) {
      const isNew = !profile.has_seen_tutorial;
      setShouldShow(isNew);
      // Mark as seen after 3 seconds (user has had time to see the tutorial)
      if (isNew) {
        const timer = setTimeout(async () => {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase.from('profiles').update({ has_seen_tutorial: true }).eq('id', user.id);
          }
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [profile, showForNewUsers]);

  if (showForNewUsers && !shouldShow) {
    return <>{children}</>;
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/95 border-yellow-500/40 text-yellow-950 dark:bg-yellow-500/90 dark:text-yellow-50';
      case 'success':
        return 'bg-green-500/95 border-green-500/40 text-green-950 dark:bg-green-500/90 dark:text-green-50';
      case 'tip':
        return 'bg-primary/95 border-primary/40 text-primary-foreground';
      default:
        return 'bg-popover/95 border-border text-popover-foreground backdrop-blur-sm';
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          className={`max-w-xs p-4 ${getTypeStyles()} border-2 animate-in fade-in-0 zoom-in-95 shadow-lg`}
          sideOffset={8}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium leading-relaxed">{insight}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

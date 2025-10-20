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
  const [shouldShow, setShouldShow] = useState(true);

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
      setShouldShow(!profile.has_seen_tutorial);
    }
  }, [profile, showForNewUsers]);

  if (showForNewUsers && !shouldShow) {
    return <>{children}</>;
  }

  const getTypeStyles = () => {
    switch (type) {
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-200';
      case 'success':
        return 'bg-green-500/10 border-green-500/20 text-green-200';
      case 'tip':
        return 'bg-primary/10 border-primary/20 text-primary';
      default:
        return 'bg-accent/10 border-accent/20 text-accent-foreground';
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent 
          className={`max-w-xs p-3 ${getTypeStyles()} border animate-in fade-in-0 zoom-in-95`}
          sideOffset={8}
        >
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm leading-relaxed">{insight}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

-- Create achievements table for tracking user milestones
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  shared_at TIMESTAMP WITH TIME ZONE,
  progress NUMERIC DEFAULT 0,
  target NUMERIC DEFAULT 1,
  is_completed BOOLEAN DEFAULT false,
  category TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own achievements" 
ON public.user_achievements 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own achievements" 
ON public.user_achievements 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_achievements_user_id ON public.user_achievements(user_id);
CREATE INDEX idx_user_achievements_type ON public.user_achievements(achievement_type);
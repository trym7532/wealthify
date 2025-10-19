-- Add has_seen_tutorial column to profiles table
ALTER TABLE public.profiles
ADD COLUMN has_seen_tutorial BOOLEAN DEFAULT false;

-- Create goals table
CREATE TABLE public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for goals
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for goals
CREATE POLICY "Users can view their own goals"
ON public.goals
FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own goals"
ON public.goals
FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own goals"
ON public.goals
FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete their own goals"
ON public.goals
FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Create trigger for updated_at
CREATE TRIGGER update_goals_updated_at
BEFORE UPDATE ON public.goals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
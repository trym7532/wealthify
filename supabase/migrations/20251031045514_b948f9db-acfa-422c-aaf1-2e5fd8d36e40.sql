-- Create stocks table for user holdings
CREATE TABLE IF NOT EXISTS public.stocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  quantity NUMERIC DEFAULT 0,
  average_price NUMERIC DEFAULT 0,
  current_price NUMERIC DEFAULT 0,
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and policies for stocks
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own stocks"
  ON public.stocks FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own stocks"
  ON public.stocks FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own stocks"
  ON public.stocks FOR UPDATE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own stocks"
  ON public.stocks FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Create stock_suggestions table
CREATE TABLE IF NOT EXISTS public.stock_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  action TEXT,
  reason TEXT,
  confidence NUMERIC,
  target_price NUMERIC,
  current_price NUMERIC,
  sentiment TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Enable RLS and policies for stock_suggestions
ALTER TABLE public.stock_suggestions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  CREATE POLICY "Users can view own stock suggestions"
  ON public.stock_suggestions FOR SELECT
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can insert own stock suggestions"
  ON public.stock_suggestions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can update own stock suggestions"
  ON public.stock_suggestions FOR UPDATE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY "Users can delete own stock suggestions"
  ON public.stock_suggestions FOR DELETE
  USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ensure ml_insights has sentiment column used by UI
ALTER TABLE public.ml_insights ADD COLUMN IF NOT EXISTS sentiment TEXT;

-- Realtime support
ALTER TABLE public.stocks REPLICA IDENTITY FULL;
ALTER TABLE public.stock_suggestions REPLICA IDENTITY FULL;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.stocks;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.stock_suggestions;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
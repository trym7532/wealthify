/*
  # Create Core Financial Tracking Tables

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, primary key, references auth.users)
      - `full_name` (text)
      - `has_seen_tutorial` (boolean, default false)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `linked_accounts` - User's financial accounts
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `account_name` (text)
      - `account_type` (text) - checking, savings, credit_card, investment
      - `institution_name` (text)
      - `balance` (decimal)
      - `is_active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `transactions` - Financial transactions
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `account_id` (uuid, references linked_accounts)
      - `transaction_date` (date)
      - `amount` (decimal)
      - `category` (text)
      - `merchant_name` (text)
      - `description` (text)
      - `transaction_type` (text) - debit, credit
      - `created_at` (timestamptz)
    
    - `budgets` - Budget tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `category` (text)
      - `limit_amount` (decimal)
      - `period` (text) - monthly, weekly, yearly
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `goals` - Financial goals
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `goal_name` (text)
      - `target_amount` (decimal)
      - `current_amount` (decimal, default 0)
      - `target_date` (date)
      - `category` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `ml_insights` - AI-generated financial insights
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `insight_type` (text) - spending_pattern, savings_opportunity, budget_alert, anomaly, prediction
      - `title` (text)
      - `description` (text)
      - `confidence_score` (decimal)
      - `action_items` (jsonb)
      - `is_read` (boolean, default false)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  has_seen_tutorial BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create linked_accounts table
CREATE TABLE IF NOT EXISTS public.linked_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  institution_name TEXT,
  balance DECIMAL(15,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts" ON public.linked_accounts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts" ON public.linked_accounts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts" ON public.linked_accounts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts" ON public.linked_accounts
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_linked_accounts_updated_at
  BEFORE UPDATE ON public.linked_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_id UUID REFERENCES public.linked_accounts(id) ON DELETE SET NULL,
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount DECIMAL(15,2) NOT NULL,
  category TEXT NOT NULL,
  merchant_name TEXT,
  description TEXT,
  transaction_type TEXT NOT NULL DEFAULT 'debit',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions" ON public.transactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create budgets table
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  limit_amount DECIMAL(15,2) NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own budgets" ON public.budgets
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own budgets" ON public.budgets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create goals table
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  target_date DATE,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON public.goals
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" ON public.goals
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON public.goals
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON public.goals
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create ml_insights table
CREATE TABLE IF NOT EXISTS public.ml_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  confidence_score DECIMAL(3,2) DEFAULT 0.5,
  action_items JSONB DEFAULT '[]'::jsonb,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ml_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights" ON public.ml_insights
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" ON public.ml_insights
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights" ON public.ml_insights
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
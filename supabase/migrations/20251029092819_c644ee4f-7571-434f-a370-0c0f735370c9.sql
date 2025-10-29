-- Fix security warnings by updating functions with proper search_path
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Update the updated_at function
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate all the updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON public.profiles 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_linked_accounts_updated_at ON public.linked_accounts;
CREATE TRIGGER update_linked_accounts_updated_at 
  BEFORE UPDATE ON public.linked_accounts 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_budgets_updated_at ON public.budgets;
CREATE TRIGGER update_budgets_updated_at 
  BEFORE UPDATE ON public.budgets 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_financial_goals_updated_at ON public.financial_goals;
CREATE TRIGGER update_financial_goals_updated_at 
  BEFORE UPDATE ON public.financial_goals 
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_updated_at_column();
-- Add preferred_currency column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_currency TEXT DEFAULT 'USD';

-- Add comment
COMMENT ON COLUMN public.profiles.preferred_currency IS 'User preferred currency for displaying all financial data (USD, EUR, INR, GBP, JPY, etc.)';
-- Add transaction_type column to transactions table
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'debit' CHECK (transaction_type IN ('credit', 'debit'));

-- Update existing transactions to set transaction_type based on amount
UPDATE public.transactions 
SET transaction_type = CASE 
  WHEN amount >= 0 THEN 'credit'
  ELSE 'debit'
END
WHERE transaction_type IS NULL;
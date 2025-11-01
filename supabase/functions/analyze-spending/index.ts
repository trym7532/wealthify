import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's transactions, budgets, and accounts
    const [transactions, budgets, accounts] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id)
        .order('transaction_date', { ascending: false }).limit(200),
      supabase.from('budgets').select('*').eq('user_id', user.id),
      supabase.from('linked_accounts').select('*').eq('user_id', user.id)
    ]);

    // Calculate spending patterns
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthTx = transactions.data?.filter((tx: any) => 
      new Date(tx.transaction_date) >= currentMonthStart && parseFloat(tx.amount) < 0
    ) || [];

    const lastMonthTx = transactions.data?.filter((tx: any) => 
      new Date(tx.transaction_date) >= lastMonthStart && 
      new Date(tx.transaction_date) <= lastMonthEnd &&
      parseFloat(tx.amount) < 0
    ) || [];

    const currentMonthSpending = currentMonthTx.reduce((sum: number, tx: any) => 
      sum + Math.abs(parseFloat(tx.amount)), 0
    );

    const lastMonthSpending = lastMonthTx.reduce((sum: number, tx: any) => 
      sum + Math.abs(parseFloat(tx.amount)), 0
    );

    // Group by category
    const spendingByCategory: Record<string, number> = {};
    currentMonthTx.forEach((tx: any) => {
      spendingByCategory[tx.category] = (spendingByCategory[tx.category] || 0) + Math.abs(parseFloat(tx.amount));
    });

    // Calculate days into month
    const daysIntoMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const prompt = `You are an expert financial advisor AI. Analyze this user's spending patterns and provide insights about budget risks.

USER SPENDING DATA:
- Current Month Spending (${daysIntoMonth} days): $${currentMonthSpending.toFixed(2)}
- Last Month Total: $${lastMonthSpending.toFixed(2)}
- Days into current month: ${daysIntoMonth} of ${daysInMonth}
- Projected month-end spending at current rate: $${(currentMonthSpending / daysIntoMonth * daysInMonth).toFixed(2)}

SPENDING BY CATEGORY (Current Month):
${JSON.stringify(spendingByCategory, null, 2)}

BUDGETS:
${JSON.stringify(budgets.data || [], null, 2)}

RECENT TRANSACTIONS:
${JSON.stringify(currentMonthTx.slice(0, 20), null, 2)}

Analyze:
1. Which budgets are at risk of being exceeded?
2. Are there unusual spending patterns?
3. What specific actions should the user take?
4. Based on current spending rate, predict end-of-month totals by category

Return JSON with this structure:
{
  "predictions": [
    {
      "category": "Groceries",
      "current_spent": 450.00,
      "budget_limit": 500.00,
      "predicted_total": 620.00,
      "risk_level": "high|medium|low",
      "message": "Clear warning or advice",
      "action_items": ["Specific action 1", "Specific action 2"]
    }
  ],
  "overall_insight": "Summary of spending health",
  "total_predicted_overspend": 120.00
}

Be specific, actionable, and realistic.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a financial advisor. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      console.error('AI API error:', aiResponse.status, await aiResponse.text());
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    let parsedPredictions;
    try {
      parsedPredictions = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      ...parsedPredictions,
      analyzed_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-spending function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

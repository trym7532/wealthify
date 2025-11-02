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

    // Fetch user's financial data for comprehensive analysis
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const [transactions, goals, budgets, accounts] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', user.id)
        .gte('transaction_date', ninetyDaysAgo.toISOString().split('T')[0])
        .order('transaction_date', { ascending: false }),
      supabase.from('financial_goals').select('*').eq('user_id', user.id),
      supabase.from('budgets').select('*').eq('user_id', user.id),
      supabase.from('linked_accounts').select('*').eq('user_id', user.id)
    ]);

    if (transactions.error || !transactions.data || transactions.data.length === 0) {
      return new Response(JSON.stringify({ 
        insights: [],
        message: 'Not enough transaction data for analysis'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate spending patterns
    const categoryTotals: Record<string, number> = {};
    const monthlySpending: Record<string, number> = {};
    let totalSpending = 0;
    let totalIncome = 0;

    transactions.data.forEach((tx: any) => {
      const amount = parseFloat(tx.amount);
      const month = tx.transaction_date.substring(0, 7);
      
      if (amount < 0) {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(amount);
        monthlySpending[month] = (monthlySpending[month] || 0) + Math.abs(amount);
        totalSpending += Math.abs(amount);
      } else {
        totalIncome += amount;
      }
    });

    // Calculate budget status
    const thisMonth = new Date().toISOString().substring(0, 7);
    const budgetAnalysis = budgets.data?.map((budget: any) => {
      const spent = categoryTotals[budget.category] || 0;
      const limit = parseFloat(budget.limit_amount);
      return {
        category: budget.category,
        spent,
        limit,
        percentage: (spent / limit) * 100,
        overBudget: spent > limit
      };
    }) || [];

    // Calculate goal progress
    const goalProgress = goals.data?.map((goal: any) => {
      const current = parseFloat(goal.current_amount);
      const target = parseFloat(goal.target_amount);
      const progress = (current / target) * 100;
      const remaining = target - current;
      
      // Calculate if on track based on target date
      let onTrack = true;
      if (goal.target_date) {
        const daysToTarget = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const monthlyRequired = remaining / (daysToTarget / 30);
        const currentMonthlyAverage = totalIncome - totalSpending;
        onTrack = currentMonthlyAverage >= monthlyRequired;
      }
      
      return {
        name: goal.goal_name,
        progress,
        remaining,
        onTrack,
        target: target
      };
    }) || [];

    const prompt = `You are an expert financial advisor AI. Analyze this user's financial data and provide 5-8 actionable insights.

FINANCIAL DATA:
- Total Spending (90 days): $${totalSpending.toFixed(2)}
- Total Income (90 days): $${totalIncome.toFixed(2)}
- Net Savings: $${(totalIncome - totalSpending).toFixed(2)}
- Spending by Category: ${JSON.stringify(categoryTotals)}
- Monthly Spending Trend: ${JSON.stringify(monthlySpending)}

BUDGET STATUS:
${JSON.stringify(budgetAnalysis, null, 2)}

FINANCIAL GOALS:
${JSON.stringify(goalProgress, null, 2)}

ACCOUNTS:
- Total Accounts: ${accounts.data?.length || 0}
- Total Balance: $${accounts.data?.reduce((sum: number, acc: any) => sum + parseFloat(acc.balance), 0).toFixed(2) || 0}

Provide diverse insights covering:
1. Spending patterns and anomalies
2. Budget alerts (over-budget warnings)
3. Savings opportunities (where to cut costs)
4. Goal progress tracking and predictions
5. Behavior analysis and improvement suggestions
6. Spending predictions and warnings
7. Positive reinforcement for good habits
8. Specific actionable recommendations

Return JSON with this structure:
{
  "insights": [
    {
      "type": "spending_pattern|budget_alert|savings_opportunity|goal_warning|anomaly|prediction|encouragement|recommendation",
      "title": "Brief title (max 50 chars)",
      "description": "Detailed explanation (max 200 chars)",
      "confidence": 0.85,
      "sentiment": "positive|negative|warning|neutral",
      "action_items": ["Action 1", "Action 2"]
    }
  ]
}

Make insights specific, actionable, and based on actual data. Use 'positive' sentiment for achievements, 'negative' for concerning patterns, 'warning' for urgent alerts, and 'neutral' for general suggestions.`;

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
      const text = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, text);
      // Propagate rate limit / payment errors to client
      const status = aiResponse.status === 429 || aiResponse.status === 402 ? aiResponse.status : 500;
      const body = (() => { try { return JSON.parse(text); } catch { return { error: text || 'AI analysis failed' }; } })();
      return new Response(JSON.stringify(body), {
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices[0].message.content || '';

    const cleanJson = (input: string) => {
      let s = input.trim();
      if (s.startsWith('```')) {
        s = s.replace(/^```[a-zA-Z]*\n?/,'').replace(/```$/,'').trim();
      }
      const start = s.indexOf('{');
      const end = s.lastIndexOf('}');
      if (start !== -1 && end !== -1) s = s.slice(start, end + 1);
      return s;
    };

    let parsedInsights;
    try {
      parsedInsights = JSON.parse(cleanJson(rawContent));
    } catch (parseError) {
      console.error('Failed to parse AI response:', rawContent);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete old insights for this user
    await supabase.from('ml_insights').delete().eq('user_id', user.id);

    // Store new insights
    const insightsToStore = parsedInsights.insights.map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      confidence_score: insight.confidence,
      action_items: insight.action_items,
      sentiment: insight.sentiment || 'neutral',
      is_read: false,
    }));

    const { data: storedInsights, error: storeError } = await supabase
      .from('ml_insights')
      .insert(insightsToStore)
      .select();

    if (storeError) {
      console.error('Error storing insights:', storeError);
    }

    return new Response(JSON.stringify({ 
      insights: storedInsights || insightsToStore,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

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

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .gte('transaction_date', ninetyDaysAgo.toISOString().split('T')[0])
      .order('transaction_date', { ascending: false });

    if (txError) {
      console.error('Error fetching transactions:', txError);
      return new Response(JSON.stringify({ error: 'Failed to fetch transactions' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({
        insights: [],
        message: 'Not enough transaction data for analysis'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: budgets } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', user.id);

    const { data: goals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id);

    const categoryTotals: Record<string, number> = {};
    const monthlyTotals: Record<string, number> = {};

    transactions.forEach((tx: any) => {
      const amount = Math.abs(parseFloat(tx.amount));
      categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + amount;

      const month = tx.transaction_date.substring(0, 7);
      monthlyTotals[month] = (monthlyTotals[month] || 0) + amount;
    });

    const totalSpending = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    const avgMonthlySpending = Object.values(monthlyTotals).reduce((sum, val) => sum + val, 0) / Math.max(Object.keys(monthlyTotals).length, 1);

    const insights: any[] = [];

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      const [category, amount] = topCategory;
      const percentage = (amount / totalSpending) * 100;
      insights.push({
        type: 'spending_pattern',
        title: `${category} dominates your spending`,
        description: `${percentage.toFixed(0)}% of your spending ($${amount.toFixed(2)}) goes to ${category}. Consider if this aligns with your priorities.`,
        confidence: 0.95,
        action_items: [
          `Review ${category} expenses for potential savings`,
          'Set a budget limit for this category'
        ]
      });
    }

    if (budgets && budgets.length > 0) {
      const currentMonth = new Date().toISOString().substring(0, 7);
      const thisMonthTransactions = transactions.filter(tx => tx.transaction_date.startsWith(currentMonth));
      const thisMonthSpending: Record<string, number> = {};

      thisMonthTransactions.forEach(tx => {
        if (parseFloat(tx.amount) < 0) {
          thisMonthSpending[tx.category] = (thisMonthSpending[tx.category] || 0) + Math.abs(parseFloat(tx.amount));
        }
      });

      budgets.forEach((budget: any) => {
        const spent = thisMonthSpending[budget.category] || 0;
        const limit = parseFloat(budget.limit_amount);
        const percentage = (spent / limit) * 100;

        if (percentage > 90 && percentage <= 100) {
          insights.push({
            type: 'budget_alert',
            title: `Approaching ${budget.category} budget limit`,
            description: `You've used ${percentage.toFixed(0)}% ($${spent.toFixed(2)} of $${limit.toFixed(2)}) of your ${budget.category} budget.`,
            confidence: 0.98,
            action_items: [
              'Review upcoming expenses in this category',
              'Consider postponing non-essential purchases'
            ]
          });
        } else if (percentage > 100) {
          insights.push({
            type: 'budget_alert',
            title: `${budget.category} budget exceeded!`,
            description: `You've spent $${spent.toFixed(2)}, which is ${(percentage - 100).toFixed(0)}% over your $${limit.toFixed(2)} budget.`,
            confidence: 1.0,
            action_items: [
              'Identify what caused the overspending',
              'Adjust budget or reduce spending next month'
            ]
          });
        }
      });
    }

    const monthlyAmounts = Object.values(monthlyTotals);
    if (monthlyAmounts.length >= 2) {
      const lastMonth = monthlyAmounts[monthlyAmounts.length - 1];
      const prevMonth = monthlyAmounts[monthlyAmounts.length - 2];
      const change = ((lastMonth - prevMonth) / prevMonth) * 100;

      if (Math.abs(change) > 20) {
        insights.push({
          type: change > 0 ? 'spending_pattern' : 'savings_opportunity',
          title: change > 0 ? 'Spending increased significantly' : 'Excellent spending reduction!',
          description: `Your spending ${change > 0 ? 'increased' : 'decreased'} by ${Math.abs(change).toFixed(0)}% compared to last month (${change > 0 ? 'from' : 'to'} $${prevMonth.toFixed(2)} ${change > 0 ? 'to' : 'from'} $${lastMonth.toFixed(2)}).`,
          confidence: 0.92,
          action_items: change > 0
            ? ['Identify new recurring expenses', 'Review recent large purchases']
            : ['Maintain current spending habits', 'Consider saving the difference']
        });
      }
    }

    if (totalSpending < avgMonthlySpending * 0.7) {
      const savingsOpportunity = avgMonthlySpending - totalSpending;
      insights.push({
        type: 'savings_opportunity',
        title: 'Great month for savings!',
        description: `You're spending $${savingsOpportunity.toFixed(2)} less than your average. Consider moving this to savings or investments.`,
        confidence: 0.88,
        action_items: [
          'Transfer extra funds to savings account',
          'Consider investing the difference'
        ]
      });
    }

    if (goals && goals.length > 0) {
      goals.forEach((goal: any) => {
        const progress = (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100;
        if (goal.target_date) {
          const daysLeft = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
          const remaining = parseFloat(goal.target_amount) - parseFloat(goal.current_amount);
          const monthlyRequired = (remaining / (daysLeft / 30));

          if (monthlyRequired > avgMonthlySpending * 0.3) {
            insights.push({
              type: 'prediction',
              title: `${goal.goal_name} may be challenging`,
              description: `To reach your goal, you need to save $${monthlyRequired.toFixed(2)}/month. This is ${((monthlyRequired / avgMonthlySpending) * 100).toFixed(0)}% of your current spending.`,
              confidence: 0.85,
              action_items: [
                'Consider extending target date',
                'Look for ways to increase income or reduce expenses'
              ]
            });
          }
        }
      });
    }

    const recentTransactions = transactions.slice(0, 20);
    const merchants: Record<string, number> = {};
    recentTransactions.forEach(tx => {
      if (tx.merchant_name) {
        merchants[tx.merchant_name] = (merchants[tx.merchant_name] || 0) + Math.abs(parseFloat(tx.amount));
      }
    });

    const topMerchant = Object.entries(merchants).sort((a, b) => b[1] - a[1])[0];
    if (topMerchant && merchants[topMerchant[0]] > avgMonthlySpending * 0.15) {
      insights.push({
        type: 'spending_pattern',
        title: `Frequent purchases at ${topMerchant[0]}`,
        description: `You've spent $${topMerchant[1].toFixed(2)} at ${topMerchant[0]} recently. Consider if these are necessary.`,
        confidence: 0.87,
        action_items: [
          'Review if bulk purchases could save money',
          'Look for cheaper alternatives'
        ]
      });
    }

    if (insights.length === 0) {
      insights.push({
        type: 'spending_pattern',
        title: 'Healthy financial habits',
        description: 'Your spending patterns look balanced. Keep up the good work with budgeting and tracking!',
        confidence: 0.8,
        action_items: [
          'Continue monitoring your expenses',
          'Consider setting new financial goals'
        ]
      });
    }

    await supabase
      .from('ml_insights')
      .delete()
      .eq('user_id', user.id);

    const insightsToStore = insights.slice(0, 5).map((insight: any) => ({
      user_id: user.id,
      insight_type: insight.type,
      title: insight.title,
      description: insight.description,
      confidence_score: insight.confidence,
      action_items: insight.action_items,
      is_read: false,
    }));

    const { data: storedInsights, error: storeError } = await supabase
      .from('ml_insights')
      .insert(insightsToStore)
      .select();

    if (storeError) {
      console.error('Error storing insights:', storeError);
      return new Response(JSON.stringify({ error: 'Failed to store insights' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      insights: storedInsights || insightsToStore,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-insights function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
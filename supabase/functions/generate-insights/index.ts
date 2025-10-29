
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const { data: transactions, error: txError } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .gte("transaction_date", ninetyDaysAgo.toISOString().split("T")[0])
      .order("transaction_date", { ascending: false });

    if (txError) {
      console.error("Error fetching transactions:", txError);
      return new Response(JSON.stringify({ error: "Failed to fetch transactions" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: budgets } = await supabase
      .from("budgets")
      .select("*")
      .eq("user_id", user.id);

    const { data: goals } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id);

    if (!transactions || transactions.length === 0) {
      return new Response(JSON.stringify({ 
        insights: [],
        message: "Not enough transaction data for analysis"
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const categoryTotals: Record<string, number> = {};
    let totalSpending = 0;
    let totalIncome = 0;

    transactions.forEach((tx: any) => {
      const amount = parseFloat(tx.amount);
      if (amount < 0) {
        totalSpending += Math.abs(amount);
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + Math.abs(amount);
      } else {
        totalIncome += amount;
      }
    });

    const insights: any[] = [];

    const topSpendingCategory = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => (b as number) - (a as number))[0];

    if (topSpendingCategory) {
      const [category, amount] = topSpendingCategory;
      const percentage = ((amount as number) / totalSpending * 100).toFixed(1);
      insights.push({
        user_id: user.id,
        insight_type: "spending_pattern",
        title: `${category} is your top expense`,
        description: `You've spent $${(amount as number).toFixed(2)} on ${category} in the last 90 days (${percentage}% of total spending). Consider reviewing if this aligns with your priorities.`,
        confidence_score: 0.95,
        action_items: [
          `Review ${category} expenses for potential savings`,
          `Set a budget for ${category} if you haven't already`
        ],
        is_read: false,
      });
    }

    const thisMonth = new Date().toISOString().substring(0, 7);
    const thisMonthSpending: Record<string, number> = {};
    transactions
      .filter((tx: any) => tx.transaction_date.startsWith(thisMonth) && parseFloat(tx.amount) < 0)
      .forEach((tx: any) => {
        thisMonthSpending[tx.category] = (thisMonthSpending[tx.category] || 0) + Math.abs(parseFloat(tx.amount));
      });

    budgets?.forEach((budget: any) => {
      const spent = thisMonthSpending[budget.category] || 0;
      const limit = parseFloat(budget.limit_amount);
      const percentage = (spent / limit) * 100;

      if (percentage > 100) {
        insights.push({
          user_id: user.id,
          insight_type: "budget_alert",
          title: `Over budget in ${budget.category}`,
          description: `You've exceeded your ${budget.category} budget by $${(spent - limit).toFixed(2)} (${percentage.toFixed(0)}% of limit). Time to review your spending in this category.`,
          confidence_score: 1.0,
          action_items: [
            `Reduce ${budget.category} spending for the rest of the month`,
            `Review and adjust budget if needed`
          ],
          is_read: false,
        });
      } else if (percentage > 80) {
        insights.push({
          user_id: user.id,
          insight_type: "budget_alert",
          title: `Approaching ${budget.category} budget limit`,
          description: `You've used ${percentage.toFixed(0)}% of your ${budget.category} budget ($${spent.toFixed(2)} of $${limit.toFixed(2)}). Be mindful of remaining spending.`,
          confidence_score: 0.9,
          action_items: [
            `Monitor ${budget.category} spending closely`,
            `Consider postponing non-essential purchases`
          ],
          is_read: false,
        });
      }
    });

    if (totalIncome > 0) {
      const savingsRate = ((totalIncome - totalSpending) / totalIncome * 100);
      if (savingsRate < 10) {
        insights.push({
          user_id: user.id,
          insight_type: "savings_opportunity",
          title: "Low savings rate detected",
          description: `Your savings rate is ${savingsRate.toFixed(1)}%. Financial experts recommend saving at least 20% of your income. Consider reducing expenses or increasing income.`,
          confidence_score: 0.85,
          action_items: [
            "Identify and cut unnecessary expenses",
            "Set up automatic savings transfers",
            "Review subscriptions and recurring charges"
          ],
          is_read: false,
        });
      } else if (savingsRate >= 20) {
        insights.push({
          user_id: user.id,
          insight_type: "savings_opportunity",
          title: "Excellent savings rate!",
          description: `You're saving ${savingsRate.toFixed(1)}% of your income - well above the recommended 20%. Keep up the great work!`,
          confidence_score: 0.95,
          action_items: [
            "Consider investing surplus savings",
            "Review and update financial goals"
          ],
          is_read: false,
        });
      }
    }

    goals?.forEach((goal: any) => {
      const current = parseFloat(goal.current_amount);
      const target = parseFloat(goal.target_amount);
      const progress = (current / target) * 100;

      if (goal.target_date) {
        const daysRemaining = Math.floor(
          (new Date(goal.target_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        );
        const remaining = target - current;
        const monthlyRequired = daysRemaining > 0 ? (remaining / (daysRemaining / 30)) : remaining;

        if (daysRemaining > 0 && daysRemaining < 90) {
          insights.push({
            user_id: user.id,
            insight_type: "prediction",
            title: `${goal.goal_name} deadline approaching`,
            description: `You have ${daysRemaining} days to reach your goal. You need to save $${monthlyRequired.toFixed(2)}/month to achieve your target of $${target.toFixed(2)}.`,
            confidence_score: 0.9,
            action_items: [
              `Set aside $${monthlyRequired.toFixed(2)} monthly for ${goal.goal_name}`,
              "Review budget for potential savings"
            ],
            is_read: false,
          });
        }
      }
    });

    const avgDailySpending = totalSpending / 90;
    const lastWeekTransactions = transactions.filter((tx: any) => {
      const txDate = new Date(tx.transaction_date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return txDate >= sevenDaysAgo && parseFloat(tx.amount) < 0;
    });
    const lastWeekSpending = lastWeekTransactions.reduce(
      (sum: number, tx: any) => sum + Math.abs(parseFloat(tx.amount)),
      0
    );
    const avgLastWeekDaily = lastWeekSpending / 7;

    if (avgLastWeekDaily > avgDailySpending * 1.5) {
      insights.push({
        user_id: user.id,
        insight_type: "anomaly",
        title: "Unusual spending spike detected",
        description: `Your spending has increased by ${(((avgLastWeekDaily - avgDailySpending) / avgDailySpending) * 100).toFixed(0)}% in the last week compared to your 90-day average. Review recent transactions to ensure everything is expected.`,
        confidence_score: 0.8,
        action_items: [
          "Review recent large transactions",
          "Check for any unauthorized charges"
        ],
        is_read: false,
      });
    }

    if (insights.length === 0) {
      insights.push({
        user_id: user.id,
        insight_type: "spending_pattern",
        title: "You're doing great!",
        description: "Your financial habits look healthy. Keep tracking your expenses and staying within your budgets.",
        confidence_score: 0.7,
        action_items: [
          "Continue monitoring your spending",
          "Consider setting new financial goals"
        ],
        is_read: false,
      });
    }

    await supabase
      .from("ml_insights")
      .delete()
      .eq("user_id", user.id);

    const { data: storedInsights, error: storeError } = await supabase
      .from("ml_insights")
      .insert(insights)
      .select();

    if (storeError) {
      console.error("Error storing insights:", storeError);
    }

    return new Response(JSON.stringify({ 
      insights: storedInsights || insights,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-insights function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
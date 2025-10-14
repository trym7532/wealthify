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

    // Get user from auth header
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

    // Fetch user's last 90 days of transactions
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

    // Prepare transaction summary for AI
    const categoryTotals = transactions.reduce((acc: any, tx: any) => {
      acc[tx.category] = (acc[tx.category] || 0) + parseFloat(tx.amount);
      return acc;
    }, {});

    const totalSpending = Object.values(categoryTotals).reduce((sum: number, val: any) => sum + val, 0);

    const prompt = `You are a financial advisor AI analyzing user transactions. 

Transaction Summary (Last 90 days):
- Total transactions: ${transactions.length}
- Total spending: $${totalSpending.toFixed(2)}
- Category breakdown: ${JSON.stringify(categoryTotals, null, 2)}

Recent transactions sample:
${JSON.stringify(transactions.slice(0, 10), null, 2)}

Analyze and provide 3-5 actionable financial insights. Return JSON with this exact structure:
{
  "insights": [
    {
      "type": "spending_pattern",
      "title": "Brief title (max 50 chars)",
      "description": "Detailed explanation (max 200 chars)",
      "confidence": 0.85,
      "action_items": ["Action 1", "Action 2"]
    }
  ]
}

Valid types: spending_pattern, savings_opportunity, budget_alert, anomaly, prediction`;

    // Call Lovable AI
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
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices[0].message.content;
    
    // Parse AI response
    let parsedInsights;
    try {
      parsedInsights = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete old insights for this user
    await supabase
      .from('ml_insights')
      .delete()
      .eq('user_id', user.id);

    // Store new insights in database
    const insightsToStore = parsedInsights.insights.map((insight: any) => ({
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
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

    // Fetch user's stocks and investment behavior
    const [stocks, transactions, accounts] = await Promise.all([
      supabase.from('stocks').select('*').eq('user_id', user.id),
      supabase.from('transactions').select('*').eq('user_id', user.id)
        .order('transaction_date', { ascending: false }).limit(100),
      supabase.from('linked_accounts').select('*').eq('user_id', user.id)
        .eq('account_type', 'investment')
    ]);

    // Analyze investment behavior
    const totalInvestments = accounts.data?.reduce((sum, acc) => sum + parseFloat(acc.balance), 0) || 0;
    const investmentTransactions = transactions.data?.filter((tx: any) => 
      tx.category === 'Investment' || tx.merchant_name?.includes('Trade')
    ) || [];
    
    const averageInvestmentAmount = investmentTransactions.length > 0
      ? investmentTransactions.reduce((sum: number, tx: any) => sum + Math.abs(parseFloat(tx.amount)), 0) / investmentTransactions.length
      : 0;

    // Calculate risk profile based on behavior
    const monthlyIncome = transactions.data
      ?.filter((tx: any) => parseFloat(tx.amount) > 0)
      .reduce((sum: number, tx: any) => sum + parseFloat(tx.amount), 0) || 0;
    
    const riskProfile = totalInvestments / monthlyIncome > 0.3 ? 'aggressive' : 
                       totalInvestments / monthlyIncome > 0.15 ? 'moderate' : 'conservative';

    const prompt = `You are an expert investment advisor AI. Analyze this user's investment profile and provide 3-5 stock/cryptocurrency suggestions with daily market analysis.

USER INVESTMENT PROFILE:
- Total Investments: $${totalInvestments.toFixed(2)}
- Average Investment Amount: $${averageInvestmentAmount.toFixed(2)}
- Risk Profile: ${riskProfile}
- Number of Investment Transactions: ${investmentTransactions.length}

CURRENT HOLDINGS:
${JSON.stringify(stocks.data || [], null, 2)}

Provide diverse, actionable suggestions including:
1. Growth stocks for aggressive investors
2. Dividend stocks for income
3. ETFs for diversification
4. Cryptocurrencies for high-risk/high-reward
5. Buy/sell recommendations for existing holdings

Consider current market trends, user's risk profile, and investment behavior.

Return JSON with this structure:
{
  "suggestions": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "action": "buy|sell|hold",
      "reason": "Detailed explanation based on market analysis",
      "confidence": 0.85,
      "target_price": 180.50,
      "current_price": 175.25,
      "sentiment": "positive|negative|neutral"
    }
  ]
}

Make suggestions specific, based on current market conditions, and tailored to the user's risk profile.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an investment advisor. Always respond with valid JSON only.' },
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
    
    let parsedSuggestions;
    try {
      parsedSuggestions = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete old suggestions (older than 24 hours)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    await supabase.from('stock_suggestions').delete()
      .eq('user_id', user.id)
      .lt('generated_at', oneDayAgo.toISOString());

    // Store new suggestions with expiration
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const suggestionsToStore = parsedSuggestions.suggestions.map((suggestion: any) => ({
      user_id: user.id,
      symbol: suggestion.symbol,
      name: suggestion.name,
      action: suggestion.action,
      reason: suggestion.reason,
      confidence: suggestion.confidence,
      target_price: suggestion.target_price,
      current_price: suggestion.current_price,
      sentiment: suggestion.sentiment || 'neutral',
      expires_at: expiresAt.toISOString()
    }));

    const { data: storedSuggestions, error: storeError } = await supabase
      .from('stock_suggestions')
      .insert(suggestionsToStore)
      .select();

    if (storeError) {
      console.error('Error storing suggestions:', storeError);
    }

    // Update existing stock prices if applicable
    if (stocks.data && stocks.data.length > 0) {
      for (const stock of stocks.data) {
        const matchingSuggestion = parsedSuggestions.suggestions.find(
          (s: any) => s.symbol === stock.symbol
        );
        if (matchingSuggestion) {
          await supabase
            .from('stocks')
            .update({ 
              current_price: matchingSuggestion.current_price,
              last_updated: new Date().toISOString()
            })
            .eq('id', stock.id);
        }
      }
    }

    return new Response(JSON.stringify({ 
      suggestions: storedSuggestions || suggestionsToStore,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in update-stocks function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

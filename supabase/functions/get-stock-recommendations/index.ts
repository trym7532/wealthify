import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Fetch user's financial profile
    const [investmentsRes, transactionsRes] = await Promise.all([
      supabase.from('linked_accounts').select('*').eq('user_id', user.id).eq('account_type', 'investment'),
      supabase.from('transactions').select('*').eq('user_id', user.id).gte('transaction_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    ]);

    const investments = investmentsRes.data || [];
    const transactions = transactionsRes.data || [];

    const totalInvestments = investments.reduce((sum, inv) => sum + parseFloat(inv.balance.toString()), 0);
    const monthlyIncome = transactions.filter(t => t.transaction_type === 'credit').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const monthlyExpenses = transactions.filter(t => t.transaction_type === 'debit').reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);
    const monthlySavings = monthlyIncome - monthlyExpenses;

    // Determine risk profile
    let riskProfile = 'moderate';
    if (totalInvestments > monthlyIncome * 6 && monthlySavings > monthlyIncome * 0.3) {
      riskProfile = 'aggressive';
    } else if (totalInvestments < monthlyIncome * 3 || monthlySavings < monthlyIncome * 0.15) {
      riskProfile = 'conservative';
    }

    // Generate stock recommendations based on risk profile
    const recommendations = [];

    // Market analysis for buy/sell signals
    const marketTrends = {
      nifty: { current: 23850, change: 1.2, trend: 'bullish' },
      sensex: { current: 78450, change: 1.1, trend: 'bullish' }
    };

    if (riskProfile === 'aggressive') {
      recommendations.push({
        type: 'buy',
        asset: 'stocks',
        title: 'Growth Stock Opportunity',
        description: `With your strong savings rate (₹${monthlySavings.toFixed(2)}/month) and aggressive profile, consider high-growth tech stocks. Market is bullish with Nifty up ${marketTrends.nifty.change}%.`,
        stocks: ['Infosys', 'TCS', 'HDFC Bank'],
        action: 'Buy',
        reasoning: 'Strong fundamentals, consistent growth, market momentum positive',
        risk_level: 'high'
      });

      recommendations.push({
        type: 'hold',
        asset: 'stocks',
        title: 'Hold Quality Stocks',
        description: `Your existing portfolio of ₹${totalInvestments.toFixed(2)} is well-positioned. Hold quality stocks through market volatility.`,
        stocks: investments.map(i => i.institution_name),
        action: 'Hold',
        reasoning: 'Long-term wealth building, avoid panic selling',
        risk_level: 'medium'
      });
    } else if (riskProfile === 'conservative') {
      recommendations.push({
        type: 'buy',
        asset: 'bonds',
        title: 'Safe Investment Options',
        description: `Based on your conservative profile, focus on stable returns. Consider blue-chip stocks and debt funds for steady growth.`,
        stocks: ['HDFC Bank', 'ITC', 'Hindustan Unilever'],
        action: 'Buy',
        reasoning: 'Low volatility, consistent dividends, capital preservation',
        risk_level: 'low'
      });

      recommendations.push({
        type: 'warning',
        asset: 'stocks',
        title: 'Market Volatility Alert',
        description: 'Markets are at highs. Avoid aggressive positions. Focus on SIP investments to average out costs.',
        stocks: [],
        action: 'Wait',
        reasoning: 'Risk management, timing considerations',
        risk_level: 'low'
      });
    } else {
      recommendations.push({
        type: 'buy',
        asset: 'stocks',
        title: 'Balanced Portfolio Expansion',
        description: `Your moderate profile suits a mix of growth and stable stocks. Consider diversifying with ₹${(monthlySavings * 0.4).toFixed(2)}/month SIP.`,
        stocks: ['Reliance', 'ICICI Bank', 'Bajaj Finance'],
        action: 'Buy',
        reasoning: 'Balanced risk-reward, diversification, consistent returns',
        risk_level: 'medium'
      });
    }

    // Check for specific sell signals based on existing investments
    if (investments.length > 0) {
      const overConcentrated = investments.some(inv => {
        const percentage = (parseFloat(inv.balance.toString()) / totalInvestments) * 100;
        return percentage > 40;
      });

      if (overConcentrated) {
        recommendations.push({
          type: 'sell',
          asset: 'stocks',
          title: '⚠️ Portfolio Rebalancing Needed',
          description: 'Your portfolio is over-concentrated in one stock. Sell partial holdings and diversify to reduce risk.',
          stocks: investments.filter(inv => (parseFloat(inv.balance.toString()) / totalInvestments) > 0.4).map(i => i.institution_name),
          action: 'Sell Partial',
          reasoning: 'Risk management, diversification, capital protection',
          risk_level: 'high'
        });
      }
    }

    // Cryptocurrency recommendations
    if (monthlySavings > 10000 && riskProfile !== 'conservative') {
      recommendations.push({
        type: 'suggestion',
        asset: 'crypto',
        title: 'Cryptocurrency Allocation',
        description: `Consider allocating 5-10% of portfolio to crypto for high-risk, high-reward exposure. Invest only what you can afford to lose.`,
        stocks: ['Bitcoin', 'Ethereum'],
        action: 'Research & Buy Small',
        reasoning: 'Portfolio diversification, emerging asset class, high growth potential',
        risk_level: 'very_high'
      });
    }

    return new Response(JSON.stringify({ 
      recommendations,
      riskProfile,
      marketTrends,
      portfolioSummary: {
        totalInvestments,
        monthlySavings,
        investmentCapacity: monthlySavings * 0.4
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Error generating stock recommendations:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
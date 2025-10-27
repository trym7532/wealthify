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

    const { data: investments } = await supabase
      .from('linked_accounts')
      .select('*')
      .eq('user_id', user.id)
      .eq('account_type', 'investment');

    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(100);

    const totalInvestments = investments?.reduce((sum, inv) => sum + parseFloat(inv.balance.toString()), 0) || 0;
    const monthlyIncome = transactions?.filter(tx => parseFloat(tx.amount) > 0)
      .reduce((sum, tx) => sum + parseFloat(tx.amount), 0) || 0;
    const monthlyExpenses = transactions?.filter(tx => parseFloat(tx.amount) < 0)
      .reduce((sum, tx) => sum + Math.abs(parseFloat(tx.amount)), 0) || 0;
    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100 : 0;

    const suggestions = [];

    const stocks = [
      {
        symbol: "HDFCBANK",
        name: "HDFC Bank",
        sector: "Banking",
        current: 1642 + (Math.random() * 20 - 10),
        pe: 18.5,
        marketCap: "Large Cap"
      },
      {
        symbol: "INFY",
        name: "Infosys",
        sector: "IT",
        current: 1543 + (Math.random() * 20 - 10),
        pe: 24.3,
        marketCap: "Large Cap"
      },
      {
        symbol: "BHARTIARTL",
        name: "Bharti Airtel",
        sector: "Telecom",
        current: 1287 + (Math.random() * 20 - 10),
        pe: 35.2,
        marketCap: "Large Cap"
      },
      {
        symbol: "ITC",
        name: "ITC Ltd",
        sector: "FMCG",
        current: 462 + (Math.random() * 10 - 5),
        pe: 28.1,
        marketCap: "Large Cap"
      },
      {
        symbol: "RELIANCE",
        name: "Reliance Industries",
        sector: "Energy",
        current: 2456 + (Math.random() * 30 - 15),
        pe: 26.8,
        marketCap: "Large Cap"
      }
    ];

    if (totalInvestments < 10000) {
      const selectedStock = stocks[Math.floor(Math.random() * stocks.length)];
      const target = selectedStock.current * (1.15 + Math.random() * 0.15);
      suggestions.push({
        stock: selectedStock.symbol,
        name: selectedStock.name,
        sector: selectedStock.sector,
        reason: `Strong fundamentals with consistent growth. Good entry point for long-term investors. PE ratio of ${selectedStock.pe} indicates fair valuation.`,
        type: "buy",
        target: parseFloat(target.toFixed(2)),
        current: parseFloat(selectedStock.current.toFixed(2)),
        riskLevel: "moderate",
        timeHorizon: "1-2 years"
      });
    }

    if (savingsRate > 20) {
      const growthStock = stocks.find(s => s.sector === "IT") || stocks[1];
      const target = growthStock.current * (1.25 + Math.random() * 0.15);
      suggestions.push({
        stock: growthStock.symbol,
        name: growthStock.name,
        sector: growthStock.sector,
        reason: `Your savings rate of ${savingsRate.toFixed(0)}% is excellent. Consider growth stocks in ${growthStock.sector} sector for wealth building.`,
        type: "buy",
        target: parseFloat(target.toFixed(2)),
        current: parseFloat(growthStock.current.toFixed(2)),
        riskLevel: "moderate",
        timeHorizon: "2-3 years"
      });
    }

    const defensiveStock = stocks.find(s => s.sector === "FMCG") || stocks[3];
    const defensiveTarget = defensiveStock.current * (1.10 + Math.random() * 0.08);
    suggestions.push({
      stock: defensiveStock.symbol,
      name: defensiveStock.name,
      sector: defensiveStock.sector,
      reason: `Defensive play with consistent dividend history. ${defensiveStock.sector} sector provides stability during market volatility.`,
      type: "hold",
      target: parseFloat(defensiveTarget.toFixed(2)),
      current: parseFloat(defensiveStock.current.toFixed(2)),
      riskLevel: "low",
      timeHorizon: "1-2 years"
    });

    if (totalInvestments > 50000) {
      const diversificationStock = stocks.find(s => s.sector === "Telecom") || stocks[2];
      const divTarget = diversificationStock.current * (1.20 + Math.random() * 0.12);
      suggestions.push({
        stock: diversificationStock.symbol,
        name: diversificationStock.name,
        sector: diversificationStock.sector,
        reason: `Portfolio diversification opportunity. ${diversificationStock.sector} sector showing strong momentum with 5G expansion.`,
        type: "buy",
        target: parseFloat(divTarget.toFixed(2)),
        current: parseFloat(diversificationStock.current.toFixed(2)),
        riskLevel: "moderate",
        timeHorizon: "2-3 years"
      });
    }

    const valueStock = stocks.find(s => s.pe < 25) || stocks[0];
    const valueTarget = valueStock.current * (1.18 + Math.random() * 0.1);
    suggestions.push({
      stock: valueStock.symbol,
      name: valueStock.name,
      sector: valueStock.sector,
      reason: `Undervalued opportunity with PE of ${valueStock.pe}. Strong fundamentals with growth potential in ${valueStock.sector}.`,
      type: "buy",
      target: parseFloat(valueTarget.toFixed(2)),
      current: parseFloat(valueStock.current.toFixed(2)),
      riskLevel: "low",
      timeHorizon: "1-2 years"
    });

    const uniqueSuggestions = Array.from(
      new Map(suggestions.map(item => [item.stock, item])).values()
    ).slice(0, 4);

    return new Response(JSON.stringify({
      suggestions: uniqueSuggestions,
      userProfile: {
        totalInvestments,
        savingsRate: parseFloat(savingsRate.toFixed(2)),
        riskProfile: savingsRate > 30 ? "aggressive" : savingsRate > 15 ? "moderate" : "conservative"
      },
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-investment-suggestions function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
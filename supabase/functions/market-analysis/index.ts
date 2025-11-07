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
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      console.error('Auth error:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Generating market analysis for user:', user.id);

    // Fetch real-time market data using Yahoo Finance API
    const fetchYahooQuote = async (symbol: string) => {
      try {
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`);
        const data = await response.json();
        const result = data?.chart?.result?.[0];
        if (!result) return null;
        
        const meta = result.meta;
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.previousClose || meta.chartPreviousClose;
        const change = currentPrice - previousClose;
        const changePercent = (change / previousClose) * 100;
        
        return {
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
        };
      } catch (error) {
        console.error(`Error fetching quote for ${symbol}:`, error);
        return null;
      }
    };

    // Fetch real Indian market indices
    const niftyData = await fetchYahooQuote('^NSEI'); // NIFTY 50
    const sensexData = await fetchYahooQuote('^BSESN'); // SENSEX

    // Fetch top performing Indian stocks
    const topStocksSymbols = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS'];
    const topStocksData = await Promise.all(
      topStocksSymbols.map(async (symbol) => {
        const data = await fetchYahooQuote(symbol);
        return data ? { symbol: symbol.replace('.NS', ''), ...data } : null;
      })
    );

    const validTopStocks = topStocksData.filter(s => s !== null);

    // Create response with real market data
    const response = {
      indices: [
        {
          name: "NIFTY 50",
          summary: niftyData ? `${niftyData.direction === 'up' ? 'Gained' : niftyData.direction === 'down' ? 'Declined' : 'Stable at'} ${Math.abs(niftyData.changePercent).toFixed(2)}% today` : 'Data unavailable',
          change_percent: niftyData?.changePercent || null,
          direction: niftyData?.direction || 'neutral'
        },
        {
          name: "SENSEX",
          summary: sensexData ? `${sensexData.direction === 'up' ? 'Gained' : sensexData.direction === 'down' ? 'Declined' : 'Stable at'} ${Math.abs(sensexData.changePercent).toFixed(2)}% today` : 'Data unavailable',
          change_percent: sensexData?.changePercent || null,
          direction: sensexData?.direction || 'neutral'
        }
      ],
      today_top_stocks: validTopStocks.slice(0, 3).map(stock => ({
        symbol: stock.symbol,
        rationale: `${stock.direction === 'up' ? 'Strong performance with' : 'Notable movement of'} ${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}% gain today`,
        direction: stock.direction
      })),
      generated_at: new Date().toISOString()
    };

    console.log('Market analysis generated successfully');

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('market-analysis error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
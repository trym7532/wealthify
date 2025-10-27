import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const marketData = {
      nifty: {
        value: 21453.25 + (Math.random() * 200 - 100),
        change: 145.30 + (Math.random() * 50 - 25),
        changePercent: 0.68 + (Math.random() * 0.4 - 0.2)
      },
      sensex: {
        value: 70721.45 + (Math.random() * 500 - 250),
        change: 412.75 + (Math.random() * 100 - 50),
        changePercent: 0.59 + (Math.random() * 0.3 - 0.15)
      },
      topGainers: [
        {
          symbol: "RELIANCE",
          price: 2456.30 + (Math.random() * 40 - 20),
          change: 3.45 + (Math.random() * 1 - 0.5),
          sector: "Energy"
        },
        {
          symbol: "TCS",
          price: 3678.50 + (Math.random() * 60 - 30),
          change: 2.89 + (Math.random() * 1 - 0.5),
          sector: "IT"
        },
        {
          symbol: "INFY",
          price: 1543.20 + (Math.random() * 30 - 15),
          change: 2.12 + (Math.random() * 1 - 0.5),
          sector: "IT"
        },
        {
          symbol: "HDFCBANK",
          price: 1642.00 + (Math.random() * 30 - 15),
          change: 2.45 + (Math.random() * 1 - 0.5),
          sector: "Banking"
        },
        {
          symbol: "ICICIBANK",
          price: 987.60 + (Math.random() * 20 - 10),
          change: 1.98 + (Math.random() * 1 - 0.5),
          sector: "Banking"
        }
      ],
      timestamp: new Date().toISOString()
    };

    return new Response(JSON.stringify(marketData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in get-market-data function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
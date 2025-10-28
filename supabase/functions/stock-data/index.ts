import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  sector?: string;
}

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

interface StockSuggestion {
  stock: string;
  reason: string;
  type: 'buy' | 'hold' | 'sell';
  target: number;
  current: number;
  sector?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "market";

    const generateMarketData = (): { nifty: MarketIndex; sensex: MarketIndex } => {
      const baseNifty = 21453.25;
      const baseSensex = 70721.45;
      const variance = (Math.random() - 0.5) * 0.02;
      
      const niftyChange = baseNifty * variance;
      const sensexChange = baseSensex * variance;

      return {
        nifty: {
          name: "NIFTY 50",
          value: baseNifty + niftyChange,
          change: niftyChange,
          changePercent: (niftyChange / baseNifty) * 100,
        },
        sensex: {
          name: "SENSEX",
          value: baseSensex + sensexChange,
          change: sensexChange,
          changePercent: (sensexChange / baseSensex) * 100,
        },
      };
    };

    const generateTopGainers = (): StockData[] => {
      const stocks = [
        { symbol: "RELIANCE", name: "Reliance Industries", basePrice: 2456.30, sector: "Energy" },
        { symbol: "TCS", name: "Tata Consultancy Services", basePrice: 3678.50, sector: "IT" },
        { symbol: "INFY", name: "Infosys", basePrice: 1543.20, sector: "IT" },
        { symbol: "HDFCBANK", name: "HDFC Bank", basePrice: 1642.00, sector: "Banking" },
        { symbol: "ITC", name: "ITC Limited", basePrice: 462.00, sector: "FMCG" },
        { symbol: "BHARTIARTL", name: "Bharti Airtel", basePrice: 1287.00, sector: "Telecom" },
        { symbol: "SBIN", name: "State Bank of India", basePrice: 785.50, sector: "Banking" },
        { symbol: "LT", name: "Larsen & Toubro", basePrice: 3456.75, sector: "Infrastructure" },
      ];

      return stocks.map(stock => {
        const variance = Math.random() * 0.05;
        const change = variance * 100;
        return {
          symbol: stock.symbol,
          name: stock.name,
          price: stock.basePrice * (1 + variance),
          change: change,
          changePercent: variance * 100,
          sector: stock.sector,
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: stock.basePrice * Math.random() * 100000,
        };
      }).sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
    };

    const generateSuggestions = (): StockSuggestion[] => {
      const suggestions = [
        {
          stock: "HDFCBANK",
          reason: "Strong quarterly results with improved NIM and robust loan growth. Technical indicators suggest bullish momentum.",
          type: "buy" as const,
          target: 1850,
          current: 1642,
          sector: "Banking",
        },
        {
          stock: "ITC",
          reason: "Consistent dividend payer with stable FMCG business. Hotel segment showing recovery post-pandemic.",
          type: "hold" as const,
          target: 485,
          current: 462,
          sector: "FMCG",
        },
        {
          stock: "BHARTIARTL",
          reason: "5G rollout momentum driving subscriber growth. Improving ARPU with potential tariff hikes on horizon.",
          type: "buy" as const,
          target: 1450,
          current: 1287,
          sector: "Telecom",
        },
        {
          stock: "WIPRO",
          reason: "Digital transformation deals pipeline strong. Valuations attractive compared to peers in IT services sector.",
          type: "buy" as const,
          target: 485,
          current: 432,
          sector: "IT",
        },
        {
          stock: "TATASTEEL",
          reason: "Steel prices stabilizing after recent correction. Strong demand from infrastructure and automotive sectors.",
          type: "hold" as const,
          target: 145,
          current: 138,
          sector: "Metals",
        },
        {
          stock: "MARUTI",
          reason: "Market leader in passenger vehicles. New product launches and rural demand recovery driving growth.",
          type: "buy" as const,
          target: 12500,
          current: 11450,
          sector: "Automobile",
        },
      ];

      const shuffled = suggestions.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 4);
    };

    if (action === "market") {
      const marketData = generateMarketData();
      return new Response(JSON.stringify(marketData), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "gainers") {
      const gainers = generateTopGainers();
      return new Response(JSON.stringify({ gainers }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "suggestions") {
      const suggestions = generateSuggestions();
      return new Response(JSON.stringify({ suggestions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "all") {
      const marketData = generateMarketData();
      const gainers = generateTopGainers();
      const suggestions = generateSuggestions();

      return new Response(
        JSON.stringify({
          market: marketData,
          topGainers: gainers,
          suggestions: suggestions,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in stock-data function:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
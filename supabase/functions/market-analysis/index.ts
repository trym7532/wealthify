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

    // Fetch user's portfolio/stocks and recent suggestions
    const [stocksRes, suggestionsRes] = await Promise.all([
      supabase.from('stocks').select('*').eq('user_id', user.id),
      supabase.from('stock_suggestions').select('*').eq('user_id', user.id).order('generated_at', { ascending: false }).limit(10)
    ]);

    const holdings = stocksRes.data || [];
    const suggestions = suggestionsRes.data || [];

    const prompt = `You are a market analyst AI. Produce a concise India-focused market snapshot and personalized notes.
Return VALID JSON only with this schema:
{
  "generated_at": "ISO time",
  "indices": [
    { "name": "NIFTY 50", "direction": "up|down|flat", "change_percent": number, "summary": string },
    { "name": "SENSEX", "direction": "up|down|flat", "change_percent": number, "summary": string }
  ],
  "portfolio": {
    "holdings_count": number,
    "top_movers": [ { "symbol": string, "direction": "up|down|flat", "note": string } ]
  },
  "today_top_stocks": [ { "symbol": string, "direction": "up|down|flat", "rationale": string } ],
  "ai_suggestions": [ { "symbol": string, "action": "buy|hold|sell", "reason": string } ]
}

User holdings: ${JSON.stringify(holdings, null, 2)}
Recent AI suggestions: ${JSON.stringify(suggestions, null, 2)}
Be realistic and conservative. If unsure of exact percentages, provide approximate sensible values. JSON only.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a precise financial analyst. Output must be VALID JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, t);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';

    try {
      const parsed = JSON.parse(content);
      return new Response(JSON.stringify(parsed), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (_e) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('market-analysis error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const DEFAULT_CATEGORIES = [
  "Groceries", "Dining", "Transportation", "Entertainment", "Shopping",
  "Healthcare", "Utilities", "Rent", "Income", "Investment", "Other"
];

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

    const { description, amount } = await req.json();
    if (!description || typeof description !== 'string') {
      return new Response(JSON.stringify({ error: 'description is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch user's budgets to include custom category names
    const { data: budgets } = await supabase
      .from('budgets')
      .select('category')
      .eq('user_id', user.id);

    const budgetCategories = Array.from(new Set((budgets || []).map(b => b.category))).filter(Boolean) as string[];
    const allowedCategories = Array.from(new Set([...budgetCategories, ...DEFAULT_CATEGORIES]));

    const prompt = `You are a finance assistant. Classify the transaction into ONE category from the allowed list.
Return strict JSON with keys: category (string, must be exactly one of allowed), confidence (0-1), matched_keywords (array of strings).

Description: "${description}"
Amount: ${amount ?? 'unknown'}

Allowed categories: ${allowedCategories.join(', ')}

Examples:
- "Uber ride to airport" -> Transportation
- "Starbucks latte" -> Dining
- "Walmart groceries" -> Groceries
- "Internet bill" -> Utilities

Return JSON only.`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You classify transactions into a single allowed category. Always return VALID JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
      }),
    });

    if (!aiResponse.ok) {
      const t = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, t);
      return new Response(JSON.stringify({ error: 'AI request failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content || '{}';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (_e) {
      console.error('Failed to parse AI response:', content);
      return new Response(JSON.stringify({ error: 'Invalid AI response format' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate category
    if (!allowedCategories.includes(parsed.category)) {
      parsed.category = 'Other';
    }

    return new Response(JSON.stringify({ ...parsed, allowedCategories }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('categorize-transaction error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
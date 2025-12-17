import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { playerId, playerName, country } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Use AI to fetch player stats from the internet
    const prompt = `Search the internet and find IPL cricket statistics for the player "${playerName}" from ${country}. 
    
    Return ONLY valid JSON in this exact format with no additional text:
    {
      "matches_played": <number or null>,
      "total_runs": <number or null>,
      "total_wickets": <number or null>,
      "batting_average": <number or null>,
      "batting_strike_rate": <number or null>,
      "highest_score": <number or null>,
      "bowling_average": <number or null>,
      "economy_rate": <number or null>,
      "best_bowling": "<string or null>"
    }
    
    Important:
    - Find IPL-specific statistics only (Indian Premier League)
    - If a statistic is not available or not applicable (e.g., bowling stats for a pure batsman), use null
    - best_bowling should be in format like "5/23" or null
    - All numeric values should be numbers, not strings
    - Return valid JSON only, no explanatory text`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "You are a cricket statistics expert. Always return valid JSON only." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits to your workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to fetch stats from AI");
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let stats;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      stats = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse stats from AI response");
    }

    // Update player with stats
    const { error: updateError } = await supabase
      .from("players")
      .update({
        matches_played: stats.matches_played,
        total_runs: stats.total_runs,
        total_wickets: stats.total_wickets,
        batting_average: stats.batting_average,
        batting_strike_rate: stats.batting_strike_rate,
        highest_score: stats.highest_score,
        bowling_average: stats.bowling_average,
        economy_rate: stats.economy_rate,
        best_bowling: stats.best_bowling,
        stats_fetched: true,
        stats_last_updated: new Date().toISOString(),
      })
      .eq("id", playerId);

    if (updateError) {
      console.error("Error updating player stats:", updateError);
      throw updateError;
    }

    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in fetch-player-stats:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
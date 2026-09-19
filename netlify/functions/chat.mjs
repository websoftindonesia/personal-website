const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 2000;
const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers }
});
const assistantInstructions = "You are Wazryn Assistant, the helpful AI concierge for Muhammad Fawwaz Rayyan Khalish's portfolio. Reply in the visitor's language; Indonesian is the default. Be warm, accurate, and concise (normally under 150 words). You can discuss the portfolio, skills, services, projects, and contact options. Do not invent personal facts, pricing, availability, credentials, or links. If a question is unrelated to the portfolio, you may help generally but state uncertainty when appropriate.";

function sanitiseMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .slice(-MAX_MESSAGES)
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH) }))
    .filter((message) => message.content);
}

export default async (request) => {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed." }, 405, { Allow: "POST" });
  }

  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return json({ error: "AI service has not been configured yet." }, 503);
  }

  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request body." }, 400); }
  const input = sanitiseMessages(body.messages);
  if (!input.length) return json({ error: "Please send a message." }, 400);

  try {
    // Prefer Gemini when configured. It can use Google's Free Tier within its rate limits.
    if (process.env.GEMINI_API_KEY) {
      const contents = input.map((message) => ({
        role: message.role === "assistant" ? "model" : "user",
        parts: [{ text: message.content }]
      }));
      const model = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": process.env.GEMINI_API_KEY },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: assistantInstructions }] },
          contents,
          generationConfig: { maxOutputTokens: 350, temperature: 0.7 }
        })
      });
      const geminiPayload = await geminiResponse.json();
      if (!geminiResponse.ok) {
        console.error("Gemini response error", geminiResponse.status, geminiPayload?.error?.message);
        return json({ error: "AI service could not answer right now." }, 502);
      }
      const reply = geminiPayload?.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
      if (!reply) return json({ error: "AI service returned an empty reply." }, 502);
      return json({ reply });
    }

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5", instructions: assistantInstructions, input, max_output_tokens: 350, store: false })
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error("OpenAI response error", response.status, payload?.error?.message);
      return json({ error: "AI service could not answer right now." }, 502);
    }
    const reply = String(payload.output_text || "").trim();
    if (!reply) return json({ error: "AI service returned an empty reply." }, 502);
    return json({ reply });
  } catch (error) {
    console.error("AI proxy failed", error);
    return json({ error: "Unable to reach the AI service." }, 502);
  }
};

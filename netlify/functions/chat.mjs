const MAX_MESSAGES = 10;
const MAX_MESSAGE_LENGTH = 2000;

function sanitiseMessages(messages) {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role) && typeof message.content === "string")
    .slice(-MAX_MESSAGES)
    .map((message) => ({ role: message.role, content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH) }))
    .filter((message) => message.content);
}

export default async (request) => {
  if (request.httpMethod !== "POST") {
    return { statusCode: 405, headers: { Allow: "POST" }, body: JSON.stringify({ error: "Method not allowed." }) };
  }

  if (!process.env.OPENAI_API_KEY) {
    return { statusCode: 503, body: JSON.stringify({ error: "AI service has not been configured yet." }) };
  }

  let body;
  try { body = JSON.parse(request.body || "{}"); } catch { return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) }; }
  const input = sanitiseMessages(body.messages);
  if (!input.length) return { statusCode: 400, body: JSON.stringify({ error: "Please send a message." }) };

  const instructions = "You are Wazryn Assistant, the helpful AI concierge for Muhammad Fawwaz Rayyan Khalish's portfolio. Reply in the visitor's language; Indonesian is the default. Be warm, accurate, and concise (normally under 150 words). You can discuss the portfolio, skills, services, projects, and contact options. Do not invent personal facts, pricing, availability, credentials, or links. If a question is unrelated to the portfolio, you may help generally but state uncertainty when appropriate.";

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5", instructions, input, max_output_tokens: 350, store: false })
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error("OpenAI response error", response.status, payload?.error?.message);
      return { statusCode: 502, body: JSON.stringify({ error: "AI service could not answer right now." }) };
    }
    const reply = String(payload.output_text || "").trim();
    if (!reply) return { statusCode: 502, body: JSON.stringify({ error: "AI service returned an empty reply." }) };
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ reply }) };
  } catch (error) {
    console.error("AI proxy failed", error);
    return { statusCode: 502, body: JSON.stringify({ error: "Unable to reach the AI service." }) };
  }
};

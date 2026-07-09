export const runtime = "nodejs";

import { getAnthropicClient } from "@/lib/anthropic";
import { getChatbotSystemPrompt } from "@/lib/chatbotContext";

const MAX_HISTORY_MESSAGES = 20;
const MODEL = "claude-opus-4-8";

export async function POST(request) {
  let messages;
  try {
    ({ messages } = await request.json());
  } catch {
    return Response.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: "messages array is required." }, { status: 400 });
  }

  const trimmed = messages
    .slice(-MAX_HISTORY_MESSAGES)
    .filter(m => m && typeof m.content === "string" && (m.role === "user" || m.role === "assistant"))
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (trimmed.length === 0 || trimmed[0].role !== "user") {
    return Response.json({ error: "messages must start with a user message." }, { status: 400 });
  }

  let client;
  try {
    client = getAnthropicClient();
  } catch {
    return Response.json({ error: "Chatbot is not configured on this server yet." }, { status: 503 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const anthropicStream = client.messages.stream({
          model: MODEL,
          max_tokens: 1024,
          system: [
            { type: "text", text: getChatbotSystemPrompt(), cache_control: { type: "ephemeral" } },
          ],
          messages: trimmed,
        });

        anthropicStream.on("text", (text) => {
          controller.enqueue(encoder.encode(text));
        });

        await anthropicStream.finalMessage();
        controller.close();
      } catch (err) {
        controller.enqueue(encoder.encode("\n\n[Sorry, something went wrong. Please try again or contact us directly.]"));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}

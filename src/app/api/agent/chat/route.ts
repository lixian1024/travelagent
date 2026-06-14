import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 240;

const DEFAULT_BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MODEL = "qwen3.6-plus";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_ANSWER_CHARS = 300;
const SEARCH_AFTER_TURNS = 3;

type ChatRequest = {
  conversationId?: string;
  message?: string;
  image?: string | null;
  contextUpdate?: Record<string, unknown>;
};

type SavedMessage = {
  role: "user" | "assistant";
  content: string;
};

function dataUrlSize(value: string) {
  const base64 = value.split(",", 2)[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

function streamEvent(type: string, payload: Record<string, unknown>) {
  return `${JSON.stringify({ type, ...payload })}\n`;
}

function titleFromMessage(message: string) {
  const compact = message.replace(/\s+/g, " ").trim();
  return compact.slice(0, 54) || "Image issue";
}

function sanitizeContextUpdate(value?: Record<string, unknown>) {
  if (!value) return {};
  const update: Record<string, unknown> = {};
  for (const key of ["current_place", "city", "display_name", "location_updated_at"]) {
    if (typeof value[key] === "string") {
      update[key] = value[key].slice(0, key === "display_name" ? 500 : 160);
    }
  }
  const location = value.location;
  if (
    typeof location === "object" &&
    location !== null &&
    "latitude" in location &&
    "longitude" in location &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    Math.abs(location.latitude) <= 90 &&
    Math.abs(location.longitude) <= 180
  ) {
    update.location = {
      latitude: Number(location.latitude.toFixed(3)),
      longitude: Number(location.longitude.toFixed(3)),
    };
  }
  return update;
}

function parseSseBlock(block: string) {
  const lines = block.split(/\r?\n/);
  const event = lines
    .find((line) => line.startsWith("event:"))
    ?.slice(6)
    .trim();
  const data = lines
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trim())
    .join("\n");

  if (!data || data === "[DONE]") return null;

  try {
    const parsed = JSON.parse(data) as {
      type?: string;
      delta?: string;
      error?: { message?: string };
    };
    return { event: event || parsed.type, data: parsed };
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Qwen API is not configured." }, { status: 503 });
  }

  let input: ChatRequest;

  try {
    input = (await request.json()) as ChatRequest;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const conversationId = input.conversationId?.trim();
  const message = input.message?.trim() ?? "";
  const image = input.image?.trim() || null;

  if (!conversationId || (!message && !image)) {
    return Response.json({ error: "A conversation and question are required." }, { status: 400 });
  }

  if (message.length > 2000) {
    return Response.json({ error: "Please keep the question under 2,000 characters." }, { status: 400 });
  }

  if (image && (!image.startsWith("data:image/") || dataUrlSize(image) > MAX_IMAGE_BYTES)) {
    return Response.json({ error: "The image must be a valid file under 10 MB." }, { status: 413 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from("agent_conversations")
    .select("id, title, turn_count, status, session_type, context_snapshot")
    .eq("id", conversationId)
    .eq("user_id", user.id)
    .single();

  if (conversationError || !conversation) {
    return Response.json({ error: "Conversation not found." }, { status: 404 });
  }

  const { data: historyData } = await supabase
    .from("agent_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(12);

  const history = ((historyData ?? []) as SavedMessage[]).reverse();
  const userText = message || "Please inspect this screenshot and tell me the next action.";
  const { error: userMessageError } = await supabase.from("agent_messages").insert({
    conversation_id: conversationId,
    user_id: user.id,
    role: "user",
    content: userText,
    has_image: Boolean(image),
  });

  if (userMessageError) {
    return Response.json({ error: "Could not save your message." }, { status: 500 });
  }

  const nextTurn = conversation.turn_count + 1;
  const enableSearch = conversation.status === "active" && conversation.turn_count >= SEARCH_AFTER_TURNS;
  const contextSnapshot = {
    ...((conversation.context_snapshot as Record<string, unknown> | null) ?? {}),
    ...sanitizeContextUpdate(input.contextUpdate),
  };
  const conversationUpdate: Record<string, unknown> = {
    turn_count: nextTurn,
    updated_at: new Date().toISOString(),
    last_message_preview: userText.slice(0, 120),
    context_snapshot: contextSnapshot,
  };

  if (conversation.title === "New session" || conversation.title === "New issue") {
    conversationUpdate.title = titleFromMessage(userText);
  }
  if (enableSearch) {
    conversationUpdate.search_used_at = new Date().toISOString();
  }

  await supabase
    .from("agent_conversations")
    .update(conversationUpdate)
    .eq("id", conversationId)
    .eq("user_id", user.id);

  const { data: tripContext } = await supabase
    .from("trip_contexts")
    .select("device, network, payment_methods, food_needs, spice_level, trip_days, traveler_count, cities")
    .eq("user_id", user.id)
    .maybeSingle();

  const sessionInstructions: Record<string, string[]> = {
    problem: [
      "Diagnose one step at a time. Give the single safest next action first, then one short reason.",
      "Ask the user to report the result so you can continue until the issue is solved.",
      "If it cannot be solved remotely, recommend local human help and provide a short Chinese help card.",
    ],
    sight: [
      "Act as a location-aware audio guide. Explain the place named in the session context without inventing uncertain details.",
      "For a location introduction, write a vivid spoken script that takes about 45 to 60 seconds and starts with what the visitor can notice now.",
      "For follow-ups, answer the exact question and connect it to what the visitor can see.",
    ],
    menu: [
      "Read menu images carefully. Identify visible dishes, explain ingredients, flavor and spice, flag likely allergens, and recommend what fits the traveler's food needs.",
      "When useful, finish with a short Chinese ordering card the traveler can show staff.",
    ],
    sign: [
      "Read the visible sign, ticket, notice, station board or entrance text. First translate the important content, then explain what it means for the traveler, then give the next action.",
    ],
    driver: [
      "Help the traveler communicate a destination to a Chinese driver. Confirm ambiguity, then provide a large concise Chinese destination card with place name, address or entrance, plus one short driver sentence.",
    ],
  };
  const sessionType = conversation.session_type || "problem";
  const maxAnswerChars = sessionType === "sight" ? 700 : MAX_ANSWER_CHARS;
  const instructions = [
    "You are China Travel Agent, a practical in-the-moment local guide for foreign visitors in China.",
    ...(sessionInstructions[sessionType] ?? sessionInstructions.problem),
    "Never ask for card numbers, PINs, SMS codes, passport numbers, or other secrets.",
    "When the screenshot contains useful text or an error, briefly explain what it means before the action.",
    sessionType === "sight"
      ? "Reply in the user's language. Keep location introductions under 550 characters and other answers concise."
      : "Reply in the user's language. Keep the entire answer under 300 characters. Be direct and calm.",
    enableSearch
      ? "Earlier attempts did not solve the issue. Use web search only for current or provider-specific facts, and keep the answer concise."
      : "Do not use web search in this turn. Work from the conversation, screenshot, and travel context.",
    tripContext ? `Known trip context: ${JSON.stringify(tripContext)}.` : "",
    `Live session type: ${sessionType}.`,
    `Session context snapshot: ${JSON.stringify(contextSnapshot)}.`,
  ]
    .filter(Boolean)
    .join("\n");

  const currentContent: Array<Record<string, string>> = [];
  if (image) currentContent.push({ type: "input_image", image_url: image });
  currentContent.push({ type: "input_text", text: userText });

  const qwenInput = [
    ...history.map((item) => ({
      role: item.role,
      content: [{ type: "input_text", text: item.content }],
    })),
    { role: "user", content: currentContent },
  ];

  const baseUrl = (process.env.DASHSCOPE_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, "");
  let upstream: Response;

  try {
    upstream = await fetch(`${baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        instructions,
        input: qwenInput,
        stream: true,
        store: false,
        max_output_tokens: sessionType === "sight" ? 520 : 240,
        reasoning: { effort: "low" },
        ...(enableSearch
          ? { tools: [{ type: "web_search" }, { type: "web_extractor" }] }
          : {}),
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(120_000),
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error && error.name === "TimeoutError"
            ? "Qwen took too long to answer."
            : "Could not connect to Qwen.",
      },
      { status: 502 },
    );
  }

  if (!upstream.ok || !upstream.body) {
    const detail = await upstream.text();
    return Response.json(
      { error: "Qwen could not answer right now.", detail: detail.slice(0, 500) },
      { status: upstream.status || 502 },
    );
  }

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const modelName = MODEL;

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(
        encoder.encode(
          streamEvent("meta", {
            conversationId,
            usedWebSearch: enableSearch,
            padding: " ".repeat(1024),
          }),
        ),
      );

      const reader = upstream.body!.getReader();
      let buffer = "";
      let answer = "";

      try {
        while (answer.length < maxAnswerChars) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const blocks = buffer.split(/\r?\n\r?\n/);
          buffer = blocks.pop() ?? "";

          for (const block of blocks) {
            const event = parseSseBlock(block);
            if (!event) continue;

            if (event.data.error?.message) {
              throw new Error(event.data.error.message);
            }

            if (event.event === "response.output_text.delta" && event.data.delta) {
              const room = maxAnswerChars - answer.length;
              const delta = event.data.delta.slice(0, room);
              if (!delta) continue;
              answer += delta;
              controller.enqueue(encoder.encode(streamEvent("delta", { delta })));
            }
          }
        }

        if (answer.length >= maxAnswerChars) {
          await reader.cancel();
        }

        const finalAnswer = answer.trim() || "I could not read a useful answer. Please try again.";
        const { data: savedAssistant } = await supabase
          .from("agent_messages")
          .insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: finalAnswer,
            has_image: false,
            used_web_search: enableSearch,
            model: modelName,
          })
          .select("id")
          .single();

        await supabase
          .from("agent_conversations")
          .update({
            updated_at: new Date().toISOString(),
            last_message_preview: finalAnswer.slice(0, 120),
          })
          .eq("id", conversationId)
          .eq("user_id", user.id);

        controller.enqueue(
          encoder.encode(
            streamEvent("done", {
              messageId: savedAssistant?.id,
              usedWebSearch: enableSearch,
            }),
          ),
        );
      } catch (error) {
        controller.enqueue(
          encoder.encode(
            streamEvent("error", {
              error: error instanceof Error ? error.message : "The response was interrupted.",
            }),
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

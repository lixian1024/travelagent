import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const DEFAULT_TTS_BASE_URL = "https://dashscope.aliyuncs.com/api/v1";
const TTS_MODEL = "qwen3-tts-flash";
const TTS_VOICE = "Jennifer";
const MAX_TTS_CHARS = 600;

type SpeechRequest = {
  text?: string;
};

type DashScopeSpeechResponse = {
  request_id?: string;
  code?: string;
  message?: string;
  output?: {
    audio?: {
      url?: string;
      id?: string;
      expires_at?: number;
    };
  };
};

function compactSpeechText(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length <= MAX_TTS_CHARS) return compact;

  const clipped = compact.slice(0, MAX_TTS_CHARS);
  const sentenceEnd = Math.max(
    clipped.lastIndexOf("."),
    clipped.lastIndexOf("!"),
    clipped.lastIndexOf("?"),
  );

  return sentenceEnd > 240 ? clipped.slice(0, sentenceEnd + 1) : clipped;
}

export async function POST(request: Request) {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return Response.json({ error: "Qwen-TTS is not configured." }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  let input: SpeechRequest;

  try {
    input = (await request.json()) as SpeechRequest;
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const text = compactSpeechText(input.text ?? "");

  if (!text) {
    return Response.json({ error: "Text is required." }, { status: 400 });
  }

  const baseUrl = (
    process.env.DASHSCOPE_TTS_BASE_URL || DEFAULT_TTS_BASE_URL
  ).replace(/\/$/, "");
  let speechResponse: Response;

  try {
    speechResponse = await fetch(
      `${baseUrl}/services/aigc/multimodal-generation/generation`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: TTS_MODEL,
          input: {
            text,
            voice: TTS_VOICE,
            language_type: "English",
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(120_000),
      },
    );
  } catch {
    return Response.json({ error: "Could not connect to Qwen-TTS." }, { status: 502 });
  }

  const rawText = await speechResponse.text();
  let raw: DashScopeSpeechResponse;

  try {
    raw = JSON.parse(rawText) as DashScopeSpeechResponse;
  } catch {
    raw = { message: rawText };
  }

  const audioUrl = raw.output?.audio?.url;

  if (!speechResponse.ok || !audioUrl) {
    return Response.json(
      {
        error: raw.message || "Qwen-TTS could not generate speech.",
        code: raw.code,
        requestId: raw.request_id,
      },
      { status: speechResponse.ok ? 502 : speechResponse.status },
    );
  }

  let audioResponse: Response;

  try {
    audioResponse = await fetch(audioUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(60_000),
    });
  } catch {
    return Response.json({ error: "Could not download generated speech." }, { status: 502 });
  }

  if (!audioResponse.ok || !audioResponse.body) {
    return Response.json({ error: "Generated speech is not available." }, { status: 502 });
  }

  return new Response(audioResponse.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": audioResponse.headers.get("Content-Type") || "audio/wav",
      "X-Qwen-Request-Id": raw.request_id || "",
      "X-Qwen-TTS-Voice": TTS_VOICE,
    },
  });
}

export const runtime = "nodejs";
export const maxDuration = 240;

const DEFAULT_BASE_URL =
  "https://dashscope.aliyuncs.com/compatible-mode/v1";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

type TestRequest = {
  prompt?: string;
  model?: string;
  image?: string | null;
  enableSearch?: boolean;
};

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

function dataUrlSize(value: string) {
  const base64 = value.split(",", 2)[1] ?? "";
  return Math.floor((base64.length * 3) / 4);
}

function extractText(content: unknown): string {
  if (typeof content === "string") {
    return content;
  }

  if (!Array.isArray(content)) {
    return "";
  }

  return content
    .map((part) => {
      if (
        typeof part === "object" &&
        part !== null &&
        "text" in part &&
        typeof part.text === "string"
      ) {
        return part.text;
      }
      return "";
    })
    .filter(Boolean)
    .join("\n");
}

function extractResponseText(raw: unknown): string {
  if (typeof raw !== "object" || raw === null || !("output" in raw)) {
    return "";
  }

  const output = (raw as { output?: unknown }).output;
  if (!Array.isArray(output)) return "";

  return output
    .flatMap((item) => {
      if (
        typeof item !== "object" ||
        item === null ||
        !("content" in item) ||
        !Array.isArray(item.content)
      ) {
        return [];
      }

      const parts = item.content as unknown[];

      return parts.map((part) => {
        if (
          typeof part === "object" &&
          part !== null &&
          "text" in part &&
          typeof part.text === "string"
        ) {
          return part.text;
        }
        return "";
      });
    })
    .filter(Boolean)
    .join("\n");
}

async function callDashScope(
  baseUrl: string,
  apiKey: string,
  path: "chat/completions" | "responses",
  body: Record<string, unknown>,
) {
  const response = await fetch(`${baseUrl}/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    cache: "no-store",
    signal: AbortSignal.timeout(120_000),
  });
  const rawText = await response.text();
  let raw: unknown;

  try {
    raw = JSON.parse(rawText);
  } catch {
    raw = { response: rawText };
  }

  return { ok: response.ok, raw, status: response.status };
}

export async function POST(request: Request) {
  const apiKey = process.env.DASHSCOPE_API_KEY;

  if (!apiKey) {
    return Response.json(
      {
        error:
          "服务端缺少 DASHSCOPE_API_KEY。请先在 .env.local 中配置阿里云百炼 API Key。",
      },
      { status: 503 },
    );
  }

  let input: TestRequest;

  try {
    input = (await request.json()) as TestRequest;
  } catch {
    return Response.json({ error: "请求体不是有效 JSON。" }, { status: 400 });
  }

  const prompt = input.prompt?.trim();
  const model = input.model?.trim() || process.env.QWEN_MODEL || "qwen3.7-plus";
  const image = input.image?.trim() || null;

  if (!prompt) {
    return Response.json({ error: "请输入测试问题。" }, { status: 400 });
  }

  if (image?.startsWith("data:") && dataUrlSize(image) > MAX_IMAGE_BYTES) {
    return Response.json(
      { error: "图片不能超过 10 MB。" },
      { status: 413 },
    );
  }

  if (
    image &&
    !image.startsWith("data:image/") &&
    !/^https?:\/\//i.test(image)
  ) {
    return Response.json(
      { error: "图片必须是上传文件生成的 data URL，或公开的 HTTP(S) URL。" },
      { status: 400 },
    );
  }

  const content: ContentPart[] = [];

  if (image) {
    content.push({ type: "image_url", image_url: { url: image } });
  }

  content.push({ type: "text", text: prompt });

  const baseUrl = (
    process.env.DASHSCOPE_BASE_URL || DEFAULT_BASE_URL
  ).replace(/\/$/, "");
  const startedAt = performance.now();

  try {
    let visionRaw: unknown;
    let visionText = "";

    if (image || !input.enableSearch) {
      const vision = await callDashScope(
        baseUrl,
        apiKey,
        "chat/completions",
        {
          model,
          messages: [{ role: "user", content }],
          stream: false,
        },
      );

      if (!vision.ok) {
        return Response.json(
          {
            error: "千问图片理解调用失败。",
            status: vision.status,
            model,
            raw: vision.raw,
          },
          { status: vision.status },
        );
      }

      visionRaw = vision.raw;
      const visionResponse = vision.raw as {
        choices?: Array<{ message?: { content?: unknown } }>;
      };
      visionText = extractText(
        visionResponse.choices?.[0]?.message?.content,
      );
    }

    if (input.enableSearch) {
      const searchPrompt = image
        ? [
            "你必须使用联网搜索工具核实信息，并在回答中列出可访问的来源链接。",
            `用户原始任务：${prompt}`,
            "以下是同一模型刚刚对图片的观察结果。请把它作为待核实线索，不要当作已确认事实：",
            visionText || "图片阶段未提取到文字结果。",
          ].join("\n\n")
        : [
            "你必须使用联网搜索工具回答，并列出可访问的来源链接。",
            prompt,
          ].join("\n\n");
      const search = await callDashScope(baseUrl, apiKey, "responses", {
        model,
        input: searchPrompt,
        tools: [{ type: "web_search" }, { type: "web_extractor" }],
        reasoning: { effort: "low" },
      });

      if (!search.ok) {
        return Response.json(
          {
            error: "千问联网搜索调用失败。",
            status: search.status,
            model,
            raw: image
              ? { vision: visionRaw, search: search.raw }
              : search.raw,
          },
          { status: search.status },
        );
      }

      const searchResponse = search.raw as {
        id?: string;
        model?: string;
        usage?: unknown;
      };

      return Response.json({
        answer: extractResponseText(search.raw),
        elapsedMs: Math.round(performance.now() - startedAt),
        id: searchResponse.id,
        model: searchResponse.model || model,
        usage: searchResponse.usage,
        raw: image
          ? { vision: visionRaw, search: search.raw }
          : search.raw,
        stages: image ? ["vision", "web_search"] : ["web_search"],
      });
    }

    const visionResponse = visionRaw as {
      id?: string;
      model?: string;
      usage?: unknown;
    };

    return Response.json({
      answer: visionText,
      elapsedMs: Math.round(performance.now() - startedAt),
      id: visionResponse.id,
      model: visionResponse.model || model,
      usage: visionResponse.usage,
      raw: visionRaw,
      stages: image ? ["vision"] : ["chat"],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "未知网络错误";

    return Response.json(
      {
        error: message.includes("timeout")
          ? "单阶段请求超过 120 秒，已终止。"
          : `无法连接千问 API：${message}`,
        model,
      },
      { status: 502 },
    );
  }
}

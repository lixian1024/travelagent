"use client";

import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import styles from "./qwen-test.module.css";

type TestResult = {
  answer?: string;
  elapsedMs?: number;
  error?: string;
  id?: string;
  model?: string;
  raw?: unknown;
  status?: number;
  usage?: unknown;
};

const SEARCH_PROMPT =
  "请联网搜索今天最重要的一条人工智能行业新闻。给出事件发生日期、三点摘要，并列出来源链接。不要只依赖已有知识。";
const IMAGE_PROMPT =
  "请仔细观察图片：描述主要内容，识别其中可见的文字、地点或物品，并指出你不确定的部分。";
const COMBINED_PROMPT =
  "先识别图片中的地点、商品、人物或事件线索，再联网核实相关的最新信息。请明确区分图片观察结果与联网查证结果，并附来源。";

function formatJson(value: unknown) {
  return JSON.stringify(value, null, 2);
}

export default function QwenTestBench() {
  const [model, setModel] = useState("qwen3.7-plus");
  const [prompt, setPrompt] = useState(SEARCH_PROMPT);
  const [enableSearch, setEnableSearch] = useState(true);
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (image?.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  function loadFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setResult({ error: "请选择图片文件。" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setResult({ error: "图片不能超过 10 MB。" });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImage(String(reader.result));
      setImageName(file.name);
      setImageUrl("");
      setResult(null);
    };
    reader.readAsDataURL(file);
  }

  function handleFile(event: ChangeEvent<HTMLInputElement>) {
    loadFile(event.target.files?.[0]);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    loadFile(event.dataTransfer.files?.[0]);
  }

  function applyImageUrl() {
    const value = imageUrl.trim();
    setImage(value || null);
    setImageName(value ? "远程图片" : "");
    setResult(null);
  }

  function clearImage() {
    setImage(null);
    setImageName("");
    setImageUrl("");
    if (fileInput.current) fileInput.current.value = "";
  }

  function applyPreset(kind: "search" | "image" | "combined") {
    if (kind === "search") {
      setPrompt(SEARCH_PROMPT);
      setEnableSearch(true);
    } else if (kind === "image") {
      setPrompt(IMAGE_PROMPT);
      setEnableSearch(false);
    } else {
      setPrompt(COMBINED_PROMPT);
      setEnableSearch(true);
    }
    setResult(null);
  }

  async function runTest(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setResult(null);
    setShowRaw(false);

    try {
      const response = await fetch("/api/qwen-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          prompt,
          enableSearch,
          image,
        }),
      });
      const data = (await response.json()) as TestResult;
      setResult(data);
    } catch (error) {
      setResult({
        error:
          error instanceof Error ? error.message : "浏览器请求失败，请重试。",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.shell}>
      <div className={styles.noise} />
      <header className={styles.header}>
        <Link className={styles.back} href="/">
          ← TRAVEL AGENT
        </Link>
        <div className={styles.status}>
          <span />
          DASHSCOPE / LIVE TEST
        </div>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>MULTIMODAL FIELD LAB · 01</p>
        <h1>
          QWEN
          <br />
          <span>CAPABILITY TEST</span>
        </h1>
        <p className={styles.lede}>
          分别验证模型是否能看懂图片、主动检索实时网页；组合模式会先看图，
          再联网核实视觉线索。原始响应完整保留，方便检查证据链。
        </p>
      </section>

      <form className={styles.workspace} onSubmit={runTest}>
        <section className={styles.controls}>
          <div className={styles.sectionHeading}>
            <span>01</span>
            <div>
              <h2>实验设置</h2>
              <p>CONFIGURE THE REQUEST</p>
            </div>
          </div>

          <label className={styles.field}>
            <span>模型名称</span>
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="qwen3.7-plus"
              required
            />
            <small>
              模型名可编辑，可直接尝试你账户中已开通的其它版本。
            </small>
          </label>

          <div className={styles.presets}>
            <span>快速测试</span>
            <div>
              <button type="button" onClick={() => applyPreset("search")}>
                仅联网
              </button>
              <button type="button" onClick={() => applyPreset("image")}>
                仅看图
              </button>
              <button type="button" onClick={() => applyPreset("combined")}>
                看图 + 联网
              </button>
            </div>
          </div>

          <label className={styles.field}>
            <span>测试问题</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={7}
              required
            />
          </label>

          <label className={styles.switchRow}>
            <span>
              <strong>强制联网搜索</strong>
              <small>使用 Responses API 的 web_search 内置工具</small>
            </span>
            <input
              type="checkbox"
              checked={enableSearch}
              onChange={(event) => setEnableSearch(event.target.checked)}
            />
            <i aria-hidden="true" />
          </label>
        </section>

        <section className={styles.imagePanel}>
          <div className={styles.sectionHeading}>
            <span>02</span>
            <div>
              <h2>视觉输入</h2>
              <p>OPTIONAL IMAGE SIGNAL</p>
            </div>
          </div>

          <input
            ref={fileInput}
            className={styles.hiddenInput}
            type="file"
            accept="image/*"
            onChange={handleFile}
          />

          {image ? (
            <div className={styles.preview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="待测试图片预览" />
              <div>
                <span>{imageName || "IMAGE INPUT"}</span>
                <button type="button" onClick={clearImage}>
                  移除
                </button>
              </div>
            </div>
          ) : (
            <div
              className={styles.dropzone}
              onClick={() => fileInput.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  fileInput.current?.click();
                }
              }}
            >
              <span className={styles.crosshair}>＋</span>
              <strong>放入一张测试图片</strong>
              <p>点击或拖拽上传 · JPG / PNG / WEBP · 最大 10 MB</p>
            </div>
          )}

          <div className={styles.urlInput}>
            <label htmlFor="image-url">或者使用公开图片 URL</label>
            <div>
              <input
                id="image-url"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
              <button type="button" onClick={applyImageUrl}>
                应用
              </button>
            </div>
          </div>

          <div className={styles.requestMap}>
            <span>REQUEST MAP</span>
            <div>
              <b className={image ? styles.active : ""}>IMAGE</b>
              <i />
              <b className={styles.active}>TEXT</b>
              <i />
              <b className={enableSearch ? styles.active : ""}>SEARCH</b>
              <i />
              <b className={styles.active}>QWEN</b>
            </div>
          </div>

          <button className={styles.runButton} disabled={loading} type="submit">
            <span>{loading ? "正在调用模型..." : "运行能力测试"}</span>
            <b>{loading ? "WAIT" : "RUN →"}</b>
          </button>
        </section>
      </form>

      <section className={styles.output}>
        <div className={styles.sectionHeading}>
          <span>03</span>
          <div>
            <h2>模型响应</h2>
            <p>OBSERVE THE EVIDENCE</p>
          </div>
        </div>

        {!result && !loading && (
          <div className={styles.empty}>
            <span>NO SIGNAL YET</span>
            <p>运行测试后，回答、耗时、token 用量与原始 JSON 会显示在这里。</p>
          </div>
        )}

        {loading && (
          <div className={styles.scanning}>
            <div />
            <p>模型正在观察、检索并组织回答...</p>
          </div>
        )}

        {result && (
          <div className={styles.result}>
            <div className={styles.metrics}>
              <div>
                <span>MODEL</span>
                <strong>{result.model || model}</strong>
              </div>
              <div>
                <span>LATENCY</span>
                <strong>
                  {result.elapsedMs ? `${result.elapsedMs} ms` : "—"}
                </strong>
              </div>
              <div>
                <span>STATUS</span>
                <strong className={result.error ? styles.bad : styles.good}>
                  {result.error ? result.status || "ERROR" : "SUCCESS"}
                </strong>
              </div>
            </div>

            {result.error ? (
              <div className={styles.errorBox}>
                <strong>调用失败</strong>
                <p>{result.error}</p>
              </div>
            ) : (
              <article className={styles.answer}>
                <span>ANSWER</span>
                <p>{result.answer || "模型返回成功，但未提取到文本内容。"}</p>
              </article>
            )}

            {result.usage !== undefined && (
              <div className={styles.usage}>
                <span>TOKEN USAGE</span>
                <code>{formatJson(result.usage)}</code>
              </div>
            )}

            {result.raw !== undefined && (
              <div className={styles.raw}>
                <button type="button" onClick={() => setShowRaw(!showRaw)}>
                  {showRaw ? "收起原始响应" : "查看原始响应与搜索来源"}
                  <span>{showRaw ? "−" : "+"}</span>
                </button>
                {showRaw && <pre>{formatJson(result.raw)}</pre>}
              </div>
            )}
          </div>
        )}
      </section>

      <footer className={styles.footer}>
        <span>API KEY STAYS SERVER-SIDE</span>
        <span>IMAGE LIMIT 10 MB</span>
        <span>TIMEOUT 120 S / STAGE</span>
      </footer>
    </main>
  );
}

import type { Metadata } from "next";
import QwenTestBench from "./QwenTestBench";

export const metadata: Metadata = {
  title: "Qwen Capability Test Bench",
  description: "Test Qwen web search and image understanding from one request.",
};

export default function QwenTestPage() {
  return <QwenTestBench />;
}

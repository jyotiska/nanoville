// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test } from "vitest";
import { UsageDetails } from "@/api/chorus/usage-view";
import type { Snapshot } from "@/api/chorus/client";

type Metrics = NonNullable<Snapshot["turns"][number]["usageDetails"]>["calls"][number];
const reply: Metrics = {
  id: "reply-1", agentId: "agent-a", promptVersion: "test", phase: "spoken", attempt: 2, model: "gpt-6-luna", route: "openai",
  provider: null, requestId: "resp-123", input: 12000, output: 420, cachedInput: 10000, cacheWriteInput: 0,
  reasoningOutput: 100, costUSD: null, cacheStatus: "hit", outcome: "success", accepted: true, durationMs: 500,
  context: { modelWindowTokens: 1050000, configuredWindowTokens: 32768, effectiveWindowTokens: 32768,
    inputTokens: 12000, inputSource: "provider", completionReserveTokens: 300, usableInputTokens: 32468, capabilityVersion: "2026-11-01" },
};
afterEach(cleanup);

test("shows the displayed reply counts separately from complete turn totals and context capacity", () => {
  const draft = { ...reply, id: "draft", phase: "canvas", input: 2000, output: 300, cachedInput: 0, accepted: false };
  render(<UsageDetails details={{ response: reply, calls: [draft, reply] }} totals={{ input: 14000, output: 720 }} />);
  expect(screen.getByLabelText("Response token usage").textContent).toContain("Input 12,000");
  expect(screen.getByText("Output 420")).toBeTruthy();
  expect(screen.getByText("Cached 10,000 (83.3%)")).toBeTruthy();
  expect(screen.getByText("Cache hit")).toBeTruthy();
  expect(screen.getByText(/Context input 12,000 \/ 32,768 \(36.6%\)/)).toBeTruthy();
  expect(screen.getByText(/Model capacity 1,050,000/)).toBeTruthy();
  expect(screen.getByText(/Turn totals · Input 14,000 · Output 720/)).toBeTruthy();
  expect(screen.getByRole("table", { name: "Model calls for this turn" })).toBeTruthy();
});

test.each([0, null])("distinguishes a zero cache read from unavailable cache usage (%s)", (cachedInput) => {
  const response: Metrics = { ...reply, cachedInput, cacheStatus: cachedInput === null ? "unknown" : "no_read" };
  render(<UsageDetails details={{ response, calls: [response] }} />);
  expect(screen.getByText(cachedInput === null ? "Cache usage unavailable" : "No cache read")).toBeTruthy();
  expect(screen.getByText(cachedInput === null ? "Cached —" : "Cached 0 (0.0%)")).toBeTruthy();
});

test("marks context estimates and partially known totals without discarding reported reply counts", () => {
  const response: Metrics = { ...reply, context: { ...reply.context, inputSource: "estimated" } };
  render(<UsageDetails details={{ response, calls: [{ ...reply, id: "failed", input: null, output: null, cachedInput: null, outcome: "TIMEOUT" }, response] }} />);
  expect(screen.getByText(/Context input ~12,000/)).toBeTruthy();
  expect(screen.getByText(/Turn totals · Input 12,000 \(partial: 1\/2 calls\)/)).toBeTruthy();
  expect(screen.getByText("TIMEOUT")).toBeTruthy();
});

test("old snapshots label historical counts as turn totals and keep cache/context unknown", () => {
  render(<UsageDetails totals={{ input: 60, output: 30 }} latencySeconds={1.2} />);
  expect(screen.getByText("Turn input 60")).toBeTruthy();
  expect(screen.getByText("Turn output 30")).toBeTruthy();
  expect(screen.getByText("Cached —")).toBeTruthy();
  expect(screen.getByText("Context input — / —")).toBeTruthy();
  expect(screen.getByText("1.2s")).toBeTruthy();
});

test("a skipped turn reports cache hits, last-attempt context, and validation failures", () => {
  const canvas: Metrics = { ...reply, id: "canvas", phase: "canvas", accepted: false, validationPassed: true, cachedInput: 0 };
  const rejected: Metrics = { ...reply, accepted: false, validationPassed: false, rejectionReason: "The reply exceeds 180 characters." };
  render(<UsageDetails details={{ response: null, calls: [canvas, rejected] }} />);
  expect(screen.getByText("Turn cached 10,000")).toBeTruthy();
  expect(screen.getByText("Cache hit across turn")).toBeTruthy();
  expect(screen.getByText(/Last attempted response context input 12,000 \/ 32,768/)).toBeTruthy();
  expect(screen.getByText("Validated · not published")).toBeTruthy();
  expect(screen.getByText("Rejected: The reply exceeds 180 characters.")).toBeTruthy();
});

test("a skipped turn preserves partially reported cache counts", () => {
  render(<UsageDetails details={{ response: null, calls: [{ ...reply, id: "unknown", cachedInput: null }, reply] }} />);
  expect(screen.getByText("Turn cached 10,000 (partial: 1/2 calls)")).toBeTruthy();
  expect(screen.getByText("Cache hit across turn")).toBeTruthy();
});

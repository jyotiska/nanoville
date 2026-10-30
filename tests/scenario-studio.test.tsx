// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import ScenarioStudio from "@/components/scenario-studio";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ChorusClient, type Snapshot, type Catalog } from "@/api/chorus/client";
import fixture from "./fixtures/backend-snapshot.json";
import { readFileSync } from "node:fs";
const raw = JSON.parse(readFileSync("../chorus/chorus/catalog/catalog.json", "utf8"));
const catalog: Catalog = { agents: raw.agents.map((agent: Catalog["agents"][number]) => ({ ...agent, personality: agent.personality ?? { socialStyle: "ambiverted", challengeResponse: "balanced" } })), scenarios: raw.scenarios, models: raw.models.map((m: object) => ({ ...m, installed: null })), defaultModel: raw.defaultModel };
const initial = fixture as Snapshot;
let receive: (snapshot: Snapshot) => void;
beforeEach(() => {
  localStorage.clear();
  vi.spyOn(ChorusClient.prototype, "catalog").mockResolvedValue(catalog);
  vi.spyOn(ChorusClient.prototype, "create").mockResolvedValue(initial);
  vi.spyOn(ChorusClient.prototype, "get").mockResolvedValue(initial);
  vi.spyOn(ChorusClient.prototype, "journals").mockResolvedValue([]);
  vi.spyOn(ChorusClient.prototype, "command").mockImplementation(async (_id, action) => ({ ...initial, revision: 1, status: action === "pause" ? "paused" : action === "stop" ? "stopped" : "running" }));
  vi.spyOn(ChorusClient.prototype, "subscribe").mockImplementation((_id, _revision, callback) => { receive = callback; return () => undefined; });
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
function setup() { render(<TooltipProvider><ScenarioStudio /></TooltipProvider>); }
async function start() {
  await screen.findByRole("button", { name: /Enter discussion/ });
  fireEvent.change(screen.getByLabelText("Number of turns"), { target: { value: "5" } });
  fireEvent.click(screen.getByRole("button", { name: /Enter discussion/ }));
  await screen.findByRole("button", { name: "Ⅱ Pause" });
}

test("loads the backend catalog and creates configuration without sending transcript or journals", async () => {
  setup(); await start();
  expect(ChorusClient.prototype.create).toHaveBeenCalledWith(expect.objectContaining({ scenarioId: "ai-feature-launch", maxTurns: 5, judgeEnabled: false }));
  const body = vi.mocked(ChorusClient.prototype.create).mock.calls[0][0];
  expect(Object.keys(body).sort()).toEqual(["judgeEnabled", "maxTurns", "model", "participantIds", "scenarioId"]);
  expect(ChorusClient.prototype.command).toHaveBeenCalledWith(initial.id, "start");
});

test("renders only backend-committed work and ignores stale events", async () => {
  setup(); await start();
  const value: Snapshot = { ...initial, revision: 3, status: "completed", canvas: "# Final plan\n\nCommitted work.", turns: [{ kind: "skipped", turnNumber: 1, speakerId: "software-engineer", speakerName: "Riley Chen", text: "", actions: [], tokenUsage: { input: null, output: null }, latencySeconds: 1, statChanges: [] }] };
  await act(async () => receive(value));
  expect(screen.getByRole("heading", { name: "Final document" })).toBeTruthy();
  expect(screen.getByText("Committed work.")).toBeTruthy();
  expect(screen.getByText("System notice · Turn 1 skipped")).toBeTruthy();
  await act(async () => receive({ ...initial, revision: 2, status: "running" }));
  expect(screen.getByText("Committed work.")).toBeTruthy();
  expect(ChorusClient.prototype.command).toHaveBeenCalledTimes(1);
});

test("Pause and Back issue commands without scheduling model work", async () => {
  setup(); await start();
  fireEvent.click(screen.getByRole("button", { name: "Ⅱ Pause" }));
  await waitFor(() => expect(ChorusClient.prototype.command).toHaveBeenCalledWith(initial.id, "pause"));
  await screen.findByRole("button", { name: "▶ Resume" });
  fireEvent.click(screen.getByRole("button", { name: "← Back to setup" }));
  await screen.findByRole("button", { name: /Enter discussion/ });
  expect(localStorage.getItem("nanoville.chorus-session")).toBeNull();
});

test("reload restores the saved backend session without creating another run", async () => {
  localStorage.setItem("nanoville.chorus-session", initial.id);
  setup();
  await screen.findByRole("button", { name: "▶ Start" });
  expect(ChorusClient.prototype.get).toHaveBeenCalledWith(initial.id);
  expect(ChorusClient.prototype.create).not.toHaveBeenCalled();
});

test("judge setup allows every catalog model, including MLX", async () => {
  setup();
  const enter = await screen.findByRole("button", { name: /Enter discussion/ });
  fireEvent.change(screen.getByLabelText("Judge", { exact: true }), { target: { value: "yes" } });
  for (const model of catalog.models) {
    fireEvent.change(screen.getByLabelText("Ollama model"), { target: { value: model.id } });
    expect((enter as HTMLButtonElement).disabled).toBe(false);
  }
});

function committedState(): Snapshot {
  return { ...initial, revision: 3, status: "running", agents: initial.agents.map((agent, index) => ({ ...agent, energy: index === 0 ? 69 : 76, confidence: index === 0 ? 85 : agent.confidence })),
    turns: [{ kind: "agent", turnNumber: 1, speakerId: initial.agents[0].id, speakerName: initial.agents[0].name,
      text: "I propose a focused trial.", actions: ["updated"], tokenUsage: { input: null, output: null }, latencySeconds: 1,
      statChanges: [
        { agentId: initial.agents[0].id, energy: -9, confidence: 3, reasons: ["Speaking (introverted): -6 energy, +1 confidence", "Canvas contribution: -3 energy, +2 confidence"] },
        { agentId: initial.agents[1].id, energy: 2, confidence: 0, reasons: ["Listening recovery (ambiverted): +2 energy"] },
      ] }],
  };
}

test("committed changes float over sprites once and an open profile stays live", async () => {
  setup(); await start();
  fireEvent.click(screen.getByRole("button", { name: "Riley Chen" }));
  expect((screen.getByRole("meter", { name: "Energy" }) as HTMLMeterElement).value).toBe(78);
  const value = committedState();
  await act(async () => receive(value));
  expect((screen.getByRole("meter", { name: "Energy" }) as HTMLMeterElement).value).toBe(69);
  expect((screen.getByRole("meter", { name: "Confidence" }) as HTMLMeterElement).value).toBe(85);
  expect(screen.getByText("Canvas contribution: -3 energy, +2 confidence")).toBeTruthy();
  await screen.findByText("-9 energy");
  expect(screen.getByText("+3 confidence")).toBeTruthy();
  expect(screen.getByText("+2 energy")).toBeTruthy();
  await waitFor(() => expect(screen.queryByText("-9 energy")).toBeNull(), { timeout: 3500 });
  await act(async () => receive({ ...value, revision: 4, pending: { kind: "turn", speakerId: initial.agents[1].id } }));
  expect(screen.queryByText("-9 energy")).toBeNull();
});

test("restoring a session preserves meters without replaying past popups", async () => {
  const saved: Snapshot = { ...committedState(), status: "paused" };
  localStorage.setItem("nanoville.chorus-session", saved.id);
  vi.mocked(ChorusClient.prototype.get).mockResolvedValue(saved);
  setup();
  await screen.findByRole("button", { name: "▶ Resume" });
  expect(screen.queryByText("-9 energy")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Riley Chen" }));
  expect((screen.getByRole("meter", { name: "Energy" }) as HTMLMeterElement).value).toBe(69);
});

import { expect, test } from "@playwright/test";

const modelHost = "http://127.0.0.1:11435";
test.beforeEach(async ({ request }) => {
  // Browser teardown no longer cancels server-owned execution. Pause older runs
  // before resetting the shared fake model's counters.
  const sessions = await (await request.get("/api/chorus/sessions")).json();
  for (const session of sessions) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const current = await (await request.get(`/api/chorus/sessions/${session.id}`)).json();
      if (!["running", "reviewing"].includes(current.status)) break;
      const response = await request.post(`/api/chorus/sessions/${session.id}/commands`, { data: { commandId: crypto.randomUUID(), expectedRevision: current.revision, action: "pause" } });
      if (response.ok()) break;
    }
  }
  await request.post(`${modelHost}/reset`, { data: {} });
});

test("a 20-turn discussion completes three checkpoints and one final judgement", async ({ page, request }) => {
  test.setTimeout(60000);
  await page.goto("/");
  await page.getByRole("combobox", { name: "Model", exact: true }).selectOption("qwen3.5:0.8b-mlx");
  await page.getByLabel("Number of turns").selectOption("20");
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("yes");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect(page.getByText("The team drafted a narrow trial.", { exact: true })).toBeVisible({ timeout: 55000 });
  await expect(page.getByRole("complementary", { name: "Chat conversation" }).getByRole("article")).toHaveCount(23);
  await expect(page.getByRole("button", { name: "▶ Resume" })).toHaveCount(0);
  expect(await (await request.get(`${modelHost}/state`)).json()).toMatchObject({ canvasCalls: 20, checkpointCalls: 3, finalCalls: 1, privateLeak: false });
});

test("a five-turn discussion runs through actual APIs and produces one final review with private journals isolated", async ({ page, request }) => {
  await page.goto("/");
  await page.getByLabel("Number of turns").selectOption("5");
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("yes");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect(page.getByRole("heading", { name: "Final document" })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("The team drafted a narrow trial.")).toBeVisible();
  const feed = page.getByRole("complementary", { name: "Chat conversation" });
  await expect(feed.getByRole("article")).toHaveCount(5);
  await page.getByRole("button", { name: "Riley Chen", exact: true }).click();
  await page.getByRole("button", { name: "Inner voice", exact: true }).click();
  await expect(page.getByText(/PRIVATE-E2E 1:/)).toBeVisible();
  const state = await (await request.get(`${modelHost}/state`)).json();
  expect(state).toMatchObject({ canvasCalls: 5, checkpointCalls: 0, finalCalls: 1, privateLeak: false });
});

test("Pause cancels in-flight work, Resume retries it, and Stop reviews only committed work", async ({ page, request }) => {
  await request.post(`${modelHost}/reset`, { data: { canvasDelayMs: 1000 } });
  await page.goto("/");
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("yes");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect.poll(async () => (await (await request.get(`${modelHost}/state`)).json()).canvasCalls).toBe(1);
  await page.getByRole("button", { name: "Ⅱ Pause" }).click();
  const feed = page.getByRole("complementary", { name: "Chat conversation" });
  await expect(feed.getByRole("article")).toHaveCount(0);
  await page.getByRole("button", { name: "▶ Resume" }).click();
  await expect(feed.getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "■ Stop" }).click();
  await expect(page.getByText("Early-stop review")).toBeVisible();
  await expect(page.getByText("The team drafted a narrow trial.")).toBeVisible();
  await expect(feed.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "■ Stop" })).toBeDisabled();
});

test("a checkpoint appears after five contributions and Back to setup starts a fresh discussion", async ({ page, request }) => {
  await page.goto("/");
  await page.getByLabel("Number of turns").selectOption("10");
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("yes");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect(page.getByText("Review after turn 5")).toBeVisible({ timeout: 30000 });
  await page.getByRole("button", { name: "Ⅱ Pause" }).click();
  expect((await (await request.get(`${modelHost}/state`)).json()).checkpointCalls).toBe(1);
  await page.getByRole("button", { name: "← Back to setup" }).click();
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("no");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect(page.getByText("Review after turn 5")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "About Judge" })).toHaveCount(0);
  await page.getByRole("button", { name: "■ Stop" }).click();
});

test("invalid canvas drafts keep the discussion running and preserve the last valid document", async ({ page, request }) => {
  await request.post(`${modelHost}/reset`, { data: { invalidCanvasTurn: 2 } });
  await page.goto("/");
  await page.getByLabel("Number of turns").selectOption("5");
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("yes");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  const feed = page.getByRole("complementary", { name: "Chat conversation" });
  await expect(feed.getByRole("article")).toHaveCount(2);
  await expect(feed.getByText("Canvas unchanged this turn")).toBeVisible();
  await expect(page.getByText("Public work after 1 turns: safeguard 1 requires human review.")).toBeVisible();
  await expect(feed.getByText("I propose a retention review for turn 2.")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Final document" })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("The team drafted a narrow trial.")).toBeVisible();
  await expect(feed.getByRole("article")).toHaveCount(5);
  await expect(page.getByText("Discussion paused", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Public work after 5 turns: safeguard 5 requires human review.")).toBeVisible();
  expect(await (await request.get(`${modelHost}/state`)).json()).toMatchObject({ canvasCalls: 7, finalCalls: 1, privateLeak: false });
});

test("repeated invalid speech is skipped and the next participant continues with the saved canvas", async ({ page, request }) => {
  await request.post(`${modelHost}/reset`, { data: { invalidSpeechTurn: 2 } });
  await page.goto("/");
  await page.getByLabel("Number of turns").selectOption("5");
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("yes");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  const feed = page.getByRole("complementary", { name: "Chat conversation" });
  await expect(feed.getByText("System notice · Turn 2 skipped")).toBeVisible();
  await expect(page.getByText("Public work after 1 turns: safeguard 1 requires human review.")).toBeVisible();
  await expect(page.getByRole("button", { name: "About Jordan Brooks · Speaking" })).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Final document" })).toBeVisible({ timeout: 30000 });
  await expect(page.getByText("The team drafted a narrow trial.")).toBeVisible();
  await expect(feed.getByRole("article")).toHaveCount(5);
  await expect(feed.getByText("I added proposed safeguard 1.")).toHaveCount(1);
  await expect(feed.getByText("I added proposed safeguard 3.")).toBeVisible();
  await page.getByRole("button", { name: "Jordan Brooks", exact: true }).click();
  await page.getByRole("button", { name: "Inner voice", exact: true }).click();
  await expect(page.getByText(/PRIVATE-E2E 2:/)).toHaveCount(0);
  expect(await (await request.get(`${modelHost}/state`)).json()).toMatchObject({ canvasCalls: 5, spokenCalls: 7, finalCalls: 1, privateLeak: false });
});


test("reload restores a paused durable session without starting duplicate work", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect(page.getByRole("complementary", { name: "Chat conversation" }).getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Ⅱ Pause" }).click();
  await expect(page.getByRole("button", { name: "▶ Resume" })).toBeVisible();
  const id = await page.evaluate(() => localStorage.getItem("nanoville.chorus-session"));
  const before = await (await request.get(`/api/chorus/sessions/${id}`)).json();
  await page.reload();
  await expect(page.getByRole("button", { name: "▶ Resume" })).toBeVisible();
  const after = await (await request.get(`/api/chorus/sessions/${id}`)).json();
  expect(after.revision).toBe(before.revision);
  expect(after.turns).toEqual(before.turns);
  expect(after.agents).toEqual(before.agents);
});

test("personality stats animate, stay live in the profile, and survive reload", async ({ page, request }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await request.post(`${modelHost}/reset`, { data: { canvasDelayMs: 250 } });
  await page.goto("/");
  await page.getByLabel("Number of turns").selectOption("5");
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect(page.getByText("-9 energy", { exact: true }).first()).toBeAttached();
  await page.getByRole("button", { name: "Riley Chen", exact: true }).click();
  await expect(page.getByRole("meter", { name: "Energy" })).toHaveAttribute("value", "69");
  await expect(page.getByText("Speaking (introverted): -6 energy, +1 confidence")).toBeVisible();
  await expect(page.getByText("Canvas contribution: -3 energy, +2 confidence")).toBeVisible();
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Ⅱ Pause" }).click();
  await expect(page.getByRole("button", { name: "▶ Resume" })).toBeVisible();
  const scene = page.getByRole("region", { name: "Corporate meeting room discussion scene" }).locator(":scope > div").first();
  const popup = page.getByText("-9 ⚡", { exact: true }).locator("..").locator("..");
  await expect(popup).toHaveCSS("opacity", "1");
  await scene.screenshot({ path: "test-results/agent-state-scene.png" });
  await page.setViewportSize({ width: 390, height: 844 });
  await scene.screenshot({ path: "test-results/agent-state-mobile.png" });
  const [popupBox, sceneBox] = await Promise.all([popup.boundingBox(), scene.boundingBox()]);
  expect(popupBox!.y).toBeGreaterThanOrEqual(sceneBox!.y);
  const id = await page.evaluate(() => localStorage.getItem("nanoville.chorus-session"));
  const before = await (await request.get(`/api/chorus/sessions/${id}`)).json();
  expect(before.turns[0].statChanges.find((change: { agentId: string }) => change.agentId === "software-engineer")).toMatchObject({ energy: -9, confidence: 3 });
  await page.reload();
  await expect(page.getByRole("button", { name: "▶ Resume" })).toBeVisible();
  await expect(page.getByText("-9 energy", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Riley Chen", exact: true }).click();
  await expect(page.getByRole("meter", { name: "Energy" })).toHaveAttribute("value", String(before.agents.find((agent: { id: string }) => agent.id === "software-engineer").energy));
  await page.screenshot({ path: "test-results/agent-state-profile.png", animations: "disabled" });
});

test("opens and controls a session created outside nanoville", async ({ page, request }) => {
  const options = await (await request.get("/api/chorus/scenarios?collection=chorus-web")).json();
  const scenario = options.find((s: { id: string }) => s.id === "chorus-web:debate");
  const created = await (await request.post("/api/chorus/sessions", { data: { scenarioId: scenario.id, participantIds: scenario.suggestedAgents, model: "qwen3.5:4b-mlx", maxTurns: 5, judgeEnabled: false } })).json();
  await request.post(`/api/chorus/sessions/${created.id}/commands`, { data: { commandId: "external-start", expectedRevision: 0, action: "start" } });
  await page.goto(`/?session=${created.id}`);
  await expect(page.getByRole("heading", { name: "debate", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Ⅱ Pause" }).click();
  await expect(page.getByRole("button", { name: "▶ Resume" })).toBeVisible();
  expect((await (await request.get(`/api/chorus/sessions/${created.id}`)).json()).status).toBe("paused");
});

test("multiple private adversaries survive reload while participants and every judge call stay blind", async ({ page, request }) => {
  test.setTimeout(60000);
  await request.post(`${modelHost}/reset`, { data: { canvasDelayMs: 150 } });
  await page.goto("/");
  await page.getByRole("checkbox", { name: "Adversary: Riley Chen" }).check();
  await page.getByRole("checkbox", { name: "Adversary: Jordan Brooks" }).check();
  await page.getByRole("combobox", { name: "Model", exact: true }).selectOption("qwen3.5:0.8b-mlx");
  await page.getByLabel("Number of turns").selectOption("10");
  await page.getByRole("combobox", { name: "Judge", exact: true }).selectOption("yes");
  await page.screenshot({ path: "test-results/adversary-setup.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("checkbox", { name: "Adversary: Riley Chen" }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("checkbox", { name: "Adversary: Alex Okafor" })).toBeVisible();
  await page.screenshot({ path: "test-results/adversary-setup-mobile.png" });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: /Enter discussion/ }).click();
  await expect(page.getByText(/Observer only · Adversaries: Riley Chen, Jordan Brooks/)).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Chat conversation" }).getByRole("article")).toHaveCount(1);
  await page.getByRole("button", { name: "Ⅱ Pause" }).click();
  await expect(page.getByRole("button", { name: "▶ Resume" })).toBeVisible();
  const id = await page.evaluate(() => localStorage.getItem("nanoville.chorus-session"));
  await page.reload();
  await expect(page.getByText(/Observer only · Adversaries: Riley Chen, Jordan Brooks/)).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Adversary:/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Riley Chen", exact: true }).click();
  await expect(page.getByText(/Adversary · Observer only/)).toBeVisible();
  await page.screenshot({ path: "test-results/adversary-profile.png", animations: "disabled" });
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "▶ Resume" }).click();
  await expect(page.getByText("The team drafted a narrow trial.", { exact: true })).toBeVisible({ timeout: 40000 });
  const saved = await (await request.get(`/api/chorus/sessions/${id}`)).json();
  expect(saved.config.adversaryIds).toEqual(["software-engineer", "product-manager"]);
  const state = await (await request.get(`${modelHost}/state`)).json();
  expect(state).toMatchObject({ checkpointCalls: 1, finalCalls: 1, privateLeak: false });
  expect(state.assignmentCalls.some((call: { assigned: boolean }) => call.assigned)).toBe(true);
  for (const call of state.assignmentCalls) {
    expect(call.assigned).toBe(call.phase !== "judge" && ["Riley Chen", "Jordan Brooks"].includes(call.speaker));
  }
});

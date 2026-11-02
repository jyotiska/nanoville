import { expect, test } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  const sessions = await (await request.get("/api/chorus/v2/sessions")).json();
  for (const state of sessions) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const current = await (await request.get(`/api/chorus/v2/sessions/${state.id}`)).json();
      if (!["running", "reviewing"].includes(current.status)) break;
      const result = await request.post(`/api/chorus/v2/sessions/${state.id}/commands`, { data: { commandId: crypto.randomUUID(), expectedRevision: current.revision, action: "pause" } });
      if (result.ok()) break;
    }
  }
});

test("Luna defaults, relevant agents auto-select, and user edits survive renders", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("combobox", { name: "Model", exact: true })).toHaveValue("gpt-6-luna");
  await expect(page.getByRole("checkbox", { name: /^Select / })).toHaveCount(50);
  await expect(page.getByRole("checkbox", { name: "Select Alex", exact: true })).toBeChecked();
  await page.getByRole("checkbox", { name: "Select Alex", exact: true }).uncheck();
  await page.getByRole("checkbox", { name: "Select Avery", exact: true }).check();
  await page.getByRole("spinbutton", { name: "Turns per agent" }).fill("3");
  await expect(page.getByRole("checkbox", { name: "Select Alex", exact: true })).not.toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Select Avery", exact: true })).toBeChecked();
  await page.getByRole("combobox", { name: "Problem", exact: true }).selectOption("transaction-ledger");
  await expect(page.getByRole("checkbox", { name: "Select Quinn", exact: true })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: "Select Avery", exact: true })).not.toBeChecked();
  await expect(page.getByRole("button", { name: "Start session", exact: true })).toBeDisabled();
  await page.getByRole("combobox", { name: "Model", exact: true }).selectOption("qwen3.5:4b-mlx");
  await expect(page.getByRole("button", { name: "Start session", exact: true })).toBeEnabled();
});

test("actual tool loop completes with concise mentions, summaries, usage, and final report", async ({ page, request }) => {
  await page.goto("/");
  await page.getByRole("combobox", { name: "Problem", exact: true }).selectOption("production-mix");
  await page.getByRole("combobox", { name: "Model", exact: true }).selectOption("qwen3.5:4b-mlx");
  await page.getByRole("spinbutton", { name: "Turns per agent" }).fill("1");
  await page.getByRole("button", { name: "Start session", exact: true }).click();
  await expect(page.getByText("Solution correct", { exact: true })).toBeVisible({ timeout: 35000 });
  await expect(page.getByText("The team produced a checked shared solution.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Evidence 1", exact: true }).first().click();
  await expect(page.getByRole("dialog", { name: "Source evidence" })).toBeVisible();
  await page.getByRole("button", { name: "Close evidence", exact: true }).click();
  const id = await page.evaluate(() => localStorage.getItem("chorus.harness.session"));
  const state = await (await request.get(`/api/chorus/v2/sessions/${id}`)).json();
  expect(state.status).toBe("completed");
  expect(state.config.maxTurnsPerAgent).toBe(1);
  expect(state.workers.every((w: { turnsStarted: number }) => w.turnsStarted === 1)).toBe(true);
  const board = await (await request.get(`/api/chorus/v2/sessions/${id}/records?kind=board`)).json();
  expect(board.records).toHaveLength(5);
  for (const row of board.records) {
    expect(row.data.text.length).toBeLessThanOrEqual(400);
    expect(row.data.text).toContain("@");
    expect(row.data).not.toHaveProperty("parentId");
  }
  await page.getByRole("button", { name: /Drew/ }).filter({ has: page.locator("progress") }).click();
  await expect(page.getByRole("dialog", { name: "Drew details" })).toBeVisible();
  await page.getByRole("tab", { name: "Reasoning summaries" }).click();
  await expect(page.getByText("Published validated work only.", { exact: true })).toBeVisible();
  await page.getByRole("tab", { name: "Calls", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("costSource", { exact: true }).first()).toBeVisible();
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.reload();
  await expect(page.getByText("Solution correct", { exact: true })).toBeVisible();
  const usage = await (await request.get(`/api/chorus/v2/sessions/${id}/usage`)).json();
  expect(usage.total.callCount).toBeGreaterThan(usage.participants.callCount);
  expect(usage.total.unknownInputCalls).toBe(0);
  const exported = await (await request.get(`/api/chorus/v2/sessions/${id}/export`)).json();
  expect(exported.records.summary).toHaveLength(5);
  expect(exported.records.change).toHaveLength(1);
  expect(exported.session.report.agents).toHaveLength(5);
});

test("fifty-agent roster is complete, artwork loads, and narrow screens contain overflow", async ({ page, request, baseURL }) => {
  const catalog = await (await request.get("/api/chorus/v2/catalog")).json();
  const response = await request.post("/api/chorus/v2/sessions", { data: { problemId: "production-mix", participantIds: catalog.agents.map((a: { id: string }) => a.id), model: "qwen3.5:4b-mlx", maxTurnsPerAgent: 1, judgeEnabled: false } });
  expect(response.ok()).toBe(true);
  const state = await response.json();
  await page.goto(`/?session=${state.id}`);
  await expect(page.getByRole("progressbar")).toHaveCount(50);
  if (baseURL?.includes(":3100")) {
    await expect(page.getByRole("img", { name: /animated sprite/ })).toHaveCount(50);
    await page.getByRole("slider", { name: "Scene zoom" }).fill("1.25");
  }
  expect((await request.get("/api/chorus/v2/assets/oakley/sprite.svg")).status()).toBe(200);
  expect((await request.get("/api/chorus/v2/assets/alex/portrait.svg")).status()).toBe(200);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: "Participants", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.screenshot({ path: `test-results/harness-${baseURL?.includes(":3100") ? "nanoville" : "chorus"}-50-mobile.png`, fullPage: true });
});

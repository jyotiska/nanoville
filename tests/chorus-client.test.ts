import { afterEach, expect, test, vi } from "vitest";
import { ChorusClient } from "@/api/chorus/client";
import fixture from "./fixtures/backend-snapshot.json";
afterEach(() => vi.restoreAllMocks());
test("rejects malformed backend snapshots instead of rendering unvalidated state", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ...fixture, turns: [{ kind: "invented" }] })));
  await expect(new ChorusClient().get(fixture.id)).rejects.toThrow(/invalid Snapshot/);
  vi.unstubAllGlobals();
});
test("controls send IDs and revision, never a browser transcript or journal", async () => {
  const fetch = vi.fn().mockImplementation(async () => Response.json(fixture)); vi.stubGlobal("fetch", fetch);
  await new ChorusClient().command(fixture.id, "pause");
  const body = JSON.parse(fetch.mock.calls[1][1].body);
  expect(body).toEqual({ commandId: expect.any(String), expectedRevision: fixture.revision, action: "pause" });
  vi.unstubAllGlobals();
});

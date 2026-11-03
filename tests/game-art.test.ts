import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { pixelArtwork, pixelSprite } from "@/components/game/agent-art";

describe("Nanoville's original artwork", () => {
  it("explicitly covers every current persona with an available local pixel sprite", () => {
    const catalog = JSON.parse(readFileSync(resolve("../chorus/chorus/harness/catalog.json"), "utf8")) as { agents: { id: string }[] };
    expect(Object.keys(pixelArtwork).sort()).toEqual(catalog.agents.map((agent) => agent.id).sort());
    for (const agent of catalog.agents) {
      expect(existsSync(resolve("public", pixelSprite(agent.id).slice(1)))).toBe(true);
    }
  });
});

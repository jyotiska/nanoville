import type { Catalog } from "@/api/chorus/client";
import artwork from "./agent-art.json";
export type Mood = string;
export type Agent = Catalog["agents"][number] & { sprite: string; color: string };
export function presentAgent(agent: Catalog["agents"][number]): Agent {
  const art = artwork[agent.id as keyof typeof artwork];
  return { ...agent, sprite: art?.sprite ?? "engineer", color: art?.color ?? "#d4eee7" };
}

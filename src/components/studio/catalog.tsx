"use client";
import { createContext, useContext } from "react";
import type { Catalog } from "@/api/chorus/client";
import { presentAgent } from "@/data/agents";
export const CatalogContext = createContext<Catalog | null>(null);
export function useCatalog() {
  const catalog = useContext(CatalogContext);
  if (!catalog) throw new Error("The Chorus catalog has not loaded.");
  return { ...catalog, agents: catalog.agents.filter((a) => a.collection === "nanoville").map(presentAgent), scenarios: catalog.scenarios.filter((s) => s.collection === "nanoville") };
}

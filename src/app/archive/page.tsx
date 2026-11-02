import ScenarioStudio from "@/components/scenario-studio";
import { ArchiveBrowser } from "@/api/chorus/harness-workspace";
import { Suspense } from "react";
import { connection } from "next/server";
async function Content() { await connection(); return process.env.CHORUS_LEGACY_TEST_UI === "1" ? <ScenarioStudio /> : <ArchiveBrowser />; }
export default function Archive() { return <Suspense fallback={<p>Loading archives…</p>}><Content /></Suspense>; }

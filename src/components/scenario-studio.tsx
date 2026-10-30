"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Agent } from "@/data/agents";
import { judge } from "@/data/judge";
import { locations } from "@/data/scenarios";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { useDiscussion } from "@/features/discussion/client/use-discussion";
import { sessionView } from "@/features/discussion/session";
import { ScenarioSetup, type StudioConfig } from "./studio/setup";
import { SessionScene } from "./studio/scene";
import { CanvasPanel, DiscussionPanel, JournalPanel, JudgementPanel } from "./studio/panels";
import { AgentProfile } from "./studio/profile";
import { ChorusClient, type Catalog } from "@/api/chorus/client";
import { CatalogContext, useCatalog } from "./studio/catalog";
import styles from "./scenario-studio.module.css";

export default function ScenarioStudio() {
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { let active = true; void new ChorusClient().catalog().then((value) => { if (active) setCatalog(value); }).catch((e: unknown) => { if (active) setError(e instanceof Error ? e.message : "Cannot reach Chorus."); }); return () => { active = false; }; }, []);
  if (!catalog) return <main><p role={error ? "alert" : "status"}>{error || "Connecting to Chorus…"}</p>{error && <button onClick={() => window.location.reload()}>Retry connection</button>}</main>;
  return <CatalogContext.Provider value={catalog}><StudioContent /></CatalogContext.Provider>;
}
function StudioContent() {
  const { scenarios, defaultModel } = useCatalog();
  const [config, setConfig] = useState<StudioConfig>({ scenarioId: scenarios[0].id, participantIds: scenarios[0].suggestedAgents, locationId: "meeting-room", model: defaultModel, maxTurns: 20, judgeEnabled: false });
  const [inspectedAgent, setInspectedAgent] = useState<Agent | null>(null);
  const [innerVoiceAgent, setInnerVoiceAgent] = useState<Agent | null>(null);
  const discussion = useDiscussion();
  const { session, busy, error, errorCode } = discussion;
  const contextBlocked = errorCode === "CONTEXT_LIMIT";
  const { status, turns, canvas, finalJudgement } = session;
  const { completedTurns, participants, finalReviewDue, reviewing, activeAgent } = sessionView(session);
  const scenario = session.scenario ?? scenarios.find((item) => item.id === config.scenarioId)!;
  const location = locations.find((item) => item.id === config.locationId)!;
  const { maxTurns, judgeEnabled } = session.config ?? config;
  const lastTurn = turns.at(-1);
  const sessionLabel = status === "stopped" ? "Stopped" : status === "completed" ? "Complete"
    : status === "paused" ? "Paused" : reviewing ? "Judge reviewing…" : busy ? "Thinking…" : "Discussing";

  useEffect(() => {
    if (!innerVoiceAgent) return;
    const frame = window.requestAnimationFrame(() => document.getElementById("inner-voice-panel")?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [innerVoiceAgent]);

  function returnToSetup() {
    void discussion.back();
    setInspectedAgent(null);
    setInnerVoiceAgent(null);
  }

  if (status === "setup") return <><p role="alert">{error}</p><ScenarioSetup config={config} onChange={setConfig} onStart={() => {
    setInnerVoiceAgent(null);
    void discussion.start(config);
  }} busy={busy} /></>;

  return (
    <Dialog open={Boolean(inspectedAgent)} onOpenChange={(open) => { if (!open) setInspectedAgent(null); }}>
      <main className={styles.app}>
        <div className={styles.sessionShell}>
          <header className={styles.sessionHeader}>
            <a className={styles.brand} href="#top"><Image className={styles.brandLogo} src="/nanoville-logo-horizontal.png" alt="nanoville" width={2172} height={724} /></a>
            <Button type="button" variant="ghost" className={styles.textButton} onClick={returnToSetup}>← Back to setup</Button>
          </header>
          <div className={styles.sessionTitle}>
            <div><h1>{scenario.title}</h1></div>
            <div className={styles.peoplePills}>{[...participants, ...(judgeEnabled ? [judge] : [])].map((agent) => <DialogTrigger key={agent.id} onClick={() => setInspectedAgent(agent)}>{agent.name}</DialogTrigger>)}</div>
          </div>
          <div className={`${styles.workspace} ${innerVoiceAgent ? styles.workspaceWithInnerVoice : ""}`}>
            <section className={styles.sceneColumn} aria-label={`${location.name} discussion scene`}>
              <SessionScene session={session} busy={busy} locationId={config.locationId} sessionLabel={sessionLabel} onInspect={setInspectedAgent} />
              {lastTurn && lastTurn.kind !== "skipped" && <div className={styles.speechBubble}><strong>{lastTurn.speakerName}</strong><span>{lastTurn.text}</span></div>}
              <div className={styles.controls}>
                <div className={styles.turnInfo}>
                  <span className={styles.turnLabel}>{activeAgent ? `UP NEXT · ${activeAgent.name}` : sessionLabel.toUpperCase()}</span>
                  <span className={styles.turnSub}>{completedTurns} of {maxTurns} turns{activeAgent ? ` · ${activeAgent.role}` : ""}</span>
                </div>
                <div className={styles.controlButtons}>
                  <Button type="button" variant="ghost" className={styles.secondaryButton} onClick={discussion.pauseOrResume} disabled={status === "stopped" || status === "completed" || (status === "paused" && contextBlocked)}>{status === "ready" ? "▶ Start" : status === "paused" ? "▶ Resume" : "Ⅱ Pause"}</Button>
                  <Button type="button" variant="ghost" className={styles.finishButton} onClick={discussion.stop} disabled={status === "stopped" || status === "completed" || finalReviewDue}>■ Stop</Button>
                </div>
              </div>
              {error && <div className={styles.errorBox} role="alert"><strong>{reviewing ? "Judge review paused" : "Discussion paused"}</strong><span>{error}</span><small>{contextBlocked ? "The saved canvas and discussion remain available. Return to setup to start a shorter discussion." : finalReviewDue ? "Resume to retry the final judgement." : "Resume to retry, or stop the discussion."}</small></div>}
              <CanvasPanel canvas={canvas} completed={status === "completed" || completedTurns >= maxTurns} />
              {judgeEnabled && (finalReviewDue || finalJudgement) && <JudgementPanel session={session} canRetry={!contextBlocked} />}
            </section>
            <DiscussionPanel session={session} busy={busy} />
            {innerVoiceAgent && <JournalPanel session={session} agent={innerVoiceAgent} onClose={() => setInnerVoiceAgent(null)} />}
          </div>
        </div>
        {inspectedAgent && <AgentProfile agent={participants.find((agent) => agent.id === inspectedAgent.id) ?? inspectedAgent} session={session} onJournal={(agent) => { setInnerVoiceAgent(agent); setInspectedAgent(null); }} />}
      </main>
    </Dialog>
  );
}

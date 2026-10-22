import { useCatalog } from "./catalog";
import { locations, type LocationId, type Scenario } from "@/data/scenarios";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { turnOptions } from "@/lib/discussion";
import type { SessionConfig } from "@/api/chorus/client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import styles from "../scenario-studio.module.css";

export type StudioConfig = SessionConfig & { locationId: LocationId };
export function ScenarioSetup({ config, onChange, onStart, busy = false }: { busy?: boolean; config: StudioConfig; onChange: (config: StudioConfig) => void; onStart: () => void }) {
  const { agents, scenarios, models: ollamaModels } = useCatalog();
  const { scenarioId, participantIds: selectedAgentIds, locationId, model, maxTurns, judgeEnabled } = config;
  const scenario = scenarios.find((item) => item.id === scenarioId)!;
  const location = locations.find((item) => item.id === locationId)!;
  const participants = agents.filter((agent) => selectedAgentIds.includes(agent.id));
  function chooseScenario(next: Scenario) {
    onChange({ ...config, scenarioId: next.id, participantIds: next.suggestedAgents });
  }
  function toggleAgent(id: string) {
    const ids = selectedAgentIds.includes(id) ? selectedAgentIds.filter((item) => item !== id)
      : selectedAgentIds.length < 5 ? [...selectedAgentIds, id] : selectedAgentIds;
    onChange({ ...config, participantIds: ids });
  }
  return (
    <main className={styles.app} id="top">
      <div className={styles.setupShell}>
        <header className={styles.topbar}>
          <a className={styles.brand} href="#top"><Image className={styles.brandLogo} src="/nanoville-logo-horizontal.png" alt="Nanoville" width={2172} height={724} /></a>
        </header>
        <section className={styles.hero}>
          <div><h1>Work through a problem <em>together.</em></h1><p className={styles.heroText}>Pick a challenge, talk it through as a team, and leave with a clear next step.</p></div>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.sectionTitle}><span>01</span><div><h2>Choose a challenge</h2><p>Pick a situation your team can help solve.</p></div></div>
          <div className={styles.scenarioGrid}>
            {scenarios.map((item, index) => <Card className={styles.choiceCardFrame} key={item.id}>
              <Button type="button" variant="ghost" className={`${styles.scenarioCard} ${item.id === scenarioId ? styles.scenarioSelected : ""}`} onClick={() => chooseScenario(item)} aria-pressed={item.id === scenarioId}>
                <span className={styles.scenarioIndex}>{String(index + 1).padStart(2, "0")}</span><span className={styles.scenarioArrow}>↗</span><h3>{item.title}</h3><p>{item.summary}</p>
              </Button>
            </Card>)}
          </div>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.sectionTitle}><span>02</span><div><h2>Choose your team</h2><p>Pick 2–5 people. We’ve picked a starting team for you.</p></div><span className={styles.selectedCount}>{participants.length} of 5 picked</span></div>
          <div className={styles.agentGrid}>
            {agents.map((agent) => <Card className={`${styles.choiceCardFrame} ${styles.agentCardFrame}`} key={agent.id}>
              <Button type="button" variant="ghost" className={`${styles.agentOption} ${selectedAgentIds.includes(agent.id) ? styles.agentOptionSelected : ""}`} onClick={() => toggleAgent(agent.id)} aria-pressed={selectedAgentIds.includes(agent.id)}>
                <Image src={`/agents/${agent.sprite}.webp`} alt="" width={54} height={54} unoptimized /><span><strong>{agent.name}</strong><small>{agent.role}</small></span><span className={styles.checkMark}>{selectedAgentIds.includes(agent.id) ? "✓" : "+"}</span>
              </Button>
            </Card>)}
          </div>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.sectionTitle}><span>03</span><div><h2>Choose where to meet</h2><p>Pick a place for the discussion.</p></div></div>
          <div className={styles.locationGrid}>
            {locations.map((item) => <Card className={styles.choiceCardFrame} key={item.id}>
              <Button type="button" variant="ghost" className={`${styles.locationCard} ${item.id === locationId ? styles.locationSelected : ""}`} onClick={() => onChange({ ...config, locationId: item.id })} aria-pressed={item.id === locationId}>
                <span className={styles.locationImage} style={{ backgroundImage: `url(${item.image})` }}><span>{item.id === locationId ? "✓ PICKED" : "CHOOSE THIS PLACE"}</span></span><strong>{item.name}</strong><small>{item.detail}</small>
              </Button>
            </Card>)}
          </div>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.sectionTitle}><span>04</span><div><h2>Choose a local model</h2><p>This model will power the discussion and shared document.</p></div></div>
          <label className={styles.modelField} htmlFor="ollama-model">
            <span>Ollama model</span>
            <NativeSelect className={styles.nativeSelect} id="ollama-model" value={model} onChange={(event) => ollamaModels.some((model) => model.id === event.target.value) && onChange({ ...config, model: event.target.value })}>
              {ollamaModels.map((item) => <NativeSelectOption key={item.id} value={item.id}>{item.label}</NativeSelectOption>)}
            </NativeSelect>
          </label>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.sectionTitle}><span>05</span><div><h2>Choose the discussion length</h2><p>Each turn is one agent’s contribution. The discussion starts when you enter the scene.</p></div></div>
          <label className={styles.modelField} htmlFor="discussion-turns">
            <span>Number of turns</span>
            <NativeSelect className={styles.nativeSelect} id="discussion-turns" value={maxTurns} onChange={(event) => onChange({ ...config, maxTurns: Number(event.target.value) })}>
              {turnOptions.map((count) => <NativeSelectOption key={count} value={count}>{count} turns</NativeSelectOption>)}
            </NativeSelect>
          </label>
        </section>

        <section className={styles.setupSection}>
          <div className={styles.sectionTitle}><span>06</span><div><h2>Include a judge</h2><p>Get feedback every five turns and a final judgement using your selected model.</p></div></div>
          <label className={styles.modelField} htmlFor="discussion-judge">
            <span>Judge</span>
            <NativeSelect className={styles.nativeSelect} id="discussion-judge" value={judgeEnabled ? "yes" : "no"} onChange={(event) => onChange({ ...config, judgeEnabled: event.target.value === "yes" })}>
              <NativeSelectOption value="no">No</NativeSelectOption>
              <NativeSelectOption value="yes">Yes</NativeSelectOption>
            </NativeSelect>
          </label>
        </section>

        <section className={styles.briefSection}>
          <div><h2>{scenario.title}</h2><p>{scenario.problem}</p></div>
          <div className={styles.briefDetails}><div><strong>KEEP IN MIND</strong><ul>{scenario.guidelines.map((line) => <li key={line}>{line}</li>)}</ul></div><div className={styles.deliverable}><strong>DELIVERABLES</strong><p>{scenario.deliverable}</p></div></div>
        </section>

        <div className={styles.startBar}><span>{participants.length < 2 ? "Choose at least two people to start." : `${scenario.title} · ${participants.length} people · ${location.name} · ${maxTurns} turns`}</span><Button type="button" variant="ghost" className={styles.primaryButton} onClick={onStart} disabled={participants.length < 2 || busy}>Enter discussion <span>→</span></Button></div>
        <footer className={styles.footer}><a className={styles.brand} href="#top"><Image className={styles.brandLogo} src="/nanoville-logo-horizontal.png" alt="Nanoville" width={2172} height={724} /></a></footer>
      </div>
    </main>
  );
}

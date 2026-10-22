import Image from "next/image";
import { ArrowDownToLine, ArrowUpFromLine, Timer } from "lucide-react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Agent } from "@/data/agents";
import { judge } from "@/data/judge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { sessionView, type Session } from "@/features/discussion/session";
import styles from "../scenario-studio.module.css";

export function CanvasPanel({ canvas, completed }: { canvas: string; completed: boolean }) {
  const status = completed ? "completed" : "running";
  return (
    <Card className={styles.panel}>
      <div className={styles.panelHead}><div><h2>{status === "completed" ? "Final document" : "Common canvas"}</h2></div><span className={styles.itemCount}>Read only</span></div>
      <div className={styles.canvasBody}>
        {canvas ? <div className={styles.canvasDocument}><Markdown remarkPlugins={[remarkGfm]} skipHtml>{canvas}</Markdown></div> : <div className={styles.emptyCanvas}><span className={styles.emptyIcon}>▤</span><strong>Your team’s document will show up here.</strong><span>All agents read and revise the same Markdown canvas.</span></div>}
      </div>
    </Card>
  );
}

export function JudgementPanel({ session, canRetry = true }: { session: Session; canRetry?: boolean }) {
  const { finalJudgement, endedEarly, status } = session;
  const scenario = session.scenario!;
  return (
    <Card className={styles.panel} aria-label="Final judge judgement">
      <div className={styles.panelHead}><h2>Final judgement</h2><span className={styles.itemCount}>{endedEarly ? "Early-stop review" : "Turn-limit review"}</span></div>
      <div className={styles.judgementBody}>
        {finalJudgement ? <>
          <strong className={styles.judgeVerdict}>{finalJudgement.verdict}</strong>
          <p>{finalJudgement.summary}</p>
          <h3>Requirements assessment</h3>
          <dl className={styles.judgeRequirements}>{finalJudgement.requirements.map((item) => <div key={item.criterion}>
            <dt>{item.criterion === "Expected deliverable" ? scenario.deliverable : scenario.guidelines[Number(item.criterion.split(" ")[1]) - 1]}<span>{item.status}</span></dt>
            <dd>{item.evidence}</dd>
          </div>)}</dl>
          {([["What went well", finalJudgement.strengths], ["What needs improvement", finalJudgement.improvements], ["Remaining priorities", finalJudgement.nextPriorities]] as const).map(([title, items]) => <div key={title}><h3>{title}</h3><ul>{items.map((item, index) => <li key={index}>{item}</li>)}</ul></div>)}
          <h3>Response to feedback</h3><p>{finalJudgement.feedbackResponse}</p>
        </> : <p role="status">{status === "paused" ? canRetry ? "Final review paused. Resume to retry." : "Final review exceeds the context budget. Your final document is preserved." : "The judge is reviewing the conversation and final canvas…"}</p>}
      </div>
    </Card>
  );
}

export function DiscussionPanel({ session, busy }: { session: Session; busy: boolean }) {
  const { turns } = session;
  const { participants, completedTurns, reviewing } = sessionView(session);
  const { maxTurns } = session.config!;
  return (
    <aside className={styles.sideColumn} aria-label="Chat conversation">
      <Card className={`${styles.panel} ${styles.transcriptPanel}`}>
        <div className={styles.panelHead}><h2>Discussion</h2><span className={styles.itemCount}>{completedTurns} / {maxTurns} turns</span></div>
        <div className={styles.transcript}>
          {busy && <div className={styles.loadingLine} role="status"><span />{reviewing ? "Judge reviewing…" : "Working on a reply…"}</div>}
          {turns.length === 0 ? <div className={styles.transcriptEmpty}>The discussion will show up here.</div> : [...turns].reverse().map((turn) => (
            <article className={`${styles.transcriptTurn} ${turn.kind === "judge" ? styles.judgeTurn : ""}`} key={`${turn.kind}-${turn.turnNumber}`}>
              <Image src={`/agents/${turn.kind === "judge" ? judge.sprite : participants.find((agent) => agent.id === turn.speakerId)?.sprite}.webp`} alt="" width={32} height={32} unoptimized />
              <div><strong>{turn.speakerName}</strong>{turn.kind === "skipped" && <span className={styles.judgeCheckpoint}>System notice · Turn {turn.turnNumber} skipped</span>}{turn.kind === "judge" && <span className={styles.judgeCheckpoint}>Review after turn {turn.turnNumber}</span>}<p>{turn.kind === "skipped" ? "Turn skipped after repeated invalid replies. Continuing the discussion; the canvas is unchanged." : turn.text}</p><div className={styles.tokenUsage} aria-label={`Input tokens: ${turn.tokenUsage?.input ?? "unavailable"}; output tokens: ${turn.tokenUsage?.output ?? "unavailable"}; latency: ${turn.latencySeconds === undefined ? "unavailable" : `${turn.latencySeconds} seconds`}`}><span><ArrowDownToLine aria-hidden="true" />{turn.tokenUsage?.input ?? "—"}</span><span><ArrowUpFromLine aria-hidden="true" />{turn.tokenUsage?.output ?? "—"}</span><span><Timer aria-hidden="true" />{turn.latencySeconds === undefined ? "—" : `${turn.latencySeconds.toFixed(1)}s`}</span></div>{turn.actions.length > 0 ? <span className={styles.toolNote}>✎ Updated the common canvas</span> : turn.kind === "agent" && <span className={styles.toolNote}>Canvas unchanged this turn</span>}</div>
            </article>
          ))}
        </div>
      </Card>
    </aside>
  );
}

export function JournalPanel({ session, agent: innerVoiceAgent, onClose }: { session: Session; agent: Agent; onClose: () => void }) {
  const agentInnerVoice = session.innerVoice.filter((entry) => entry.agentId === innerVoiceAgent.id).reverse();
  return (
    <aside className={styles.sideColumn} id="inner-voice-panel" aria-labelledby="inner-voice-heading" tabIndex={-1}>
      <Card className={`${styles.panel} ${styles.transcriptPanel}`}>
        <div className={styles.panelHead}>
          <div><h2 id="inner-voice-heading">Inner voice</h2><span className={styles.innerVoiceAgentName}>{innerVoiceAgent.name}</span></div>
          <Button type="button" variant="ghost" className={styles.innerVoiceButton} aria-label="Close inner voice" onClick={() => onClose()}><span aria-hidden="true">×</span></Button>
        </div>
        <div className={styles.transcript} tabIndex={0} aria-label={`${innerVoiceAgent.name} inner voice entries`}>
          {agentInnerVoice.length === 0
            ? <div className={styles.transcriptEmpty}>Their inner voice will appear after their first completed turn.</div>
            : agentInnerVoice.map((entry) => (
              <article className={styles.innerVoiceEntry} key={entry.turnNumber}>
                <div><strong>Turn {entry.turnNumber}</strong><time dateTime={entry.createdAt}>{new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</time></div>
                <p>{entry.text ?? "Inner voice unavailable for this turn."}</p>
              </article>
            ))}
        </div>
      </Card>
    </aside>
  );
}

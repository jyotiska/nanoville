import Image from "next/image";
import type { Agent } from "@/data/agents";
import { judge } from "@/data/judge";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Session } from "@/features/discussion/session";
import { signed } from "./stat-popups";
import styles from "../scenario-studio.module.css";

export function AgentProfile({ agent: inspectedAgent, session, onJournal }: { agent: Agent; session: Session; onJournal: (agent: Agent) => void }) {
  const latestTurn = session.turns.findLast((turn) => turn.statChanges.some((change) => change.agentId === inspectedAgent.id));
  const latestChange = latestTurn?.statChanges.find((change) => change.agentId === inspectedAgent.id);
  return (
    <DialogContent className={styles.agentPopup}>
      <div className={styles.agentProfile}>
        <Image src={`/agents/${inspectedAgent.sprite}.webp`} alt="" width={80} height={80} unoptimized style={{ backgroundColor: inspectedAgent.color }} />
        <div><DialogTitle className={styles.agentPopupTitle}>{inspectedAgent.name}</DialogTitle><p>{inspectedAgent.role}</p></div>
      </div>
      <DialogDescription>{inspectedAgent.description}</DialogDescription>
      <div className={styles.agentTraits}>{inspectedAgent.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
      {inspectedAgent.id !== judge.id && <p className={styles.personalityNote}>
        {inspectedAgent.personality.socialStyle} · {inspectedAgent.personality.challengeResponse === "sensitive" ? "Non-confrontational" : inspectedAgent.personality.challengeResponse === "resilient" ? "Resilient under challenge" : "Balanced under challenge"}
      </p>}
      <dl className={styles.agentStats}>
        <div><dt>Mood</dt><dd>{inspectedAgent.mood}</dd></div>
        <div><dt>⚡ Energy</dt><dd>{inspectedAgent.energy} / 100<meter aria-label="Energy" min={0} max={100} low={30} value={inspectedAgent.energy} /></dd></div>
        <div><dt>💪 Confidence</dt><dd>{inspectedAgent.confidence} / 100<meter aria-label="Confidence" min={0} max={100} low={35} value={inspectedAgent.confidence} /></dd></div>
      </dl>
      {latestChange && <div className={styles.statReasons}>
        <p>Turn {latestTurn!.turnNumber} · {signed(latestChange.energy)} ⚡ · {signed(latestChange.confidence)} 💪</p>
        <ul>{latestChange.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
        <small>Values stay between 0 and 100. Low energy favors brief replies; low confidence favors tentative phrasing and validation.</small>
      </div>}
      {inspectedAgent.id !== judge.id && <Tooltip>
        <TooltipTrigger aria-label="Inner voice" render={<Button type="button" variant="ghost" className={styles.innerVoiceButton} />} onClick={() => { onJournal(inspectedAgent); }}><span aria-hidden="true">💭</span></TooltipTrigger>
        <TooltipContent>Inner voice</TooltipContent>
      </Tooltip>}
    </DialogContent>
  );
}

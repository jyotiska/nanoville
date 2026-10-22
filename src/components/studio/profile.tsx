import Image from "next/image";
import type { Agent } from "@/data/agents";
import { judge } from "@/data/judge";
import { Button } from "@/components/ui/button";
import { DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import styles from "../scenario-studio.module.css";

export function AgentProfile({ agent: inspectedAgent, onJournal }: { agent: Agent; onJournal: (agent: Agent) => void }) {
  return (
    <DialogContent className={styles.agentPopup}>
      <div className={styles.agentProfile}>
        <Image src={`/agents/${inspectedAgent.sprite}.webp`} alt="" width={80} height={80} unoptimized style={{ backgroundColor: inspectedAgent.color }} />
        <div><DialogTitle className={styles.agentPopupTitle}>{inspectedAgent.name}</DialogTitle><p>{inspectedAgent.role}</p></div>
      </div>
      <DialogDescription>{inspectedAgent.description}</DialogDescription>
      <div className={styles.agentTraits}>{inspectedAgent.traits.map((trait) => <span key={trait}>{trait}</span>)}</div>
      <dl className={styles.agentStats}>
        <div><dt>Mood</dt><dd>{inspectedAgent.mood}</dd></div>
        <div><dt>Energy</dt><dd>{inspectedAgent.energy}%</dd></div>
        <div><dt>Confidence</dt><dd>{inspectedAgent.confidence}%</dd></div>
      </dl>
      {inspectedAgent.id !== judge.id && <Tooltip>
        <TooltipTrigger aria-label="Inner voice" render={<Button type="button" variant="ghost" className={styles.innerVoiceButton} />} onClick={() => { onJournal(inspectedAgent); }}><span aria-hidden="true">💭</span></TooltipTrigger>
        <TooltipContent>Inner voice</TooltipContent>
      </Tooltip>}
    </DialogContent>
  );
}

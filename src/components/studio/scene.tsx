import Image from "next/image";
import type { Agent } from "@/data/agents";
import { judge } from "@/data/judge";
import { locations, type LocationId } from "@/data/scenarios";
import { DialogTrigger } from "@/components/ui/dialog";
import { sessionView, type Session } from "@/features/discussion/session";
import styles from "../scenario-studio.module.css";

const seats: Record<LocationId, { left: number; top: number }[]> = {
  "meeting-room": [
    { left: 31, top: 26 }, { left: 45, top: 26 }, { left: 59, top: 26 },
    { left: 34, top: 59 }, { left: 57, top: 59 },
  ],
  garden: [
    { left: 43, top: 23 }, { left: 25, top: 39 }, { left: 61, top: 39 },
    { left: 43, top: 62 }, { left: 73, top: 41 },
  ],
  "university-classroom": [
    { left: 43, top: 31 }, { left: 26, top: 43 }, { left: 60, top: 43 },
    { left: 43, top: 62 }, { left: 70, top: 61 },
  ],
};

const judgeSeats: Record<LocationId, { left: number; top: number }> = {
  "meeting-room": { left: 81, top: 55 },
  garden: { left: 14, top: 66 },
  "university-classroom": { left: 13, top: 66 },
};


export function SessionScene({ session, busy, locationId, sessionLabel, onInspect }: { session: Session; busy: boolean; locationId: LocationId; sessionLabel: string; onInspect: (agent: Agent) => void }) {
  const { participants, completedTurns, activeAgent, reviewing } = sessionView(session);
  const { status, turns } = session;
  const { maxTurns, judgeEnabled } = session.config!;
  const location = locations.find((item) => item.id === locationId)!;
  const seatMap = seats[locationId];
  const lastTurn = turns.at(-1);
  return (
    <div className={styles.scene} style={{ backgroundImage: `url(${location.image})` }}>
      <div className={styles.sceneTopline}><span className={styles.scenePin}>●</span>{location.name}<span className={styles.sceneTime}>{completedTurns} / {maxTurns} turns</span></div>
      {participants.map((agent, index) => {
        const seat = seatMap[index] ?? { left: 20 + (index % 3) * 25, top: 80 };
        const isThinking = busy && activeAgent?.id === agent.id;
        const isSpeaking = status === "running" && !reviewing && !busy && completedTurns < maxTurns && lastTurn?.kind === "agent" && lastTurn.speakerId === agent.id;
        const isActive = isThinking || isSpeaking;
        return (
          <DialogTrigger className={`${styles.agentSeat} ${isActive ? styles.agentActive : ""}`} key={agent.id} style={{ left: `${seat.left}%`, top: `${seat.top}%` }} aria-label={`About ${agent.name}${isActive ? ` · ${isThinking ? "Thinking" : "Speaking"}` : ""}`} onClick={() => onInspect(agent)}>
            <Image className={styles.agentImage} src={`/agents/${agent.sprite}.webp`} alt="" width={256} height={256} unoptimized />
            <span className={styles.agentName}>{agent.name.split(" ")[0]}</span>
            {isActive && <span className={`${styles.agentActivity} ${isSpeaking ? styles.agentSpeaking : ""}`} role="status">
              {isThinking ? "Thinking" : "Speaking"}
              <span className={styles.activityDots} aria-hidden="true"><span /><span /><span /></span>
            </span>}
          </DialogTrigger>
        );
      })}
      {judgeEnabled && <DialogTrigger className={`${styles.agentSeat} ${busy && reviewing ? styles.agentActive : ""}`} style={{ left: `${judgeSeats[locationId].left}%`, top: `${judgeSeats[locationId].top}%` }} aria-label="About Judge" onClick={() => onInspect(judge)}>
        <Image className={styles.agentImage} src={`/agents/${judge.sprite}.webp`} alt="" width={256} height={256} unoptimized />
        <span className={styles.agentName}>Judge</span>
        {busy && reviewing && <span className={styles.agentActivity} role="status">Reviewing<span className={styles.activityDots} aria-hidden="true"><span /><span /><span /></span></span>}
      </DialogTrigger>}
      {!turns.length && <div className={styles.sceneHint}>{status === "running" ? "Your team is starting the discussion…" : sessionLabel}</div>}
      {(status === "stopped" || status === "completed") && turns.length > 0 && <div className={styles.sceneComplete}>{sessionLabel}</div>}
    </div>
  );
}

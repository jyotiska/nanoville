import { useEffect, useRef, useState } from "react";
import type { Session } from "@/features/discussion/session";
import styles from "../scenario-studio.module.css";

type Change = Session["turns"][number]["statChanges"][number];
type Popup = Change & { key: string };

export function useStatPopups(session: Session) {
  const seen = useRef({ id: session.id, count: session.turns.length });
  const frames = useRef(new Set<number>());
  const [popups, setPopups] = useState<Popup[]>([]);
  useEffect(() => () => { frames.current.forEach((frame) => window.cancelAnimationFrame(frame)); }, []);
  useEffect(() => {
    const previous = seen.current;
    seen.current = { id: session.id, count: session.turns.length };
    // Restoring a session shows its current meters without replaying old effects.
    if (previous.id !== session.id || session.turns.length <= previous.count) return;
    const additions = session.turns.slice(previous.count).flatMap((turn) => turn.statChanges
      .filter((change) => change.energy !== 0 || change.confidence !== 0)
      .map((change) => ({ ...change, key: `${session.id}:${turn.turnNumber}:${change.agentId}` })));
    if (!additions.length) return;
    const frame = window.requestAnimationFrame(() => {
      frames.current.delete(frame);
      setPopups((current) => [...current, ...additions]);
    });
    frames.current.add(frame);
  }, [session.id, session.turns]);
  return { popups, dismiss: (key: string) => setPopups((current) => current.filter((item) => item.key !== key)) };
}

export function StatPopups({ popups, dismiss }: { popups: Popup[]; dismiss: (key: string) => void }) {
  return <span className={styles.statPopupStack} aria-live="polite" aria-atomic="true">
    {popups.toReversed().map((popup, index) => <StatPopup key={popup.key} popup={popup} index={index} dismiss={dismiss} />)}
  </span>;
}

function StatPopup({ popup, index, dismiss }: { popup: Popup; index: number; dismiss: (key: string) => void }) {
  const onDismiss = useRef(dismiss);
  useEffect(() => { onDismiss.current = dismiss; }, [dismiss]);
  useEffect(() => {
    const timer = window.setTimeout(() => onDismiss.current(popup.key), 2800);
    return () => window.clearTimeout(timer);
  }, [popup.key]);
  return <span className={styles.statPopup} style={{ bottom: `${index * 38}px` }} title={popup.reasons.join(" · ")}>
      {popup.energy !== 0 && <span className={popup.energy > 0 ? styles.statGain : styles.statLoss}>
        <span aria-hidden="true">{signed(popup.energy)} ⚡</span><span className={styles.srOnly}>{signed(popup.energy)} energy</span>
      </span>}
      {popup.confidence !== 0 && <span className={popup.confidence > 0 ? styles.statGain : styles.statLoss}>
        <span aria-hidden="true">{signed(popup.confidence)} 💪</span><span className={styles.srOnly}>{signed(popup.confidence)} confidence</span>
      </span>}
    </span>;
}

export function signed(value: number) { return value > 0 ? `+${value}` : String(value); }

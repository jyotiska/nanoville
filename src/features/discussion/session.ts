import type { Snapshot, Journal, SessionConfig } from "@/api/chorus/client";
import { presentAgent } from "@/data/agents";
export type Session = Omit<Snapshot, "status" | "config" | "scenario"> & {
  status: Snapshot["status"] | "setup";
  config: SessionConfig | null;
  scenario: Snapshot["scenario"] | null;
  innerVoice: Journal[];
};
export const emptySession: Session = {
  id: "", revision: 0, engineVersion: "", config: null, scenario: null, agents: [], status: "setup",
  turns: [], canvas: "", innerVoice: [], endedEarly: false, finalJudgement: null,
  pending: null, error: "", errorCode: null, createdAt: "", updatedAt: "",
};
// Presentation selectors only. The backend selects and schedules all work.
export function sessionView(session: Session) {
  const participants = session.agents.map(presentAgent);
  const completedTurns = session.turns.filter((t) => t.kind !== "judge").length;
  const finalReviewDue = Boolean(session.config?.judgeEnabled && !session.finalJudgement && (session.endedEarly || completedTurns >= session.config.maxTurns));
  return {
    completedTurns, participants, finalReviewDue,
    reviewing: session.pending?.kind === "checkpoint" || session.pending?.kind === "final" || finalReviewDue,
    activeAgent: session.pending?.kind === "turn" ? participants.find((a) => a.id === session.pending?.speakerId) ?? null : null,
  };
}

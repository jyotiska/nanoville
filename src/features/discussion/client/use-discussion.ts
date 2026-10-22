"use client";
import { useEffect, useRef, useState } from "react";
import { ChorusClient, ChorusError, type Snapshot, type SessionConfig } from "@/api/chorus/client";
import { emptySession, type Session } from "../session";
const client = new ChorusClient();
const savedKey = "nanoville.chorus-session";
export function useDiscussion() {
  const [session, setSession] = useState<Session>(emptySession);
  const [error, setError] = useState("");
  const [errorCode, setErrorCode] = useState<string | undefined>();
  const [commandPending, setCommandPending] = useState(false);
  const selected = useRef("");
  const latest = useRef(-1);
  const generation = useRef(0);
  const accept = useRef<(snapshot: Snapshot) => void>(() => undefined);
  useEffect(() => {
    accept.current = (snapshot) => {
      if (selected.current !== snapshot.id || snapshot.revision < latest.current) return;
      latest.current = snapshot.revision;
      setSession((current) => ({ ...snapshot, innerVoice: current.id === snapshot.id ? current.innerVoice : [] }));
      setError(snapshot.error);
      setErrorCode(snapshot.errorCode ?? undefined);
      const revision = snapshot.revision;
      void client.journals(snapshot.id).then((entries) => {
        if (selected.current === snapshot.id && latest.current === revision) setSession((current) => ({ ...current, innerVoice: entries }));
      }).catch(() => { /* Public work remains readable if journal retrieval fails. */ });
    };
    const saved = new URLSearchParams(window.location.search).get("session") || localStorage.getItem(savedKey);
    if (saved) {
      const version = generation.current;
      void client.get(saved).then((snapshot) => {
        if (generation.current !== version) return;
        selected.current = snapshot.id;
        localStorage.setItem(savedKey, snapshot.id);
        latest.current = -1;
        accept.current(snapshot);
      }).catch((error: unknown) => { setError(error instanceof Error ? error.message : "Cannot restore this session."); });
    }
  }, []);
  useEffect(() => {
    if (!session.id) return;
    return client.subscribe(session.id, latest.current, (snapshot) => accept.current(snapshot), setError);
  }, [session.id]);
  async function perform(action: "start" | "pause" | "resume" | "stop") {
    if (!selected.current || commandPending) return;
    setCommandPending(true);
    try { accept.current(await client.command(selected.current, action)); }
    catch (error) {
      setError(error instanceof Error ? error.message : "Cannot control this session.");
      setErrorCode(error instanceof ChorusError ? error.code : undefined);
    } finally { setCommandPending(false); }
  }
  return {
    session, busy: Boolean(session.pending) || commandPending, error, errorCode,
    async start(config: SessionConfig) {
      const version = ++generation.current;
      setCommandPending(true);
      try {
        const created = await client.create({ scenarioId: config.scenarioId, participantIds: config.participantIds, model: config.model, maxTurns: config.maxTurns, judgeEnabled: config.judgeEnabled });
        if (generation.current !== version) return;
        selected.current = created.id;
        latest.current = -1;
        localStorage.setItem(savedKey, created.id);
        accept.current(created);
        accept.current(await client.command(created.id, "start"));
      } catch (error) { setError(error instanceof Error ? error.message : "Cannot start this session."); }
      finally { setCommandPending(false); }
    },
    async back() {
      const id = selected.current;
      try {
        if (id) {
          const current = await client.get(id);
          if (current.status === "running" || current.status === "reviewing") await client.command(id, "pause");
        }
        ++generation.current;
        selected.current = ""; latest.current = -1;
        localStorage.removeItem(savedKey);
        setSession(emptySession); setError(""); setErrorCode(undefined);
      } catch (error) { setError(error instanceof Error ? error.message : "Cannot pause the session."); }
    },
    pauseOrResume() { void perform(session.status === "ready" ? "start" : session.status === "paused" ? "resume" : "pause"); },
    stop() { void perform("stop"); },
  };
}

"use client";

import Image from "next/image";
import { pixelSprite } from "./agent-art";
import { useEffect, useRef, useState } from "react";
import { HarnessClient, type HarnessRecord, type Persona } from "@/api/chorus/harness-client";
import type { SceneProps } from "@/api/chorus/harness-workspace";
import { locations, type LocationId } from "@/data/scenarios";
import styles from "./game.module.css";

const client = new HarnessClient();
const anchors: Record<LocationId, [number, number][]> = {
  "meeting-room": [[34, 38], [49, 38], [64, 38], [37, 66], [62, 66]],
  garden: [[45, 35], [27, 50], [63, 50], [45, 73], [76, 53]],
  "university-classroom": [[45, 43], [28, 55], [62, 55], [45, 74], [72, 73]],
};
const statusLabels: Record<string, string> = { queued: "Ready", running: "Working", waiting_model: "Thinking…", waiting_lock: "Waiting for canvas", paused: "Paused", finished: "Finished", capped: "Turn cap reached", failed: "Needs attention" };

// Read actual published speech; never generate activity or speech in the browser.
function useSpeech(session?: SceneProps) {
  const [records, setRecords] = useState<HarnessRecord[]>([]);
  const saved = useRef<{ id: string; cursor: number; records: HarnessRecord[] }>({ id: "", cursor: 0, records: [] });
  const id = session?.snapshot.id;
  const revision = session?.snapshot.revision;
  useEffect(() => {
    if (!id) return;
    let active = true;
    async function read() {
      const previous = saved.current.id === id ? saved.current : { cursor: 0, records: [] };
      let cursor = previous.cursor;
      const all: HarnessRecord[] = [...previous.records];
      for (;;) {
        const page = await client.records(id!, "board", cursor);
        all.push(...page.records);
        cursor = page.cursor;
        if (!active) return;
        if (!page.hasMore) break;
      }
      if (active) {
        const latestByAgent = new Map<string, HarnessRecord>();
        for (const record of all) latestByAgent.set(record.agentId, record);
        const latest = [...latestByAgent.values()].sort((a, b) => a.sequence - b.sequence);
        saved.current = { id: id!, cursor, records: latest };
        setRecords(latest);
      }
    }
    void read().catch(() => { /* The main board retains its own visible error state. */ });
    return () => { active = false; };
  }, [id, revision]);
  return records;
}
export function GameScene({ agents, locationId, session }: { agents: Persona[]; locationId: LocationId; session?: SceneProps }) {
  const [zoom, setZoom] = useState(1);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState<string | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const characters = useRef(new Map<string, HTMLButtonElement>());
  const records = useSpeech(session);
  const location = locations.find((item) => item.id === locationId)!;
  const zones = Array.from({ length: Math.max(1, Math.ceil(agents.length / 5)) }, (_, index) => agents.slice(index * 5, index * 5 + 5));
  const selected = session?.selected ?? focused;
  const latest = records.filter((record) => !selected || record.agentId === selected).at(-1);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  function focus(id: string) {
    setFocused(id);
    characters.current.get(id)?.scrollIntoView({ block: "nearest", inline: "center", behavior: "instant" });
    characters.current.get(id)?.focus({ preventScroll: true });
  }
  return <>
    <div className={styles.sceneToolbar}><strong>{location.name}</strong><span>{agents.length} characters{zones.length > 1 ? ` · ${zones.length} rooms` : ""}</span><label>Scene zoom <input aria-label="Scene zoom" type="range" min="0.65" max="1.5" step="0.05" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /></label><button type="button" onClick={() => { setZoom(1); viewport.current?.scrollTo({ left: 0, top: 0 }); }}>Reset view</button></div>
    <div className={styles.viewport} ref={viewport} tabIndex={0} aria-label="World camera; scroll to explore rooms">
      <div className={styles.rooms} style={{ width: `${zoom * 100}%`, minWidth: `${Math.max(520, zones.length > 1 ? 1100 : 520) * zoom}px`, gridTemplateColumns: zones.length > 1 ? "repeat(2, minmax(0, 1fr))" : "1fr" }}>
        {zones.map((members, zone) => <div key={zone} className={styles.room} style={{ backgroundImage: `url(${location.image})` }} aria-label={`${location.name}, room ${zone + 1}`}>
          {zones.length > 1 && <span className={styles.roomLabel}>Room {zone + 1}</span>}
          {members.map((agent, index) => {
            const worker = session?.snapshot.workers.find((item) => item.agentId === agent.id);
            const lease = session?.snapshot.lease;
            const editing = session?.snapshot.status === "running" && lease?.agentId === agent.id && Date.parse(lease.expiresAt) > now;
            const active = session?.snapshot.status === "running" && ["running", "waiting_model"].includes(worker?.state ?? "");
            const label = editing ? "Editing canvas" : worker ? statusLabels[worker.state] ?? worker.state : agent.role;
            const [left, top] = anchors[locationId][index];
            return <button type="button" key={agent.id} ref={(node) => { if (node) characters.current.set(agent.id, node); else characters.current.delete(agent.id); }} className={`${styles.character} ${selected === agent.id ? styles.selected : ""}`} style={{ left: `${left}%`, top: `${top}%`, zIndex: Math.round(top) }} onClick={() => { setFocused(agent.id); session?.select(agent.id); }} aria-label={`${agent.name}, ${label}`}>
              <Image className={`${styles.sprite} ${editing ? styles.editing : active ? styles.working : ""}`} src={pixelSprite(agent.id)} alt={`${agent.name} pixel sprite`} width={256} height={256} unoptimized />
              <strong className={styles.name}>{agent.name}</strong>
              {(active || editing || selected === agent.id) && <span className={styles.activity}>{label}</span>}
            </button>;
          })}
        </div>)}
      </div>
    </div>
    <div className={styles.hud}>
      <label>Find a character <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name or role" /></label>
      <div className={styles.team} aria-label="Find and focus a character">{agents.filter((agent) => `${agent.name} ${agent.role}`.toLowerCase().includes(query.toLowerCase())).map((agent) => <button type="button" key={agent.id} aria-pressed={selected === agent.id} onClick={() => focus(agent.id)}>{agent.name}</button>)}</div>
    </div>
    {latest && <a className={styles.speech} href={`#${latest.id}`}><strong>{agents.find((agent) => agent.id === latest.agentId)?.name} · latest published post</strong><span>{String(latest.data.text)}</span></a>}
    {!session && <p className={styles.previewNote}>Your team is ready. Choose a location, then configure the session below.</p>}
  </>;
}

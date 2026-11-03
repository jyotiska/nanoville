"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { HarnessApp, type SceneProps, type WorkspaceParts } from "@/api/chorus/harness-workspace";
import { locations, type LocationId } from "@/data/scenarios";
import { pixelSprite } from "./agent-art";
import { GameScene } from "./game-scene";
import styles from "./game.module.css";

export function readLocation(key: string, fallback: LocationId = "meeting-room"): LocationId {
  try {
    const value = localStorage.getItem(key);
    return locations.find((location) => location.id === value)?.id ?? fallback;
  } catch { return fallback; }
}
function saveLocation(key: string, value: LocationId) {
  try { localStorage.setItem(key, value); } catch { /* Preferences are optional. */ }
}
function LocationScene({ session }: { session?: SceneProps }) {
  const key = `nanoville.scene.v1.${session?.snapshot.id ?? "setup"}`;
  const [location, setLocation] = useState<LocationId>("meeting-room");
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const next = readLocation(key, readLocation("nanoville.scene.v1.setup"));
    // Resolve browser-only preferences after hydration, before saving anything.
    queueMicrotask(() => { setLocation(next); setReady(true); });
  }, [key]);
  function choose(value: LocationId) { setLocation(value); saveLocation(key, value); }
  useEffect(() => { if (ready) saveLocation(key, location); }, [key, ready, location]);
  return <section aria-label={session ? "Nanoville world" : "Session location"} className={styles.world}>
    {!session && <p className={styles.locationLabel}>Choose a location</p>}
    <div className={`${styles.locations} ${session ? "" : styles.setupLocations}`} role="group" aria-label="Choose a location">{locations.map((item) => <button type="button" key={item.id} aria-pressed={location === item.id} onClick={() => choose(item.id)}>{session && <Image src={item.image} alt="" width={72} height={48} />}<span>{item.name}</span></button>)}</div>
    {session && <GameScene key={key} agents={session.snapshot.agents} locationId={location} session={session} />}
  </section>;
}
function GameWorkspace({ parts }: { parts: WorkspaceParts }) {
  return <>
    <div className={styles.controls}>{parts.heading}</div>{parts.error}
    <div className={styles.workspace}>
      <div className={styles.mainWorld}>{parts.scene}<details className={styles.disclosure}><summary>Session usage and costs</summary>{parts.metrics}</details></div>
      <aside className={styles.discussion}>{parts.board}</aside>
    </div>
    <details className={styles.disclosure} open><summary>Your team</summary>{parts.roster}</details>
    <div className={styles.documents}>{parts.canvas}{parts.changes}</div>{parts.report}{parts.inspector}
  </>;
}
export default function GameApp() {
  return <HarnessApp mode="nanoville" presentation={{
    className: styles.game,
    portrait: (agent, className) => <Image className={`${className} ${styles.pixelPortrait}`} src={pixelSprite(agent.id)} alt={`${agent.name} portrait`} width={80} height={80} unoptimized />,
    brand: <Image src="/nanoville-logo-horizontal.png" alt="nanoville" width={180} height={60} priority />,
    setup: () => <LocationScene />,
    scene: (session) => <LocationScene key={session.snapshot.id} session={session} />,
    workspace: (parts) => <GameWorkspace parts={parts} />,
  }} />;
}

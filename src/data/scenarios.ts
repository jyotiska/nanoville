import type { Catalog } from "@/api/chorus/client";
export type Scenario = Catalog["scenarios"][number];

export const locations = [
  {
    id: "meeting-room",
    name: "Corporate meeting room",
    detail: "A quiet place to make a plan",
    image: "/scenes/meeting-room.webp",
  },
  {
    id: "garden",
    name: "Garden",
    detail: "A calm place to talk things through",
    image: "/scenes/garden.webp",
  },
  {
    id: "university-classroom",
    name: "University classroom",
    detail: "A classroom for sharing ideas and making a plan",
    image: "/scenes/university-classroom.webp",
  },
] as const;

export type LocationId = (typeof locations)[number]["id"];

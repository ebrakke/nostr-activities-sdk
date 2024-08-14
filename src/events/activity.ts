import { v4 as uuid } from "uuid";
import type { EventTemplate } from "nostr-tools";
import { NDKEvent } from "@nostr-dev-kit/ndk";

export const ACTIVITY_KIND = 30100 as const;

export interface ActivityEvent extends EventTemplate {
  kind: typeof ACTIVITY_KIND;
  tags: ([EventTags, string] | ["encrypted"])[];
}

type EventTags =
  | "title"
  | "t"
  | "d"
  | "r"
  | "published_at"
  | "updated_at"
  | "recorded_at";

export const activityTypes = [
  "run",
  "trail-run",
  "hike",
  "ride",
  "swim",
  "walk",
  "mountain-bike-ride",
  "gravel-ride",
  "e-bike-ride",
  "e-mountain-bike-ride",
  "alpine-ski",
  "badminton",
  "backcountry-ski",
  "canoeing",
  "crossfit",
  "elliptical",
  "golf",
  "ice-skate",
  "inline-skate",
  "handcycle",
  "hiit",
  "kayaking",
  "nordic-ski",
  "kitesurf",
  "stand-up-paddling",
  "pickleball",
  "pilates",
  "racquetball",
  "rock-climbing",
  "roller-ski",
  "rowing",
  "sail",
  "skateboard",
  "snowboard",
  "snowshoe",
  "soccer",
  "squash",
  "stair-stepper",
  "surfing",
  "table-tennis",
  "tennis",
  "velomobile",
  "weight-training",
  "windsurf",
  "wheelchair",
  "workout",
  "yoga",
] as const;

export type ActivityType = (typeof activityTypes)[number];

export interface CreateActivityParams {
  id?: string;
  title: string;
  description?: string;
  type: ActivityType;
  published_at?: number;
  updated_at?: number;
  recorded_at?: number;
  reference_url?: string;
  encrypted?: boolean;
}

export function createActivityEvent(a: CreateActivityParams): ActivityEvent {
  const now = Math.floor(Date.now() / 1000);
  const id = a.id || uuid();
  const published_at_ms = a.published_at || now;
  const updated_at_ms = a.updated_at || now;
  const event = {
    kind: 30100 as const,
    content: a.description || "",
    created_at: now,
    tags: [
      ["d", id],
      ["title", a.title],
      ["t", a.type],
      ["r", a.reference_url || ""],
      ["published_at", published_at_ms.toString()],
      ["updated_at", updated_at_ms.toString()],
    ],
  } as ActivityEvent;

  if (a.recorded_at) {
    event.tags.push(["recorded_at", a.recorded_at.toString()]);
  }
  if (a.encrypted) {
    event.tags.push(["encrypted"]);
  }

  return event;
}

export interface Activity {
  id: string;
  author: string;
  title: string;
  description: string;
  type: ActivityType;
  published_at: number;
  updated_at: number;
  recorded_at?: number;
  reference_url?: string;
  encrypted?: boolean;
}

export function activityFromEvent(event: NDKEvent): Activity {
  return {
    id: event.replaceableDTag(),
    author: event.pubkey,
    title: event.tagValue("title") ?? "",
    description: event.content,
    type: event.tagValue("t") as ActivityType,
    published_at: parseInt(event.tagValue("published_at")!),
    updated_at: parseInt(event.tagValue("updated_at")!),
    recorded_at: event.tagValue("recorded_at")
      ? parseInt(event.tagValue("recorded_at")!)
      : undefined,
    reference_url: event.tagValue("r"),
    encrypted: event.hasTag("encrypted"),
  };
}

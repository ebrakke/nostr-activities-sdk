import { v4 as uuid } from "uuid";
import type { EventTemplate } from "nostr-tools";
import type { NDKEvent } from "@nostr-dev-kit/ndk";

export const SUMMARY_KIND = 30101 as const;

export interface SummaryEvent extends EventTemplate {
  kind: typeof SUMMARY_KIND;
  tags: Tags[];
}

export interface Summary {
  id: string;
  type: string;
  content: any;
  reference_ids: string[];
  published_at: number;
  updated_at: number;
  encrypted?: boolean;
  geohash?: string;
  unit?: "metric" | "imperial";
}

type Tags =
  | [SummaryTag, string]
  | ["encrypted"]
  | ["r", ...string[]]
  | ["unit", "metric" | "imperial"];
type SummaryTag = "d" | "t" | "g" | "published_at" | "updated_at";

export interface CreateSummaryParams {
  id?: string;
  type: string;
  content: any;
  reference_ids: string[];
  published_at?: number;
  updated_at?: number;
  encrypted?: boolean;
  geohash?: string;
  unit?: "metric" | "imperial";
}

export function createSummaryEvent(a: CreateSummaryParams): SummaryEvent {
  const now = Math.floor(Date.now() / 1000);
  const id = a.id || uuid();
  const published_at_ms = a.published_at || now;
  const updated_at_ms = a.updated_at || now;
  const event = {
    kind: 30101,
    created_at: now,
    content: JSON.stringify(a.content),
    tags: [
      ["d", id],
      ["t", a.type],
      ["r", ...a.reference_ids],
      ["published_at", published_at_ms.toString()],
      ["updated_at", updated_at_ms.toString()],
    ],
  } as SummaryEvent;

  if (a.encrypted) {
    event.tags.push(["encrypted"]);
  }

  if (a.geohash) {
    event.tags.push(["g", a.geohash]);
  }
  if (a.unit) {
    event.tags.push(["unit", a.unit]);
  }

  return event;
}

export function summaryFromEvent(e: NDKEvent): Summary {
  return {
    id: e.replaceableDTag(),
    type: e.tagValue("t")!,
    content: JSON.parse(e.content),
    reference_ids: e.tags.find((t) => t[0] === "r")?.slice(1) || [],
    published_at: Number.parseInt(e.tagValue("published_at")!),
    updated_at: Number.parseInt(e.tagValue("updated_at")!),
    encrypted: e.hasTag("encrypted"),
    geohash: e.tagValue("g"),
    unit: e.tagValue("unit") as "metric" | "imperial",
  };
}

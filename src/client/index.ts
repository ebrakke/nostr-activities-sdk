import {
  type BlossomClient,
  type BlobDescriptor,
  getHashFromURL,
} from "blossom-client-sdk";
import {
  ACTIVITY_KIND,
  createActivityEvent,
  createSummaryEvent,
  type CreateActivityParams,
  type CreateSummaryParams,
  SUMMARY_KIND,
} from "../events";
import type NDK from "@nostr-dev-kit/ndk";
import { NDKEvent, type NDKKind } from "@nostr-dev-kit/ndk";

export class ActivityClient {
  constructor(
    private readonly ndk: NDK,
    private readonly blossomClient: BlossomClient,
  ) {}

  /**
   * Retrieve an activity event by its replaceable "d" tag.
   * @param id - The replaceable "d" tag of the activity event
   */
  async getActivity(id: string): Promise<NDKEvent | null> {
    const event = await this.ndk.fetchEvent({
      kinds: [ACTIVITY_KIND as NDKKind],
      "#d": [id],
    });
    return event;
  }

  async getActivities(limit = 20): Promise<NDKEvent[]> {
    const events = await this.ndk.fetchEvents({
      kinds: [ACTIVITY_KIND as NDKKind],
      limit,
    });
    return Array.from(events);
  }

  async createActivityEvent(a: CreateActivityParams): Promise<NDKEvent> {
    const event = createActivityEvent(a);
    const author = this.ndk.activeUser?.pubkey;
    if (!author) {
      throw new Error("No active user found");
    }
    const ndkEvent = new NDKEvent(this.ndk, { ...event, pubkey: author });
    await ndkEvent.publishReplaceable();
    return ndkEvent;
  }

  /**
   * Retrieve all activity events associated with an authors pubkey
   * @param author - The pubkey of the author in HEX format
   */
  async getActivitesByAuthor(author: string): Promise<NDKEvent[]> {
    const events = await this.ndk.fetchEvents({
      kinds: [ACTIVITY_KIND as NDKKind],
      authors: [author],
    });
    return Array.from(events);
  }

  /**
   * Delete an activity based on it's replaceable "d" tag
   * @param id - The replaceable "d" tag of the activity event
   */
  async deleteActivity(id: string): Promise<void> {
    const event = await this.getActivity(id);
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.pubkey !== this.ndk.activeUser?.pubkey) {
      throw new Error("You are not the creator of this event");
    }
    await event.delete("Deleted by user", true);
  }

  /**
   * Deletes all files associated with an activity event
   * @param id - The replaceable "d" tag of the activity event
   */
  async deleteActivityFile(id: string): Promise<void> {
    const event = await this.getActivity(id);
    if (!event) {
      throw new Error("Event not found");
    }
    const reference = event.tagValue("r");
    if (!reference) {
      console.warn("No reference found for event");
      return;
    }
    const hash = getHashFromURL(reference);
    if (!hash) {
      console.warn("No hash found in reference");
      return;
    }
    const exists = await this.blossomClient.hasBlob(hash);
    if (!exists) {
      console.warn("Blob not found in storage");
      return;
    }
    await this.blossomClient.deleteBlob(hash);
  }

  /**
   * Uploads a file to the activity event
   * @param file - The file to upload
   */
  async uploadActivityFile(file: File): Promise<BlobDescriptor> {
    return await this.blossomClient.uploadBlob(file);
  }

  /**
   * Create a summary event
   * @param a - The parameters for the summary event
   */
  async createSummaryEvent(a: CreateSummaryParams): Promise<NDKEvent> {
    const event = createSummaryEvent(a);
    const author = this.ndk.activeUser?.pubkey;
    if (!author) {
      throw new Error("No active user found");
    }
    const ndkEvent = new NDKEvent(this.ndk, { ...event, pubkey: author });
    await ndkEvent.publishReplaceable();
    return ndkEvent;
  }

  async getSummariesByActivityId(id: string): Promise<NDKEvent[]> {
    const events = await this.ndk.fetchEvents({
      kinds: [SUMMARY_KIND as NDKKind],
      "#r": [id],
    });
    return Array.from(events);
  }

  async getSummary(id: string): Promise<NDKEvent | null> {
    const event = await this.ndk.fetchEvent({
      kinds: [SUMMARY_KIND as NDKKind],
      "#d": [id],
    });
    return event;
  }

  async deleteSummary(id: string): Promise<void> {
    const event = await this.getSummary(id);
    if (!event) {
      throw new Error("Event not found");
    }
    if (event.pubkey !== this.ndk.activeUser?.pubkey) {
      throw new Error("You are not the creator of this event");
    }
    await event.delete("Deleted by user", true);
  }
}

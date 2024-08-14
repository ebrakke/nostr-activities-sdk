import { describe, it, beforeAll, expect } from "bun:test";
import { ActivityClient } from ".";
import { BlossomClient } from "blossom-client-sdk";
import NDK, { NDKPrivateKeySigner } from "@nostr-dev-kit/ndk";
import {
  generateSecretKey,
  type UnsignedEvent,
  getEventHash,
} from "nostr-tools";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ndkSigner = new NDKPrivateKeySigner(generateSecretKey());
const ndk = new NDK({
  explicitRelayUrls: ["ws://localhost:7777"],
  signer: ndkSigner,
});

const blossomClient = new BlossomClient(
  "http://localhost:3002",
  async (draft) => {
    // add the pubkey to the draft event
    const event: UnsignedEvent = { ...draft, pubkey: ndk.activeUser!.pubkey! };
    // get the signature
    const sig = await ndk.signer!.sign(event);

    // return the event + id + sig
    return { ...event, sig, id: getEventHash(event) };
  },
);

describe("ActivityClient", () => {
  beforeAll(async () => {
    await ndk.connect();
    await sleep(100);
  });

  it("creates an activity event", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const event = await activityClient.createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "run",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
    });

    expect(event.tagValue("title")).toEqual("Test Activity");
    expect(event.tagValue("t")).toEqual("run");
  });

  it("finds an activity event by id", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const event = await activityClient.createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "run",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
    });

    const foundEvent = await activityClient.getActivity(
      event.replaceableDTag(),
    );
    expect(foundEvent).not.toBeNull();
    expect(foundEvent!.id).toEqual(event.id);
  });

  it("deletes an activity event by id", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const event = await activityClient.createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "run",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
    });

    await activityClient.deleteActivity(event.replaceableDTag());
    const foundEvent = await activityClient.getActivity(
      event.replaceableDTag(),
    );
    expect(foundEvent).toBeNull();
  });

  it("throws an error if trying to delete an event you do not own", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const event = await activityClient.createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "run",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
    });

    const signer = new NDKPrivateKeySigner(generateSecretKey());
    const ndk2 = new NDK({
      explicitRelayUrls: ["ws://localhost:7000"],
      signer,
    });
    await ndk2.connect();
    await sleep(10);

    const activityClient2 = new ActivityClient(ndk2, blossomClient);
    expect(
      async () => await activityClient2.deleteActivity(event.replaceableDTag()),
    ).toThrow();
  });

  it("should upload a file to a blossom server", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const file = new File(["hello"], "hello.gpx", {
      type: "application/xml",
    });
    const { url } = await activityClient.uploadActivityFile(file);
    expect(url).toContain("http://localhost:3002");
  });

  it("should create a summary event", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const event = await activityClient.createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "run",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
    });

    const summary = await activityClient.createSummaryEvent({
      reference_ids: [event.replaceableDTag()],
      type: "test-summary",
      content: {
        test: "test",
      },
      published_at: 1609459200,
      updated_at: 1609459200,
    });

    expect(summary.tagValue("r")).toEqual(event.replaceableDTag());
    expect(JSON.parse(summary.content)).toEqual({ test: "test" });
  });

  it("should grab summaries related to an event", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const event = await activityClient.createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "run",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
    });

    const summary = await activityClient.createSummaryEvent({
      reference_ids: [event.replaceableDTag()],
      type: "test-summary",
      content: {
        test: "test",
      },
      published_at: 1609459200,
      updated_at: 1609459200,
    });

    const summaries = await activityClient.getSummariesByActivityId(
      event.replaceableDTag(),
    );
    expect(summaries.length).toBe(1);
    expect(summaries[0].id).toBe(summary.id);
  });

  it("should grab a summary by id", async () => {
    const activityClient = new ActivityClient(ndk, blossomClient);
    const event = await activityClient.createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "run",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
    });

    const summary = await activityClient.createSummaryEvent({
      reference_ids: [event.replaceableDTag()],
      type: "test-summary",
      content: {
        test: "test",
      },
      published_at: 1609459200,
      updated_at: 1609459200,
    });

    const foundSummary = await activityClient.getSummary(
      summary.replaceableDTag(),
    );
    expect(foundSummary).not.toBeNull();
    expect(foundSummary!.id).toBe(summary.id);
  });
});

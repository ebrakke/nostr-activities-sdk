import { describe, it, expect } from "bun:test";
import { createActivityEvent } from "./activity";

describe("createActivityEvent", () => {
  it("creates an activity event", () => {
    const event = createActivityEvent({
      title: "Test Activity",
      description: "This is a test activity",
      type: "workout",
      published_at: 1609459200,
      updated_at: 1609459200,
      recorded_at: 1609459200,
      reference_url: "https://example.com",
    });

    expect(event).toEqual({
      kind: 30100,
      content: "This is a test activity",
      created_at: expect.any(Number),
      tags: [
        ["d", expect.any(String)],
        ["title", "Test Activity"],
        ["t", "workout"],
        ["r", "https://example.com"],
        ["published_at", "1609459200"],
        ["updated_at", "1609459200"],
        ["recorded_at", "1609459200"],
      ],
    });
  });
});

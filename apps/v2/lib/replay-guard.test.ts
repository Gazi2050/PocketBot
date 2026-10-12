import { beforeEach, describe, expect, test, vi } from "vitest";

/* posthog-js is a browser module, so the guard is tested against a stand-in
   that records what it was asked to do. What matters is the sequencing —
   when recording stops, when it resumes, and the cases where it must not
   resume at all — and none of that needs a real recorder. */

const h = vi.hoisted(() => ({
  running: false,
  loaded: true,
  calls: [] as string[],
}));

vi.mock("posthog-js", () => ({
  default: {
    get __loaded() {
      return h.loaded;
    },
    sessionRecordingStarted: () => h.running,
    stopSessionRecording: () => {
      h.calls.push("stop");
      h.running = false;
    },
    startSessionRecording: () => {
      h.calls.push("start");
      h.running = true;
    },
  },
}));

const { suppressReplay, MASK_TEXT, NO_CAPTURE } = await import(
  "./replay-guard"
);

beforeEach(() => {
  h.running = true;
  h.loaded = true;
  h.calls.length = 0;
});

describe("suppressReplay", () => {
  test("stops recording, and resumes it on release", () => {
    const release = suppressReplay();
    expect(h.calls).toEqual(["stop"]);
    expect(h.running).toBe(false);

    release();
    expect(h.calls).toEqual(["stop", "start"]);
    expect(h.running).toBe(true);
  });

  test("the last hold to leave is the one that resumes", () => {
    const first = suppressReplay();
    const second = suppressReplay();
    expect(h.calls).toEqual(["stop"]);

    first();
    expect(h.calls).toEqual(["stop"]);
    expect(h.running).toBe(false);

    second();
    expect(h.calls).toEqual(["stop", "start"]);
  });

  test("releasing twice does not resume early", () => {
    const first = suppressReplay();
    const second = suppressReplay();
    first();
    first();
    expect(h.running).toBe(false);

    second();
    expect(h.running).toBe(true);
  });

  test("never turns recording on for someone who had it off", () => {
    h.running = false;
    const release = suppressReplay();
    release();
    expect(h.calls).toEqual([]);
    expect(h.running).toBe(false);
  });

  test("does nothing when PostHog never loaded", () => {
    h.loaded = false;
    const release = suppressReplay();
    release();
    expect(h.calls).toEqual([]);
  });

  test("a hold taken while already suppressed keeps it suppressed", () => {
    const first = suppressReplay();
    expect(h.running).toBe(false);
    const second = suppressReplay();
    expect(h.calls).toEqual(["stop"]);
    second();
    expect(h.running).toBe(false);
    first();
    expect(h.running).toBe(true);
  });
});

describe("the masking classes", () => {
  test("MASK_TEXT carries both halves of the job", () => {
    /* rrweb's default maskTextClass censors the words in a replay;
       autocapture reads ph-sensitive before it ships the text of a clicked
       element. Neither one covers the other, so a chat needs both. */
    expect(MASK_TEXT.split(" ")).toEqual(["ph-mask", "ph-sensitive"]);
  });

  test("NO_CAPTURE is the block class, and is not the mask", () => {
    // PostHog's blockClass default. Blunter on purpose — it removes the
    // element rather than censoring it — so it must stay distinct.
    expect(NO_CAPTURE).toBe("ph-no-capture");
    expect(MASK_TEXT).not.toContain(NO_CAPTURE);
  });
});

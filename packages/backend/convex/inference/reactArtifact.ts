import { jsonSchema, tool } from "ai";

import type { Id } from "../_generated/dataModel";
import { FULL_PAGE_DESIGN_NOTES } from "./designTasteSkill";

/**
 * `createReactArtifact` — the model writes a JSX module instead of raw markup.
 *
 * The body streams into the same `htmlArtifacts` row an HTML artifact uses
 * (with `runtime: "react"`), so share tokens, the side panel, find/replace
 * edits, and the streaming lifecycle all come along for free. What changes is
 * the render path: the host compiles the module with Sucrase and mounts it
 * inside the sandbox against a prebuilt React + Tailwind + Recharts bundle.
 */

const MAX_TITLE_LENGTH = 120;
const MAX_CODE_LENGTH = 200_000;

/** What gets persisted onto the assistant message's `html` phase. */
export type ReactPhasePayload = {
  op: "create";
  mode: "inline" | "full";
  htmlId: Id<"htmlArtifacts">;
  title: string;
};

/**
 * The technical contract, embedded in the tool's input-schema description so
 * it only costs context in the moment the model is actually writing a module.
 * Deliberately mechanical — what compiles and what renders, not what it should
 * look like. Keep in sync with the frame runtime's `require` shim
 * (apps/v2/artifact-runtime/index.tsx).
 */
export const REACT_RUNTIME_REFERENCE = `Module rules:
- Write ONE complete ES module ending in \`export default function App() { ... }\`. No markdown fence, no <html>, no ReactDOM.render call — the host mounts App itself.
- Imports resolve from a fixed set and nothing else: \`react\` (all hooks) and \`recharts\`. Any other import fails to render.
- Style with Tailwind utility classes (v4 syntax, including arbitrary values like \`w-[38ch]\`). No CSS files, no \`style\` blocks, no config. Dark mode: write \`dark:\` variants — the host sets the class from the user's theme, so both modes must read well.
- TypeScript syntax is allowed and stripped; types are not checked.
- No network of any kind: no fetch, XHR, websockets, external images, fonts, or CDNs. Inline SVG and CSS gradients are your image layer. An https image URL that already appears in this conversation is the one exception.
- No browser storage, no timers left running on unmount, no \`window.parent\` access.
- Inline mode is sized to your content, so do not assume a viewport or set a full-screen height. Panel mode fills a real pane and may scroll.`;

/**
 * The tool itself.
 */
export function createReactArtifactTool({
  finalize,
  abort,
  onResult,
}: {
  finalize: (args: {
    toolCallId: string;
    title: string;
    code: string;
    mode: "inline" | "full";
  }) => Promise<{ htmlId: Id<"htmlArtifacts"> }>;
  /**
   * Tear down the row and card the stream loop opened on tool-input-start,
   * for a call that never reaches finalize. Without it a rejected artifact
   * leaves a row stuck "streaming" and a card working forever.
   */
  abort: (toolCallId: string) => Promise<void>;
  onResult: (payload: ReactPhasePayload) => Promise<void>;
}) {
  const codeDescription = [
    "The complete JSX module. Put last.",
    REACT_RUNTIME_REFERENCE,
    FULL_PAGE_DESIGN_NOTES,
  ]
    .filter(Boolean)
    .join("\n\n");

  return tool({
    description:
      "Build an interactive React + Tailwind artifact — a dashboard, tool, calculator, or data view. Prefer this over HTML whenever the thing has state.",
    inputSchema: jsonSchema<{
      title: string;
      mode?: "inline" | "full";
      code: string;
    }>({
      type: "object",
      properties: {
        title: {
          type: "string",
          minLength: 1,
          maxLength: MAX_TITLE_LENGTH,
          description: "Short title.",
        },
        mode: {
          type: "string",
          enum: ["inline", "full"],
          description:
            "'inline' renders a compact card in the conversation (default); 'full' opens a full pane in the side panel — use it for dashboards and anything multi-section.",
        },
        code: {
          type: "string",
          minLength: 1,
          maxLength: MAX_CODE_LENGTH,
          description: codeDescription,
        },
      },
      required: ["title", "code"],
      additionalProperties: false,
    }),
    execute: async ({ title, mode, code }, { toolCallId }) => {
      const cleanTitle = title.trim().slice(0, MAX_TITLE_LENGTH) || "Untitled";
      const resolvedMode = mode === "full" ? "full" : "inline";
      const { htmlId } = await finalize({
        toolCallId,
        title: cleanTitle,
        code,
        mode: resolvedMode,
      });

      await onResult({
        op: "create",
        mode: resolvedMode,
        htmlId,
        title: cleanTitle,
      });

      return {
        htmlId,
        ok: true,
        note: [
          resolvedMode === "full"
            ? "Rendered and opened in the side panel for the user."
            : "Rendered inline in the conversation for the user.",
          "Revise it later with editHtml using this id.",
        ]
          .filter(Boolean)
          .join(" "),
      };
    },
  });
}

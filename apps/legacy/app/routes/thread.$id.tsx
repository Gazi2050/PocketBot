import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/thread/$id")({
  component: Thread,
  head: () => ({
    meta: [{ title: "PocketBot" }],
  }),
});

function Thread() {
  return null;
}

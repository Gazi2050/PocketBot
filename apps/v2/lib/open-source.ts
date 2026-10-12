import { SITE_LINKS } from "@/lib/site";

/* PocketBot's public source repo, for the open-source announcement. */

export const REPO_URL = SITE_LINKS.repo;

/** "pocketbot/pocketbot", for fine print. */
export const REPO_LABEL = new URL(REPO_URL).pathname.replace(/^\/+/, "");

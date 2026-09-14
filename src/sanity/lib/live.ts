import { defineLive } from "next-sanity/live";

import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

/**
 * `sanityFetch` is the one query function every page in this app uses.
 *
 * It transparently does three different things depending on context:
 * - In production, with no draft mode: a cached, CDN-served read.
 * - In production, with draft mode on (an editor previewing unpublished
 *   content via a share link): an authenticated read of the draft
 *   perspective, live-updated over SSE as the editor types in the Studio.
 * - Everywhere else in dev: the same live behavior, so `next dev` always
 *   shows the freshest content without a manual refresh.
 *
 * `SanityLive` (exported alongside) is the component that opens the
 * server-sent-events connection; it's mounted once in the root layout.
 */
export const { sanityFetch, SanityLive } = defineLive({
  client,
  serverToken: token,
  browserToken: token,
});

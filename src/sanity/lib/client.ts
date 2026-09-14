import { createClient } from "next-sanity";

import { apiVersion, dataset, projectId } from "../env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Cached, CDN-served, non-authenticated reads. Anything needing draft
  // content or freshness guarantees goes through `sanityFetch` in `live.ts`
  // instead of this client directly.
  useCdn: true,
});

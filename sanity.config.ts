import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";

import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schema } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

const isDev = process.env.NODE_ENV === "development";
const previewOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default defineConfig({
  name: "default",
  title: "Storefront Studio",

  projectId,
  dataset,
  basePath: "/studio",

  schema,

  plugins: [
    structureTool({ structure }),
    // The Presentation tool is what makes Live Preview possible: it opens
    // the storefront in an iframe next to the editor, and every edit
    // re-renders it over the same live connection `sanityFetch` uses.
    presentationTool({
      previewUrl: {
        origin: previewOrigin,
        previewMode: {
          enable: "/api/draft-mode/enable",
        },
      },
      resolve: {
        locations: {
          product: {
            select: { title: "name", slug: "slug.current" },
            resolve: (doc) => ({
              locations: [
                {
                  title: doc?.title || "Untitled product",
                  href: `/products/${doc?.slug}`,
                },
                { title: "Home", href: "/" },
              ],
            }),
          },
          category: {
            select: { title: "title" },
            resolve: (doc) => ({
              locations: [{ title: doc?.title || "Untitled category", href: "/" }],
            }),
          },
        },
      },
    }),
    // GROQ playground — only in dev, kept out of the production Studio bundle.
    ...(isDev ? [visionTool({ defaultApiVersion: apiVersion })] : []),
  ],
});

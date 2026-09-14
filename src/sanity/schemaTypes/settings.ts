import { CogIcon } from "@sanity/icons/Cog";
import { defineField, defineType } from "sanity";

/** Singleton — see `structure.ts`, which hides this from the create-new list
 * and pins it to a single, always-existing document. */
export const settingsType = defineType({
  name: "settings",
  title: "Store settings",
  type: "document",
  icon: CogIcon,
  fields: [
    defineField({ name: "storeName", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "storeDescription", type: "text", rows: 2 }),
    defineField({ name: "supportEmail", type: "string" }),
  ],
  preview: {
    select: { title: "storeName" },
  },
});

import { PackageIcon } from "@sanity/icons/Package";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  icon: PackageIcon,
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "commerce", title: "Commerce" },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      group: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      type: "slug",
      group: "content",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "Images",
      type: "array",
      group: "content",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.min(1).error("At least one image is required"),
    }),
    defineField({
      name: "excerpt",
      title: "Short description",
      type: "text",
      group: "content",
      rows: 2,
      validation: (rule) => rule.max(200),
    }),
    defineField({
      name: "description",
      type: "array",
      group: "content",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "category",
      type: "reference",
      group: "content",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "priceUsd",
      title: "Price (USD)",
      description:
        "The single source of truth for this product's price. Read fresh from Sanity at checkout time — never trusted from the client cart.",
      type: "number",
      group: "commerce",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "stock",
      title: "Stock",
      type: "number",
      group: "commerce",
      initialValue: 0,
      validation: (rule) => rule.integer().min(0),
    }),
    defineField({
      name: "featured",
      title: "Featured on homepage",
      type: "boolean",
      group: "commerce",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "name", media: "images.0", subtitle: "priceUsd" },
    prepare({ title, media, subtitle }) {
      return {
        title,
        media,
        subtitle: subtitle ? `$${subtitle}` : "No price set",
      };
    },
  },
});

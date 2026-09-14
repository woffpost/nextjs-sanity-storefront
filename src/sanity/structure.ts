import { CogIcon } from "@sanity/icons/Cog";
import type { StructureResolver } from "sanity/structure";

/** Customizes the Studio's left-hand nav: pins Settings as a singleton
 * (one document, no "create new" / delete), everything else default. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.documentTypeListItem("product").title("Products"),
      S.documentTypeListItem("category").title("Categories"),
      S.divider(),
      S.documentTypeListItem("order").title("Orders"),
      S.divider(),
      S.listItem()
        .title("Store settings")
        .icon(CogIcon)
        .child(S.document().schemaType("settings").documentId("settings")),
    ]);

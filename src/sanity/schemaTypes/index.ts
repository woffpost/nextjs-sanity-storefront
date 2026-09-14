import type { SchemaTypeDefinition } from "sanity";

import { categoryType } from "./category";
import { orderType } from "./order";
import { productType } from "./product";
import { settingsType } from "./settings";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [productType, categoryType, orderType, settingsType],
};

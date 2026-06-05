import type { AppVariable } from "@/types/app-variable";

export const mockAppVariables: AppVariable[] = [
  {
    id: "var_fee",
    key: "platform_fee_percent",
    label: "Platform fee",
    valueKind: "input",
    value: "5",
    category: "Fees",
    description: "Percentage fee applied to each transaction on the platform.",
  },
  {
    id: "var_tags",
    key: "tags_picklist",
    label: "Tags",
    valueKind: "picklist",
    value: "design, engineering, sales, marketing, support",
    category: "Picklists",
    description: "Tags available for categorization across the app.",
  },
  {
    id: "var_currency",
    key: "default_currency",
    label: "Default currency",
    valueKind: "input",
    value: "USD",
    category: "General",
    description: "ISO currency code used when none is specified.",
  },
];

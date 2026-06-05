export type AppVariableValueKind = "input" | "picklist";

export interface AppVariable {
  id: string;
  /** Machine key derived from name (snake_case). */
  key: string;
  /** Display name */
  label: string;
  description?: string;
  /** Grouping label in the table, e.g. Fees, Picklists, General */
  category: string;
  /** Single value vs comma/newline-separated list */
  valueKind: AppVariableValueKind;
  /** Stored as string: one value, or list (commas / newlines) for picklists */
  value: string;
}

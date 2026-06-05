export interface DashboardStat {
  label: string;
  value: string | number;
  change: number;
  trend: "up" | "down" | "flat";
  sparkline: number[];
}

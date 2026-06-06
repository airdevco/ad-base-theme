"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/admin-sdc-ui/card";
import { formatDashboardStatValue } from "@/lib/format";
import type { DashboardStat } from "@/types";

function TrendIndicator({
  trend,
  change,
}: {
  trend: "up" | "down" | "flat";
  change: number;
}) {
  if (trend === "up") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-success-bg px-2 py-0.5 text-xs font-medium text-foreground">
        <TrendingUp className="size-3" />
        +{change}%
      </span>
    );
  }

  if (trend === "down") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-status-error-bg px-2 py-0.5 text-xs font-medium text-status-error-text">
        <TrendingDown className="size-3" />
        {change}%
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-status-neutral-bg px-2 py-0.5 text-xs font-medium text-status-neutral-text">
      <Minus className="size-3" />
      {change}%
    </span>
  );
}

export function StatCard({ stat }: { stat: DashboardStat }) {
  return (
    <Card className="border-border shadow-none dark:border-transparent">
      <CardContent className="p-5">
        <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
        <p className="mt-2 text-2xl font-semibold text-foreground">
          {formatDashboardStatValue(stat.value)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <TrendIndicator trend={stat.trend} change={stat.change} />
          <span className="text-xs text-muted-foreground">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartCardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col space-y-1.5 p-6 pb-2">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="text-[13px] text-muted-foreground">{subtitle}</p>
    </div>
  );
}

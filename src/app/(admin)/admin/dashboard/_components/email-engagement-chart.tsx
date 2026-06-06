"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mockEmailEngagementData } from "@/mock";
import { formatNumber } from "@/lib/format";
import { colorWithAlpha } from "@/lib/chart-tokens";
import {
  getThemePreviewElement,
  useChartTheme,
} from "@/lib/use-chart-theme";
import { useThemePreviewChartRevision } from "@/lib/theme-preview-context";

function formatMonth(value: string) {
  return value.split(" ")[0];
}

const avgOpenRate = Math.round(
  (mockEmailEngagementData.reduce((sum, d) => sum + d.opened / d.sent, 0) /
    mockEmailEngagementData.length) *
    100
);

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const sent = payload.find((p) => p.name === "Sent")?.value ?? 0;
  const opened = payload.find((p) => p.name === "Opened")?.value ?? 0;
  const rate = sent > 0 ? Math.round((opened / sent) * 100) : 0;
  return (
    <div className="rounded-lg bg-background px-3 py-2.5 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          <span className="font-medium">{entry.name}:</span> {entry.value.toLocaleString()}
        </p>
      ))}
      <p className="mt-0.5 text-xs text-muted-foreground">Open rate: {rate}%</p>
    </div>
  );
}

export function EmailEngagementChart({ height = 220 }: { height?: number }) {
  const sentGradientId = useId().replace(/:/g, "");
  const openedGradientId = useId().replace(/:/g, "");
  const revision = useThemePreviewChartRevision();
  const { colors } = useChartTheme(getThemePreviewElement(), revision);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={mockEmailEngagementData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id={sentGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.chart3} stopOpacity={0.15} />
            <stop offset="100%" stopColor={colors.chart3} stopOpacity={0} />
          </linearGradient>
          <linearGradient id={openedGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.chart1} stopOpacity={0.2} />
            <stop offset="100%" stopColor={colors.chart1} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={colors.border}
          horizontal
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 12, fill: colors.mutedForeground }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: colors.mutedForeground }}
          tickFormatter={(v) => formatNumber(Number(v))}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="sent"
          name="Sent"
          stroke={colors.chart3}
          strokeWidth={1.5}
          fill={`url(#${sentGradientId})`}
          animationDuration={1200}
        />
        <Area
          type="monotone"
          dataKey="opened"
          name="Opened"
          stroke={colors.chart1}
          strokeWidth={2}
          fill={`url(#${openedGradientId})`}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export { avgOpenRate };

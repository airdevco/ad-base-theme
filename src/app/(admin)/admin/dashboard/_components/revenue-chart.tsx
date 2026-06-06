"use client";

import { useId } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mockRevenueData } from "@/mock";
import { formatNumber } from "@/lib/format";
import { colorWithAlpha } from "@/lib/chart-tokens";
import {
  getThemePreviewElement,
  useChartTheme,
} from "@/lib/use-chart-theme";
import { useThemePreviewChartRevision } from "@/lib/theme-preview-context";

const avgRevenue =
  mockRevenueData.reduce((sum, d) => sum + d.revenue, 0) / mockRevenueData.length;

function formatMonth(value: string) {
  return value.split(" ")[0];
}

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
  return (
    <div className="rounded-lg bg-background px-3 py-2.5 shadow-lg">
      <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-sm" style={{ color: entry.color }}>
          <span className="font-medium">{entry.name}:</span>{" "}
          ${formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function RevenueChart({ height = 250 }: { height?: number }) {
  const gradientId = useId().replace(/:/g, "");
  const revision = useThemePreviewChartRevision();
  const { colors } = useChartTheme(getThemePreviewElement(), revision);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={mockRevenueData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.chart1} stopOpacity={0.15} />
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
          tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12, fill: colors.mutedForeground }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={avgRevenue} stroke={colors.border} strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke={colors.chart1}
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          animationDuration={1200}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke={colors.chart3}
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

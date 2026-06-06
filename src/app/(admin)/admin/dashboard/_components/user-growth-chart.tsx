"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { mockUserGrowthData } from "@/mock";
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
          <span className="font-medium">{entry.name}:</span> {formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function UserGrowthChart({ height = 250 }: { height?: number }) {
  const revision = useThemePreviewChartRevision();
  const { colors } = useChartTheme(getThemePreviewElement(), revision);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={mockUserGrowthData}
        margin={{ top: 5, right: 5, bottom: 0, left: -10 }}
        barGap={2}
        barCategoryGap="20%"
      >
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
          yAxisId="left"
          tick={{ fontSize: 12, fill: colors.mutedForeground }}
          tickFormatter={(v) => formatNumber(Number(v))}
          axisLine={false}
          tickLine={false}
          domain={[0, 200]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12, fill: colors.mutedForeground }}
          tickFormatter={(v) => formatNumber(Number(v))}
          axisLine={false}
          tickLine={false}
          domain={[0, 1200]}
        />
        <Tooltip
          content={<CustomTooltip />}
          cursor={{ fill: colorWithAlpha(colors.foreground, 0.04) }}
        />
        <Bar
          yAxisId="left"
          dataKey="signups"
          name="Signups"
          fill={colors.chart1}
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
        />
        <Bar
          yAxisId="right"
          dataKey="activeUsers"
          name="Active Users"
          fill={colors.chart3}
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { mockProjectBreakdownData } from "@/mock";
import { formatNumber } from "@/lib/format";
import {
  getThemePreviewElement,
  useChartTheme,
} from "@/lib/use-chart-theme";
import { useThemePreviewChartRevision } from "@/lib/theme-preview-context";

const total = mockProjectBreakdownData.reduce((sum, d) => sum + d.count, 0);

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg bg-background px-3 py-2.5 shadow-lg">
      <p className="text-sm">
        <span className="font-medium" style={{ color: entry.payload.color }}>
          {entry.name}:
        </span>{" "}
        {formatNumber(entry.value)} projects
      </p>
    </div>
  );
}

export function ProjectBreakdownChart() {
  const revision = useThemePreviewChartRevision();
  const { colors } = useChartTheme(getThemePreviewElement(), revision);
  const palette = [colors.chart1, colors.chart2, colors.chart3];

  const data = mockProjectBreakdownData.map((entry, index) => ({
    ...entry,
    color: palette[index % palette.length],
  }));

  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            strokeWidth={0}
            paddingAngle={2}
            animationDuration={1200}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground text-2xl font-bold"
          >
            {total}
          </text>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted-foreground text-xs"
          >
            Projects
          </text>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

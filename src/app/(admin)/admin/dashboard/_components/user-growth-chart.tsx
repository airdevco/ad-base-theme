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

function formatMonth(value: string) {
  return value.split(" ")[0];
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
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

export function UserGrowthChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={mockUserGrowthData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }} barGap={2} barCategoryGap="20%">
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#F3F4F6"
          horizontal
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          tickFormatter={(v) => formatNumber(Number(v))}
          axisLine={false}
          tickLine={false}
          domain={[0, 200]}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          tickFormatter={(v) => formatNumber(Number(v))}
          axisLine={false}
          tickLine={false}
          domain={[0, 1200]}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
        <Bar
          yAxisId="left"
          dataKey="signups"
          name="Signups"
          fill="#3B82F6"
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
        />
        <Bar
          yAxisId="right"
          dataKey="activeUsers"
          name="Active Users"
          fill="#93C5FD"
          radius={[4, 4, 0, 0]}
          animationDuration={1200}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

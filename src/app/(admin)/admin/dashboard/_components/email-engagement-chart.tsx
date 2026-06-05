"use client";

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

function formatMonth(value: string) {
  return value.split(" ")[0];
}

const avgOpenRate = Math.round(
  (mockEmailEngagementData.reduce((sum, d) => sum + d.opened / d.sent, 0) /
    mockEmailEngagementData.length) *
    100
);

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
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

export function EmailEngagementChart() {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={mockEmailEngagementData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
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
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          tickFormatter={(v) => formatNumber(Number(v))}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="sent"
          name="Sent"
          stroke="#93C5FD"
          strokeWidth={1.5}
          fill="rgba(147, 197, 253, 0.15)"
          animationDuration={1200}
        />
        <Area
          type="monotone"
          dataKey="opened"
          name="Opened"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="rgba(59, 130, 246, 0.2)"
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export { avgOpenRate };

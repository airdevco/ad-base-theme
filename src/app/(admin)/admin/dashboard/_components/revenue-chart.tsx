"use client";

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

const avgRevenue =
  mockRevenueData.reduce((sum, d) => sum + d.revenue, 0) / mockRevenueData.length;

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
          <span className="font-medium">{entry.name}:</span>{" "}
          ${formatNumber(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={mockRevenueData} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(37, 99, 235, 0.15)" />
            <stop offset="100%" stopColor="rgba(37, 99, 235, 0)" />
          </linearGradient>
        </defs>
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
          tickFormatter={(v) => `$${(Number(v) / 1000).toFixed(0)}k`}
          tick={{ fontSize: 12, fill: "#9CA3AF" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={avgRevenue}
          stroke="#E5E7EB"
          strokeDasharray="4 4"
        />
        <Area
          type="monotone"
          dataKey="revenue"
          name="Revenue"
          stroke="#2563EB"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          animationDuration={1200}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          name="Expenses"
          stroke="#64748B"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          animationDuration={1200}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

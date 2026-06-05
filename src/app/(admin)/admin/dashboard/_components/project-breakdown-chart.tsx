"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { mockProjectBreakdownData } from "@/mock";
import { formatNumber } from "@/lib/format";

const total = mockProjectBreakdownData.reduce((sum, d) => sum + d.count, 0);

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) {
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
  return (
    <div className="flex flex-col items-center">
      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={mockProjectBreakdownData}
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
            {mockProjectBreakdownData.map((entry) => (
              <Cell key={entry.status} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          {/* Center label */}
          <text
            x="50%"
            y="46%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-foreground text-2xl font-bold"
          >
            {formatNumber(total)}
          </text>
          <text
            x="50%"
            y="58%"
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-muted-foreground text-xs"
          >
            total
          </text>
        </PieChart>
      </ResponsiveContainer>

    </div>
  );
}

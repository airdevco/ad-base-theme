"use client";

import { useEffect } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { mockDashboardStats } from "@/mock";
import { AdminSdcPageHeader } from "@/components/layout/admin-sdc-page-header";
import { SdcHeaderLead } from "@/components/layout/admin-sdc-sidebar";
import { AdminSdcPageHeaderActions } from "@/components/layout/admin-sdc-page-header-actions";
import { Card, CardContent, CardHeader } from "@/components/admin-sdc-ui/card";
import { Greeting } from "./_components/greeting";
import { RevenueChart } from "./_components/revenue-chart";
import { UserGrowthChart } from "./_components/user-growth-chart";
import { ProjectBreakdownChart } from "./_components/project-breakdown-chart";
import { EmailEngagementChart } from "./_components/email-engagement-chart";
import type { DashboardStat } from "@/types";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { formatDashboardStatValue } from "@/lib/format";


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

function StatCard({ stat }: { stat: DashboardStat }) {
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

function ChartCardHeader({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <CardHeader className="pb-2">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-[13px] text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </CardHeader>
  );
}

export default function DashboardPage() {
  useEffect(() => {
    document.title = `Dashboard (SDC) | ${APP_NAME}`;
  }, []);

  return (
    <div className="flex flex-col">
      <AdminSdcPageHeader
        title="Dashboard"
        breadcrumb={{ label: "Admin", href: ROUTES.admin.dashboard }}
        lead={<SdcHeaderLead />}
        actions={<AdminSdcPageHeaderActions />}
      />

      <div className="flex flex-col gap-6 py-6">
        <Greeting />

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {mockDashboardStats.map((stat) => (
            <StatCard key={stat.label} stat={stat} />
          ))}
        </div>

        {/* Main charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card className="overflow-hidden rounded-xl border-border shadow-none dark:border-transparent">
            <ChartCardHeader
              title="Revenue & Expenses"
              subtitle="Monthly comparison over the past year"
            />
            <CardContent className="pt-0">
              <RevenueChart />
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl border-border shadow-none dark:border-transparent">
            <ChartCardHeader
              title="Signups & Active Users"
              subtitle="Monthly user acquisition & engagement"
            />
            <CardContent className="pt-0">
              <UserGrowthChart />
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl border-border shadow-none dark:border-transparent">
            <ChartCardHeader
              title="Project Status"
              subtitle="Distribution by current status"
            />
            <CardContent className="pt-0">
              <ProjectBreakdownChart />
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-xl border-border shadow-none dark:border-transparent">
            <ChartCardHeader
              title="Email Engagement"
              subtitle="Sent vs opened over recent months"
            />
            <CardContent className="pt-0">
              <EmailEngagementChart />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

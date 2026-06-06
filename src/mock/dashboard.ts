import type { DashboardStat } from "@/types";

export const mockDashboardStats: DashboardStat[] = [
  {
    label: "Total Users",
    value: 1284,
    change: 12.5,
    trend: "up",
    sparkline: [980, 1020, 1060, 1110, 1150, 1210, 1284],
  },
  {
    label: "Active Projects",
    value: 23,
    change: -3.2,
    trend: "down",
    sparkline: [28, 27, 26, 25, 24, 24, 23],
  },
  {
    label: "Revenue",
    value: "$48,200",
    change: 8.1,
    trend: "up",
    sparkline: [35900, 39800, 41200, 43500, 45100, 44600, 48200],
  },
  {
    label: "Emails Sent",
    value: 3420,
    change: 0,
    trend: "flat",
    sparkline: [3380, 3400, 3410, 3430, 3420, 3410, 3420],
  },
];

export const mockRevenueData = [
  { month: "Mar 2025", revenue: 32400, expenses: 22800 },
  { month: "Apr 2025", revenue: 34100, expenses: 23500 },
  { month: "May 2025", revenue: 31800, expenses: 24100 },
  { month: "Jun 2025", revenue: 36500, expenses: 25200 },
  { month: "Jul 2025", revenue: 38200, expenses: 24800 },
  { month: "Aug 2025", revenue: 35900, expenses: 25600 },
  { month: "Sep 2025", revenue: 39800, expenses: 26100 },
  { month: "Oct 2025", revenue: 41200, expenses: 26800 },
  { month: "Nov 2025", revenue: 43500, expenses: 27400 },
  { month: "Dec 2025", revenue: 45100, expenses: 28200 },
  { month: "Jan 2026", revenue: 44600, expenses: 27900 },
  { month: "Feb 2026", revenue: 48200, expenses: 28600 },
];

export const mockUserGrowthData = [
  { month: "Mar 2025", signups: 68, activeUsers: 520 },
  { month: "Apr 2025", signups: 74, activeUsers: 558 },
  { month: "May 2025", signups: 82, activeUsers: 602 },
  { month: "Jun 2025", signups: 61, activeUsers: 580 },
  { month: "Jul 2025", signups: 55, activeUsers: 565 },
  { month: "Aug 2025", signups: 58, activeUsers: 572 },
  { month: "Sep 2025", signups: 92, activeUsers: 640 },
  { month: "Oct 2025", signups: 105, activeUsers: 710 },
  { month: "Nov 2025", signups: 118, activeUsers: 790 },
  { month: "Dec 2025", signups: 98, activeUsers: 820 },
  { month: "Jan 2026", signups: 125, activeUsers: 910 },
  { month: "Feb 2026", signups: 127, activeUsers: 980 },
];

export const mockProjectBreakdownData = [
  { status: "Active", count: 23 },
  { status: "Planning", count: 12 },
  { status: "On Hold", count: 8 },
];

export const mockEmailEngagementData = [
  { month: "Mar 2025", sent: 320, opened: 195 },
  { month: "Apr 2025", sent: 355, opened: 218 },
  { month: "May 2025", sent: 380, opened: 240 },
  { month: "Jun 2025", sent: 395, opened: 252 },
  { month: "Jul 2025", sent: 410, opened: 260 },
  { month: "Aug 2025", sent: 425, opened: 268 },
  { month: "Sep 2025", sent: 420, opened: 285 },
  { month: "Oct 2025", sent: 465, opened: 310 },
  { month: "Nov 2025", sent: 510, opened: 348 },
  { month: "Dec 2025", sent: 488, opened: 295 },
  { month: "Jan 2026", sent: 535, opened: 372 },
  { month: "Feb 2026", sent: 570, opened: 390 },
];

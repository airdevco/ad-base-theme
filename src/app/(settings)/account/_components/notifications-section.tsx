"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Toggle } from "@/components/ui/toggle";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NotificationSetting {
  id: string;
  label: string;
  description: string;
  email: boolean;
  app: boolean;
}

const defaultSettings: NotificationSetting[] = [
  {
    id: "comments",
    label: "Comments",
    description: "When someone comments on a record you're following",
    email: true,
    app: true,
  },
  {
    id: "mentions",
    label: "Mentions",
    description: "When someone mentions you in a comment or note",
    email: true,
    app: true,
  },
  {
    id: "assignments",
    label: "Assignments",
    description: "When a record is assigned to you",
    email: true,
    app: false,
  },
  {
    id: "updates",
    label: "Status updates",
    description: "When a record you're following changes status",
    email: false,
    app: true,
  },
  {
    id: "invitations",
    label: "Invitations",
    description: "When you're invited to a workspace or list",
    email: true,
    app: true,
  },
];

export function NotificationsSection() {
  const [dailyDigest, setDailyDigest] = useState(true);
  const [settings, setSettings] = useState(defaultSettings);

  function updateSetting(
    id: string,
    channel: "email" | "app",
    value: boolean
  ) {
    setSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [channel]: value } : s))
    );
    toast.success("Preference updated");
  }

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-foreground">Notifications</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose how and when you want to be notified
      </p>

      <div className="mt-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <h2 className="text-[20px] font-bold leading-[30px] text-foreground">
              Daily digest
            </h2>
            <p className="text-sm text-muted-foreground">
              Receive a daily summary of activity across your workspaces
            </p>
          </div>
          <Toggle
            checked={dailyDigest}
            onCheckedChange={(checked) => {
              setDailyDigest(checked);
              toast.success("Preference updated");
            }}
            size="sm"
          />
        </div>
      </div>

      <div className="my-6 border-t border-border" />

      <div className="flex flex-col gap-1">
        <h2 className="text-[20px] font-bold leading-[30px] text-foreground">
          Collaboration notifications
        </h2>
        <p className="text-sm text-muted-foreground">
          Configure notifications for collaborative actions
        </p>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold">Notification</TableHead>
              <TableHead className="w-20 text-center font-semibold">Email</TableHead>
              <TableHead className="w-20 text-center font-semibold">App</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.map((setting) => (
              <TableRow key={setting.id}>
                <TableCell>
                  <p className="text-sm font-medium text-foreground">
                    {setting.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {setting.description}
                  </p>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Toggle
                      checked={setting.email}
                      onCheckedChange={(val) =>
                        updateSetting(setting.id, "email", val)
                      }
                      size="sm"
                    />
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    <Toggle
                      checked={setting.app}
                      onCheckedChange={(val) =>
                        updateSetting(setting.id, "app", val)
                      }
                      size="sm"
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

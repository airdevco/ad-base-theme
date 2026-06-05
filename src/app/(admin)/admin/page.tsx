import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function AdminSdcIndexPage() {
  redirect(ROUTES.admin.dashboard);
}

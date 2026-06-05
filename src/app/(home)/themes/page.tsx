import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { ThemesClient } from "./themes-client";

export const metadata: Metadata = {
  title: `Themes | ${APP_NAME}`,
};

export default function ThemesPage() {
  return <ThemesClient />;
}

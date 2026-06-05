"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

/** Legacy `/admin/legal` — forwards to the pages list (same as previous admin). */
export default function LegalRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(ROUTES.admin.pages);
  }, [router]);

  return null;
}

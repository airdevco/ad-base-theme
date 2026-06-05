import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="text-[13px] font-medium tracking-[-0.2px] text-primary">
        404 error
      </p>
      <h1 className="mt-3 text-[36px] font-semibold leading-[1.2] tracking-[-1.35px] text-foreground">
        Page not found
      </h1>
      <p className="mt-3 max-w-[360px] text-[15px] leading-[1.5] tracking-[-0.2px] text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        href={ROUTES.home}
        className="mt-8 inline-flex h-[36px] items-center gap-2 rounded-lg bg-brand px-4 text-[13px] font-medium text-brand-foreground transition-colors hover:bg-brand/90"
      >
        <ArrowLeft className="size-3.5" />
        Back to home
      </Link>
    </div>
  );
}

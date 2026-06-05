import type { Metadata } from "next";
import { APP_NAME } from "@/lib/constants";
import { mockLegalPages } from "@/mock/legal";
import { Footer } from "@/components/home/footer";

const page = mockLegalPages.find((p) => p.slug === "privacy")!;

export const metadata: Metadata = {
  title: `${page.title} | ${APP_NAME}`,
};

export default function PrivacyPage() {
  const { title, content, updatedAt } = page;

  return (
    <>
      {/* Hero banner */}
      <div className="bg-brand-gradient px-6 py-16 text-center md:py-20">
        <h1 className="text-[36px] font-semibold leading-[1.3] tracking-[-1.35px] text-brand-foreground md:text-[48px]">
          {title}
        </h1>
        <p className="mt-3 text-[16px] tracking-[-0.45px] text-brand-foreground/50">
          Last updated:{" "}
          {new Date(updatedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-6 py-8 md:py-10">
        <div
          className="prose max-w-none text-[15px] leading-[1.8] tracking-[-0.45px] text-muted-foreground prose-headings:font-semibold prose-headings:tracking-[-0.6px] prose-headings:text-foreground prose-h2:mt-10 prose-h2:text-[20px] prose-h3:text-[17px] prose-p:my-4 prose-li:my-1 prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>

      <Footer />
    </>
  );
}

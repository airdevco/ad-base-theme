import { Hero } from "@/components/home/hero";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Services } from "@/components/home/services";
import { TestimonialSection } from "@/components/home/testimonial";
import { Features } from "@/components/home/features";
import { Pricing } from "@/components/home/pricing";
import { HowItWorks } from "@/components/home/how-it-works";
import { Impact } from "@/components/home/impact";
import { Team } from "@/components/home/team";
import { FAQ } from "@/components/home/faq";
import { Contact } from "@/components/home/contact";
import { Footer } from "@/components/home/footer";
import { APP_NAME } from "@/lib/constants";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${APP_NAME} — Expert consulting that drives real growth`,
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhyChooseUs />
      <Services />
      <TestimonialSection />
      <Features />
      <Pricing />
      <HowItWorks />
      <Impact />
      <Team />
      <FAQ />
      <Contact />
      <Footer />
    </>
  );
}

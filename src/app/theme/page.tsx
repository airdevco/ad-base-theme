import {
  Inter,
  DM_Sans,
  Space_Grotesk,
  Outfit,
  Plus_Jakarta_Sans,
  Sora,
  Manrope,
  Poppins,
  Raleway,
  Playfair_Display,
  Merriweather,
  Lora,
} from "next/font/google";
import { ThemePage } from "./_components/theme-page";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"], variable: "--font-preview-inter", weight: ["400", "500", "600", "700"], display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-preview-dm-sans", weight: ["400", "500", "600", "700"], display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-preview-space-grotesk", weight: ["400", "500", "600", "700"], display: "swap" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-preview-outfit", weight: ["400", "500", "600", "700"], display: "swap" });
const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-preview-plus-jakarta-sans", weight: ["400", "500", "600", "700", "800"], display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-preview-sora", weight: ["400", "500", "600", "700"], display: "swap" });
const manrope = Manrope({ subsets: ["latin"], variable: "--font-preview-manrope", weight: ["400", "500", "600", "700", "800"], display: "swap" });
const poppins = Poppins({ subsets: ["latin"], variable: "--font-preview-poppins", weight: ["400", "500", "600", "700"], display: "swap" });
const raleway = Raleway({ subsets: ["latin"], variable: "--font-preview-raleway", weight: ["400", "500", "600", "700"], display: "swap" });
const playfairDisplay = Playfair_Display({ subsets: ["latin"], variable: "--font-preview-playfair-display", weight: ["400", "500", "600", "700"], display: "swap" });
const merriweather = Merriweather({ subsets: ["latin"], variable: "--font-preview-merriweather", weight: ["400", "700"], display: "swap" });
const lora = Lora({ subsets: ["latin"], variable: "--font-preview-lora", weight: ["400", "500", "600", "700"], display: "swap" });

const fontClasses = [
  inter, dmSans, spaceGrotesk, outfit, plusJakartaSans, sora,
  manrope, poppins, raleway, playfairDisplay, merriweather, lora,
].map((f) => f.variable).join(" ");

export const metadata: Metadata = {
  title: "Theme Previewer",
};

export default function Page() {
  return <ThemePage fontClasses={fontClasses} />;
}

"use client";

/** Search page (SDC design variant). */
import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Star,
  ChevronDown,
  X,
  Heart,
  ArrowRight,
  Briefcase,
} from "lucide-react";

/* ── Mock data ────────────────────────────────────────────────────── */

const CATEGORIES = [
  "All",
  "Strategy",
  "Digital",
  "Operations",
  "Marketing",
  "Finance",
  "HR & Talent",
  "Legal",
] as const;

const LOCATIONS = [
  "All locations",
  "San Francisco",
  "New York",
  "Los Angeles",
  "Chicago",
  "Austin",
  "Miami",
  "Seattle",
  "Boston",
  "Remote",
] as const;

const SORT_OPTIONS = [
  "Recommended",
  "Rating: High to low",
  "Price: Low to high",
  "Price: High to low",
  "Most reviewed",
] as const;

interface Consultant {
  id: number;
  name: string;
  title: string;
  company: string;
  location: string;
  image: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  category: string;
  tags: string[];
  available: boolean;
  yearsExp: number;
}

const consultants: Consultant[] = [
  {
    id: 1,
    name: "Daniel Chen",
    title: "Growth Strategy Lead",
    company: "Previously at McKinsey",
    location: "San Francisco",
    image: "https://mockmind-api.uifaces.co/content/human/80.jpg",
    rating: 4.9,
    reviewCount: 127,
    hourlyRate: 250,
    category: "Strategy",
    tags: ["Go-to-market", "Series A-C"],
    available: true,
    yearsExp: 12,
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    title: "Digital Transformation Advisor",
    company: "Ex-Deloitte Digital",
    location: "New York",
    image: "https://mockmind-api.uifaces.co/content/human/219.jpg",
    rating: 4.8,
    reviewCount: 93,
    hourlyRate: 300,
    category: "Digital",
    tags: ["Cloud migration", "Enterprise"],
    available: true,
    yearsExp: 15,
  },
  {
    id: 3,
    name: "Thomas Jones",
    title: "Operations Consultant",
    company: "Ex-Bain & Company",
    location: "Chicago",
    image: "https://mockmind-api.uifaces.co/content/human/222.jpg",
    rating: 5.0,
    reviewCount: 64,
    hourlyRate: 275,
    category: "Operations",
    tags: ["Supply chain", "Process design"],
    available: false,
    yearsExp: 10,
  },
  {
    id: 4,
    name: "Jessica Kim",
    title: "Brand & Marketing Strategist",
    company: "Previously at Ogilvy",
    location: "Los Angeles",
    image: "https://mockmind-api.uifaces.co/content/human/125.jpg",
    rating: 4.7,
    reviewCount: 156,
    hourlyRate: 200,
    category: "Marketing",
    tags: ["Brand strategy", "B2B"],
    available: true,
    yearsExp: 8,
  },
  {
    id: 5,
    name: "Anton Volkov",
    title: "Financial Advisory Partner",
    company: "Ex-Goldman Sachs",
    location: "New York",
    image: "https://mockmind-api.uifaces.co/content/human/92.jpg",
    rating: 4.9,
    reviewCount: 88,
    hourlyRate: 350,
    category: "Finance",
    tags: ["M&A", "Due diligence"],
    available: true,
    yearsExp: 18,
  },
  {
    id: 6,
    name: "Amara Okafor",
    title: "Talent & Culture Advisor",
    company: "Previously at Mercer",
    location: "Austin",
    image: "https://mockmind-api.uifaces.co/content/human/128.jpg",
    rating: 4.6,
    reviewCount: 71,
    hourlyRate: 175,
    category: "HR & Talent",
    tags: ["Org design", "DEI strategy"],
    available: true,
    yearsExp: 9,
  },
  {
    id: 7,
    name: "Robert Thompson",
    title: "Revenue Operations Lead",
    company: "Ex-Stripe",
    location: "San Francisco",
    image: "https://mockmind-api.uifaces.co/content/human/91.jpg",
    rating: 4.8,
    reviewCount: 104,
    hourlyRate: 225,
    category: "Operations",
    tags: ["RevOps", "SaaS metrics"],
    available: true,
    yearsExp: 7,
  },
  {
    id: 8,
    name: "Priya Krishnamurthy",
    title: "Product Strategy Consultant",
    company: "Previously at BCG",
    location: "Seattle",
    image: "https://mockmind-api.uifaces.co/content/human/126.jpg",
    rating: 4.9,
    reviewCount: 112,
    hourlyRate: 280,
    category: "Strategy",
    tags: ["Product-led growth", "Pricing"],
    available: false,
    yearsExp: 11,
  },
  {
    id: 9,
    name: "Nicole Williams",
    title: "Legal & Compliance Advisor",
    company: "Ex-Latham & Watkins",
    location: "Boston",
    image: "https://mockmind-api.uifaces.co/content/human/93.jpg",
    rating: 4.7,
    reviewCount: 45,
    hourlyRate: 325,
    category: "Legal",
    tags: ["Compliance", "Contracts"],
    available: true,
    yearsExp: 14,
  },
  {
    id: 10,
    name: "Hannah Anderson",
    title: "Growth Marketing Lead",
    company: "Previously at HubSpot",
    location: "Remote",
    image: "https://mockmind-api.uifaces.co/content/human/127.jpg",
    rating: 4.8,
    reviewCount: 89,
    hourlyRate: 195,
    category: "Marketing",
    tags: ["Demand gen", "Content strategy"],
    available: true,
    yearsExp: 6,
  },
  {
    id: 11,
    name: "David Wu",
    title: "Data & Analytics Strategist",
    company: "Ex-Accenture",
    location: "San Francisco",
    image: "https://mockmind-api.uifaces.co/content/human/210.jpg",
    rating: 4.9,
    reviewCount: 76,
    hourlyRate: 260,
    category: "Digital",
    tags: ["Data strategy", "AI/ML"],
    available: true,
    yearsExp: 10,
  },
  {
    id: 12,
    name: "Sofia Mendez",
    title: "International Expansion Lead",
    company: "Previously at PwC",
    location: "Miami",
    image: "https://mockmind-api.uifaces.co/content/human/205.jpg",
    rating: 4.6,
    reviewCount: 58,
    hourlyRate: 240,
    category: "Strategy",
    tags: ["LATAM markets", "Market entry"],
    available: true,
    yearsExp: 13,
  },
];

/* ── Search page ──────────────────────────────────────────────────── */

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [location, setLocation] = useState<string>("All locations");
  const [sort, setSort] = useState<string>("Recommended");
  const [priceRange] = useState<[number, number]>([0, 500]);
  const [availableOnly] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const filtered = useMemo(() => {
    let items = [...consultants];

    if (query) {
      const q = query.toLowerCase();
      items = items.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.company.toLowerCase().includes(q)
      );
    }

    if (category !== "All") {
      items = items.filter((c) => c.category === category);
    }

    if (location !== "All locations") {
      items = items.filter((c) => c.location === location);
    }

    if (availableOnly) {
      items = items.filter((c) => c.available);
    }

    items = items.filter(
      (c) => c.hourlyRate >= priceRange[0] && c.hourlyRate <= priceRange[1]
    );

    switch (sort) {
      case "Rating: High to low":
        items.sort((a, b) => b.rating - a.rating);
        break;
      case "Price: Low to high":
        items.sort((a, b) => a.hourlyRate - b.hourlyRate);
        break;
      case "Price: High to low":
        items.sort((a, b) => b.hourlyRate - a.hourlyRate);
        break;
      case "Most reviewed":
        items.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return items;
  }, [query, category, location, sort, priceRange, availableOnly]);

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeFilterCount =
    (category !== "All" ? 1 : 0) +
    (location !== "All locations" ? 1 : 0);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero search banner ────────────────────────────────────── */}
      <div className="bg-background px-6 pb-2 pt-3 min-[1198px]:px-0">
        <div className="mx-auto max-w-[1150px] overflow-hidden rounded-[16px] bg-brand-gradient px-8 pb-8 pt-8 md:px-12">
          {/* Heading */}
          <h1 className="text-[28px] font-semibold leading-[1.3] tracking-[-0.84px] text-brand-foreground md:text-[36px]">
            Find your consultant
          </h1>
          <p className="mt-2 max-w-[440px] text-[16px] tracking-[-0.48px] text-brand-foreground/50">
            Browse experts across strategy, digital, marketing, and more.
          </p>

          {/* Search row */}
          <div className="mt-7 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-5 top-1/2 size-[16px] -translate-y-1/2 text-brand-foreground/40" />
              <input
                type="text"
                placeholder="Search by name, expertise, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-[52px] w-full rounded-[12px] border-0 bg-brand-foreground/10 pl-12 pr-4 text-[16px] text-brand-foreground outline-none transition-colors placeholder:text-brand-foreground/40 focus:bg-brand-foreground/15"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 hover:bg-brand-foreground/10"
                >
                  <X className="size-4 text-brand-foreground/50" />
                </button>
              )}
            </div>

            {/* Location select */}
            <div className="relative hidden md:block">
              <MapPin className="absolute left-4 top-1/2 size-[15px] -translate-y-1/2 text-brand-foreground/40" />
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="h-[52px] appearance-none rounded-[12px] border-0 bg-brand-foreground/10 pl-10 pr-9 text-[16px] text-brand-foreground outline-none transition-colors focus:bg-brand-foreground/15 [&>option]:text-foreground"
              >
                {LOCATIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-[15px] -translate-y-1/2 text-brand-foreground/40" />
            </div>

            {/* Sort select */}
            <div className="relative hidden md:block">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="h-[52px] appearance-none rounded-[12px] border-0 bg-brand-foreground/10 pl-5 pr-9 text-[16px] text-brand-foreground outline-none transition-colors focus:bg-brand-foreground/15 [&>option]:text-foreground"
              >
                {SORT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-[15px] -translate-y-1/2 text-brand-foreground/40" />
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-5 flex gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-[14px] font-medium tracking-[-0.42px] transition-colors ${
                  category === cat
                    ? "bg-brand-foreground text-brand"
                    : "bg-brand-foreground/[0.08] text-brand-foreground/60 hover:bg-brand-foreground/[0.14] hover:text-brand-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1150px] px-6 py-6 min-[1198px]:px-0">
        {/* Results count */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-[14px] tracking-[-0.42px] text-muted-foreground">
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            consultant{filtered.length !== 1 ? "s" : ""} found
            {category !== "All" && (
              <span>
                {" "}
                in{" "}
                <span className="font-medium text-foreground">{category}</span>
              </span>
            )}
            {location !== "All locations" && (
              <span>
                {" "}
                in{" "}
                <span className="font-medium text-foreground">{location}</span>
              </span>
            )}
          </p>

          {/* Mobile sort */}
          <div className="relative md:hidden">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-[32px] appearance-none rounded-[8px] border border-border bg-background pl-2.5 pr-7 text-[14px] text-foreground focus:outline-none"
            >
              {SORT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 size-[12px] -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>

        {/* Card grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted/50">
              <Search className="size-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-[15px] font-medium tracking-[-0.45px] text-foreground">
              No consultants found
            </p>
            <p className="mt-1 text-[14px] tracking-[-0.42px] text-muted-foreground">
              Try adjusting your filters or search terms
            </p>
            <button
              onClick={() => {
                setQuery("");
                setCategory("All");
                setLocation("All locations");
              }}
              className="mt-4 text-[14px] font-medium tracking-[-0.42px] text-brand hover:underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid items-stretch gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.map((consultant) => (
              <ConsultantCard
                key={consultant.id}
                consultant={consultant}
                isFavorite={favorites.has(consultant.id)}
                onToggleFavorite={() => toggleFavorite(consultant.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Consultant card ──────────────────────────────────────────────── */

function ConsultantCard({
  consultant,
  isFavorite,
  onToggleFavorite,
}: {
  consultant: Consultant;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="group flex h-full min-h-0 flex-col overflow-hidden rounded-[16px] border border-border bg-background transition-shadow hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      {/* Image */}
      <div className="relative h-[260px] shrink-0 overflow-hidden bg-muted">
        <img
          src={consultant.image}
          alt={consultant.name}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className="absolute right-3 top-3 flex size-[30px] items-center justify-center rounded-full bg-white/90 backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Heart
            className={`size-[14px] ${
              isFavorite
                ? "fill-red-500 text-red-500"
                : "text-muted-foreground"
            }`}
          />
        </button>

        {/* Availability badge */}
        {consultant.available && (
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 backdrop-blur-sm">
            <span className="relative flex size-[6px] shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-status-success-text/75" />
              <span className="relative inline-flex size-[6px] rounded-full bg-status-success-text" />
            </span>
            <span className="text-[12px] font-medium tracking-[-0.36px] text-foreground">
              Available
            </span>
          </div>
        )}
      </div>

      {/* Content — flex-1 fills row height; footer stays at bottom */}
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="flex flex-col">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 break-words text-[15px] font-semibold tracking-[-0.45px] text-foreground">
                  {consultant.name}
                </h3>
                <p className="mt-0.5 line-clamp-2 break-words text-[14px] tracking-[-0.42px] text-muted-foreground">
                  {consultant.title}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Star className="size-[14px] fill-amber-400 text-amber-400" />
                <span className="text-[14px] font-semibold tracking-[-0.42px] text-foreground">
                  {consultant.rating}
                </span>
                <span className="text-[12px] tracking-[-0.36px] text-muted-foreground">
                  ({consultant.reviewCount})
                </span>
              </div>
            </div>

            {/* Meta row */}
            <div className="mt-2.5 flex items-center gap-3 text-[12px] tracking-[-0.36px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Briefcase className="size-[12px]" />
                {consultant.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-[12px]" />
                {consultant.location}
              </span>
            </div>

            {/* Tags */}
            <div className="mt-3 mb-5 flex flex-wrap gap-1.5">
              {consultant.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-muted/50 px-2.5 py-0.5 text-[12px] font-medium tracking-[-0.36px] text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              <span className="rounded-full bg-muted/50 px-2.5 py-0.5 text-[12px] font-medium tracking-[-0.36px] text-muted-foreground">
                {consultant.yearsExp}+ yrs
              </span>
            </div>
          </div>

          {/* Divider + price row — pinned to card bottom when the row grows */}
          <div className="mt-auto flex w-full shrink-0 items-center justify-between border-t border-border pt-4 pb-0">
            <div className="min-w-0">
              <span className="text-[18px] font-semibold tracking-[-0.54px] text-foreground">
                ${consultant.hourlyRate}
              </span>
              <span className="text-[14px] tracking-[-0.42px] text-muted-foreground">
                {" "}
                /hr
              </span>
            </div>
            <button
              type="button"
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              View profile
              <ArrowRight className="size-3.5 shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

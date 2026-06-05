export interface LegalPage {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "published" | "draft";
  updatedAt: string;
  createdAt: string;
}

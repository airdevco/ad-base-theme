export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  mergeTerms: string[];
  html: string;
  updatedAt: string;
  createdAt: string;
}

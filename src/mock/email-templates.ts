import type { EmailTemplate } from "@/types";

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "tpl_01",
    name: "Welcome Email",
    subject: "Welcome to Our Platform!",
    body: '<h1>Welcome, {{first_name}}!</h1><p>Thanks for joining us at {{company_name}}. We\'re excited to have you on board.</p><p>Your account has been created with the email {{email}}. If you have any questions, don\'t hesitate to reach out to our support team.</p><p>Best regards,<br>The {{company_name}} Team</p>',
    mergeTerms: ["first_name", "last_name", "email", "company_name"],
    html: "",
    updatedAt: "2025-03-15T10:30:00Z",
    createdAt: "2024-11-01T09:00:00Z",
  },
  {
    id: "tpl_02",
    name: "Password Reset",
    subject: "Reset Your Password",
    body: '<h1>Password Reset</h1><p>Hi {{first_name}},</p><p>We received a request to reset the password for your account ({{email}}). Click the link below to set a new password. This link expires in 24 hours.</p><p><a href="{{reset_link}}">Reset Password</a></p><p>If you didn\'t request this, you can safely ignore this email.</p>',
    mergeTerms: ["first_name", "email", "reset_link"],
    html: "",
    updatedAt: "2025-02-20T14:00:00Z",
    createdAt: "2024-11-05T11:30:00Z",
  },
  {
    id: "tpl_03",
    name: "Invoice",
    subject: "Your Invoice #{{invoice_number}}",
    body: '<h1>Invoice #{{invoice_number}}</h1><p>Hi {{first_name}},</p><p>Please find your invoice details below. Payment of {{amount}} is due by {{due_date}}.</p><ul><li>Invoice Number: {{invoice_number}}</li><li>Amount: {{amount}}</li><li>Due Date: {{due_date}}</li></ul><p>Thank you for your business!</p>',
    mergeTerms: ["first_name", "invoice_number", "amount", "due_date"],
    html: "",
    updatedAt: "2025-04-10T08:45:00Z",
    createdAt: "2024-12-12T16:00:00Z",
  },
  {
    id: "tpl_04",
    name: "Newsletter",
    subject: "Your Monthly Update - {{month}} {{year}}",
    body: '<h1>Monthly Newsletter</h1><p>Hi {{first_name}},</p><p>Here\'s what happened at {{company_name}} this month. Stay tuned for more updates!</p><h2>Highlights</h2><ul><li>New features released</li><li>Community spotlight</li><li>Upcoming events</li></ul><p>Thanks for being part of our community.</p>',
    mergeTerms: ["first_name", "company_name", "month", "year"],
    html: "",
    updatedAt: "2025-05-01T12:00:00Z",
    createdAt: "2025-01-08T10:15:00Z",
  },
];

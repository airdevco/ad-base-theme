import type { LegalPage } from "@/types";

export const mockLegalPages: LegalPage[] = [
  {
    id: "page_01",
    title: "Terms of Use",
    slug: "terms",
    status: "published",
    updatedAt: "2025-03-15T10:30:00Z",
    createdAt: "2024-11-01T09:00:00Z",
    content: `
<h2>1. Acceptance of Terms</h2>
<p>By accessing or using Airdev ("the Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.</p>

<h2>2. Description of Service</h2>
<p>Airdev provides a platform for agencies to build, manage, and deploy software applications. The Service includes dashboards, admin tools, authentication systems, and related features.</p>

<h2>3. User Accounts</h2>
<p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. You must be at least 18 years old to create an account.</p>

<h2>4. Acceptable Use</h2>
<p>You agree not to:</p>
<ul>
<li>Use the Service for any unlawful purpose</li>
<li>Attempt to gain unauthorized access to any part of the Service</li>
<li>Interfere with or disrupt the Service or its infrastructure</li>
<li>Upload malicious code or content</li>
<li>Resell or redistribute the Service without authorization</li>
</ul>

<h2>5. Intellectual Property</h2>
<p>All content, features, and functionality of the Service are owned by Airdev and are protected by copyright, trademark, and other intellectual property laws. You retain ownership of any content you create using the Service.</p>

<h2>6. Payment Terms</h2>
<p>Paid plans are billed in advance on a monthly or annual basis. Refunds are handled on a case-by-case basis. We reserve the right to change pricing with 30 days notice.</p>

<h2>7. Termination</h2>
<p>We may suspend or terminate your access to the Service at any time for violation of these terms. You may cancel your account at any time through your account settings.</p>

<h2>8. Limitation of Liability</h2>
<p>The Service is provided "as is" without warranties of any kind. Airdev shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service.</p>

<h2>9. Changes to Terms</h2>
<p>We reserve the right to modify these terms at any time. We will notify users of material changes via email or through the Service. Continued use after changes constitutes acceptance.</p>

<h2>10. Contact</h2>
<p>For questions about these terms, please contact us at <strong>legal@airdev.co</strong>.</p>
`.trim(),
  },
  {
    id: "page_02",
    title: "Privacy Policy",
    slug: "privacy",
    status: "published",
    updatedAt: "2025-03-10T14:00:00Z",
    createdAt: "2024-11-01T09:00:00Z",
    content: `
<h2>1. Information We Collect</h2>
<p>We collect information you provide directly, such as your name, email address, and billing information when you create an account or use our Service.</p>
<p>We also automatically collect certain information, including:</p>
<ul>
<li>IP address and browser type</li>
<li>Pages visited and features used</li>
<li>Device information and operating system</li>
<li>Cookies and similar tracking technologies</li>
</ul>

<h2>2. How We Use Your Information</h2>
<p>We use the information we collect to:</p>
<ul>
<li>Provide, maintain, and improve the Service</li>
<li>Process transactions and send related information</li>
<li>Send technical notices, updates, and support messages</li>
<li>Respond to your comments, questions, and requests</li>
<li>Monitor and analyze trends, usage, and activities</li>
</ul>

<h2>3. Information Sharing</h2>
<p>We do not sell your personal information. We may share information with:</p>
<ul>
<li>Service providers who assist in operating our platform</li>
<li>Law enforcement when required by law</li>
<li>Business partners with your consent</li>
</ul>

<h2>4. Data Security</h2>
<p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest, regular security audits, and access controls.</p>

<h2>5. Data Retention</h2>
<p>We retain your personal information for as long as your account is active or as needed to provide the Service. You may request deletion of your data at any time.</p>

<h2>6. Your Rights</h2>
<p>Depending on your location, you may have the right to:</p>
<ul>
<li>Access the personal information we hold about you</li>
<li>Request correction of inaccurate data</li>
<li>Request deletion of your data</li>
<li>Object to or restrict certain processing</li>
<li>Data portability</li>
</ul>

<h2>7. Cookies</h2>
<p>We use cookies and similar technologies to maintain your session, remember preferences, and analyze usage patterns. You can control cookie settings through your browser.</p>

<h2>8. Children's Privacy</h2>
<p>The Service is not intended for users under the age of 18. We do not knowingly collect information from children.</p>

<h2>9. Changes to This Policy</h2>
<p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "last updated" date.</p>

<h2>10. Contact</h2>
<p>For privacy-related questions, please contact us at <strong>privacy@airdev.co</strong>.</p>
`.trim(),
  },
];

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async redirects() {
    return [
      { source: "/admin-sdc", destination: "/admin", permanent: true },
      { source: "/admin-sdc/:path*", destination: "/admin/:path*", permanent: true },
      { source: "/account-sdc", destination: "/account", permanent: true },
      { source: "/account-sdc/:path*", destination: "/account/:path*", permanent: true },
      { source: "/login-sdc", destination: "/login", permanent: true },
      { source: "/signup-sdc", destination: "/signup", permanent: true },
      { source: "/forgot-password-sdc", destination: "/forgot-password", permanent: true },
      { source: "/onboarding-sdc", destination: "/onboarding", permanent: true },
      { source: "/search-sdc", destination: "/search", permanent: true },
    ];
  },
};

export default nextConfig;

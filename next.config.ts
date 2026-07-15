import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Hosts de portadas: Google Books, Open Library y Supabase Storage.
    remotePatterns: [
      { protocol: "https", hostname: "books.google.com" },
      { protocol: "https", hostname: "books.googleusercontent.com" },
      { protocol: "https", hostname: "covers.openlibrary.org" },
      { protocol: "https", hostname: "lpjvsdytgfunfactsxwd.supabase.co" },
    ],
  },
};

export default nextConfig;

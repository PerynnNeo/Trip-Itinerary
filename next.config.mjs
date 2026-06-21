/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // better-sqlite3 is a native addon — keep it out of the webpack server bundle
  // so it is required at runtime instead of being traced/bundled.
  serverExternalPackages: ['better-sqlite3'],
};

export default nextConfig;

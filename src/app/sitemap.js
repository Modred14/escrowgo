export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/auth/login`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/auth/register`, lastModified: new Date(), priority: 0.5 },
    { url: `${base}/delivery/register`, lastModified: new Date(), priority: 0.5 },
  ];
}

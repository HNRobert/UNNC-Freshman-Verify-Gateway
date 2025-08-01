import { getAvailableIdentities } from "../lib/actions";
import HomePageClient from "./HomePageClient";
import { Metadata } from "next";

// Force dynamic rendering for this page to ensure groups are fetched at request time
export const dynamic = 'force-dynamic';
export const revalidate = 0; // Disable ISR to ensure fresh data

export const metadata: Metadata = {
  title: "UNNC Freshman Verify Gateway - Identity Verification System",
  description:
    "Secure identity verification system for UNNC freshman groups. Verify your identity to access group QR codes and resources.",
  keywords: [
    "UNNC",
    "freshman",
    "identity",
    "verification",
    "QR code",
    "student groups",
  ],
  openGraph: {
    title: "UNNC Freshman Verify Gateway",
    description: "Secure identity verification system for UNNC freshman groups",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function HomePage() {
  // Fetch identities on the server side
  const identityConfigs = await getAvailableIdentities();

  return <HomePageClient identityConfigs={identityConfigs} />;
}

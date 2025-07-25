import {
  getIdentityConfig,
  getIdentityLocales,
  getIdentityLocaleTranslations,
} from "../../lib/actions";
import IdentityPageClient from "./IdentityPageClient";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface IdentityPageProps {
  params: Promise<{ identity: string }>;
}

export async function generateMetadata({
  params,
}: IdentityPageProps): Promise<Metadata> {
  const { identity } = await params;
  const config = await getIdentityConfig(identity);

  if (!config) {
    return {
      title: "Identity Not Found",
      description:
        "The requested identity verification page could not be found.",
    };
  }

  return {
    title: `${config.groupName} - Identity Verification`,
    description:
      config.description ||
      `Verify your identity to access ${config.groupName} group resources.`,
    keywords: [
      "identity",
      "verification",
      config.groupName,
      "student",
      "group",
      "QR code",
    ],
    openGraph: {
      title: `${config.groupName} - Identity Verification`,
      description:
        config.description ||
        `Verify your identity to access ${config.groupName} group resources.`,
      type: "website",
    },
    robots: {
      index: false, // Don't index identity verification pages for privacy
      follow: true,
    },
  };
}

export default async function IdentityPage({ params }: IdentityPageProps) {
  const { identity } = await params;

  // Fetch identity configuration on the server side
  const config = await getIdentityConfig(identity);

  if (!config) {
    notFound();
  }

  // Load identity-specific locales list
  const identityLocales = await getIdentityLocales(identity);

  // Load identity-specific translations
  let identityTranslations: Record<string, Record<string, unknown>> = {};

  if (identityLocales.length > 0) {
    const translationPromises = identityLocales.map(async (locale: string) => {
      const translation = await getIdentityLocaleTranslations(identity, locale);
      return { locale, translation };
    });

    const translationResults = await Promise.all(translationPromises);

    translationResults.forEach(({ locale, translation }) => {
      if (translation) {
        identityTranslations[locale] = translation;
      }
    });
  } else {
    // If no identity-specific locales, use config.locales as fallback
    identityTranslations = config.locales;
  }

  return (
    <IdentityPageClient
      identity={identity}
      identityTranslations={identityTranslations}
      identityLocales={identityLocales}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../components/I18nProvider";
import {
  InformationCircleIcon,
  QrCodeIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function HomePage() {
  const router = useRouter();
  const { t, mounted, clearIdentityTranslations } = useTranslation();
  const [availableIdentities, setAvailableIdentities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear any existing identity translations when on homepage
    clearIdentityTranslations();

    // Fetch available identities from API
    const fetchIdentities = async () => {
      try {
        const response = await fetch("/api/identities");
        if (response.ok) {
          const identities = await response.json();
          setAvailableIdentities(identities);
        }
      } catch (error) {
        console.error("Failed to fetch identities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdentities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove callback dependency

  // 在水合完成前显示加载状态
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleIdentityClick = (identity: string) => {
    router.push(`/${identity}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t("homepage.title")}
              </h1>
              <p className="text-gray-600">{t("homepage.description")}</p>
            </div>
            <LanguageSwitcher />
          </div>

          {/* Feature Introduction */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4">
              <QrCodeIcon className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("homepage.features.qrcode.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("homepage.features.qrcode.description")}
              </p>
            </div>
            <div className="text-center p-4">
              <UserGroupIcon className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("homepage.features.identity.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("homepage.features.identity.description")}
              </p>
            </div>
            <div className="text-center p-4">
              <InformationCircleIcon className="h-12 w-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("homepage.features.secure.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("homepage.features.secure.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Available Identities */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("homepage.availableGroups")}
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : availableIdentities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableIdentities.map((identity) => (
                <button
                  key={identity}
                  onClick={() => handleIdentityClick(identity)}
                  className="p-6 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
                >
                  <div className="flex items-center mb-3">
                    <ComputerDesktopIcon className="h-8 w-8 text-blue-600 mr-3 group-hover:text-blue-700" />
                    <h3 className="text-lg font-semibold text-gray-900 uppercase">
                      {identity}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {t("homepage.clickToAccess", {
                      identity: identity.toUpperCase(),
                    })}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <InformationCircleIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">{t("homepage.noGroupsAvailable")}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>{t("homepage.footer")}</p>
        </div>
      </div>
    </div>
  );
}

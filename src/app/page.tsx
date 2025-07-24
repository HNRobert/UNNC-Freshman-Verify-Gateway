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
import Image from "next/image";

interface IdentityConfig {
  identity: string;
  groupName: string;
  faviconUrl: string;
}

export default function HomePage() {
  const router = useRouter();
  const { t, mounted, clearIdentityTranslations } = useTranslation();
  const [availableIdentities, setAvailableIdentities] = useState<string[]>([]);
  const [identityConfigs, setIdentityConfigs] = useState<
    Record<string, IdentityConfig>
  >({});
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

          // Fetch config for each identity to get favicon URLs
          const configs: Record<string, IdentityConfig> = {};
          await Promise.all(
            identities.map(async (identity: string) => {
              try {
                const configResponse = await fetch(
                  `/api/identity/${identity.toLowerCase()}`
                );
                if (configResponse.ok) {
                  const config = await configResponse.json();
                  configs[identity] = {
                    identity,
                    groupName: config.groupName || identity.toUpperCase(),
                    faviconUrl: config.faviconUrl,
                  };
                }
              } catch (error) {
                console.error(`Failed to fetch config for ${identity}:`, error);
                // Fallback config
                configs[identity] = {
                  identity,
                  groupName: identity.toUpperCase(),
                  faviconUrl: "/favicon.ico",
                };
              }
            })
          );
          setIdentityConfigs(configs);
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
        <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-6 hover-lift">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
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
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8 hover-lift">
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
            <div className="text-center p-4 hover-lift hover-glow transition-all duration-300">
              <QrCodeIcon className="h-12 w-12 text-yellow-500 mx-auto mb-3 animate-bounce-gentle" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("homepage.features.qrcode.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("homepage.features.qrcode.description")}
              </p>
            </div>
            <div className="text-center p-4 hover-lift hover-glow transition-all duration-300">
              <UserGroupIcon className="h-12 w-12 text-green-600 mx-auto mb-3 animate-bounce-gentle" />
              <h3 className="font-semibold text-gray-900 mb-2">
                {t("homepage.features.identity.title")}
              </h3>
              <p className="text-sm text-gray-600">
                {t("homepage.features.identity.description")}
              </p>
            </div>
            <div className="text-center p-4 hover-lift hover-glow transition-all duration-300">
              <InformationCircleIcon className="h-12 w-12 text-purple-600 mx-auto mb-3 animate-bounce-gentle" />
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
        <div className="bg-white rounded-lg shadow-lg p-6 hover-lift">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {t("homepage.availableGroups")}
          </h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">{t("common.loading")}</p>
            </div>
          ) : availableIdentities.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableIdentities.map((identity) => {
                const config = identityConfigs[identity];
                return (
                  <button
                    key={identity}
                    onClick={() => handleIdentityClick(identity)}
                    className="p-6 border border-gray-200 rounded-lg hover:border-yellow-400 hover:shadow-lg transition-all duration-300 text-left group hover-lift hover-glow transform hover:scale-105"
                  >
                    <div className="flex items-center mb-3">
                      {config?.faviconUrl ? (
                        <div className="w-8 h-8 mr-3 relative hover-scale">
                          <Image
                            src={config.faviconUrl}
                            alt={`${config.groupName} favicon`}
                            width={32}
                            height={32}
                            className="rounded transition-all duration-300 group-hover:animate-bounce-gentle"
                            style={{ width: "auto", height: "auto" }}
                            onError={(e) => {
                              // Fallback to ComputerDesktopIcon if favicon fails to load
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent) {
                                parent.innerHTML =
                                  '<svg class="h-8 w-8 text-yellow-500 transition-colors animate-bounce-gentle" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <ComputerDesktopIcon className="h-8 w-8 text-yellow-500 mr-3 group-hover:text-yellow-600 transition-colors animate-bounce-gentle" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 uppercase group-hover:text-yellow-700 transition-colors">
                        {config?.groupName || identity}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors">
                      {t("homepage.clickToAccess", {
                        identity: config?.groupName || identity.toUpperCase(),
                      })}
                    </p>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 hover-glow">
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

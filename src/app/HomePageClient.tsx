"use client";

import { useEffect } from "react";
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
import ClientOnly from "../components/ClientOnly";
import type { IdentityListItem } from "../lib/actions";

interface HomePageClientProps {
  identityConfigs: IdentityListItem[];
}

export default function HomePageClient({
  identityConfigs,
}: HomePageClientProps) {
  const router = useRouter();
  const { t, clearIdentityTranslations, i18n } = useTranslation();

  // 根据当前语言获取组名
  const getLocalizedGroupName = (config: IdentityListItem): string => {
    const currentLocale = i18n.language;

    // 如果有多语言组名且当前语言存在对应组名，使用它
    if (config.groupNames && config.groupNames[currentLocale]) {
      return config.groupNames[currentLocale];
    }

    // 回退到中文组名
    if (config.groupNames && config.groupNames["zh-CN"]) {
      return config.groupNames["zh-CN"];
    }

    // 最后回退到默认组名
    return config.groupName || config.identity.toUpperCase();
  };

  useEffect(() => {
    // Clear any existing identity translations when on homepage
    clearIdentityTranslations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove callback dependency

  const handleIdentityClick = (identity: string) => {
    router.push(`/${identity}`);
  };

  // 加载中的 fallback UI
  const LoadingFallback = (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-2 sm:p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg p-4 sm:p-6 hover-lift">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading...</p>
        </div>
      </div>
    </div>
  );

  return (
    <ClientOnly fallback={LoadingFallback}>
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8 px-2 sm:px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 mb-6 sm:mb-8 hover-lift">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 sm:mb-6">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 leading-tight">
                  {t("homepage.title")}
                </h1>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  {t("homepage.description")}
                </p>
              </div>
              <div className="self-end sm:self-auto">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Feature Introduction */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="text-center p-3 sm:p-4 hover-lift hover-glow transition-all duration-300">
                <QrCodeIcon className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500 mx-auto mb-2 sm:mb-3 animate-bounce-gentle" />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base leading-snug">
                  {t("homepage.features.qrcode.title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {t("homepage.features.qrcode.description")}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 hover-lift hover-glow transition-all duration-300">
                <UserGroupIcon className="h-10 w-10 sm:h-12 sm:w-12 text-green-600 mx-auto mb-2 sm:mb-3 animate-bounce-gentle" />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base leading-snug">
                  {t("homepage.features.identity.title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {t("homepage.features.identity.description")}
                </p>
              </div>
              <div className="text-center p-3 sm:p-4 hover-lift hover-glow transition-all duration-300 sm:col-span-2 md:col-span-1">
                <InformationCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-purple-600 mx-auto mb-2 sm:mb-3 animate-bounce-gentle" />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base leading-snug">
                  {t("homepage.features.secure.title")}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {t("homepage.features.secure.description")}
                </p>
              </div>
            </div>
          </div>

          {/* Available Identities */}
          <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 hover-lift">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              {t("homepage.availableGroups")}
            </h2>

            {identityConfigs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {identityConfigs.map((config) => (
                  <button
                    key={config.identity}
                    onClick={() => handleIdentityClick(config.identity)}
                    className="p-4 sm:p-6 border border-gray-200 rounded-lg hover:border-yellow-400 hover:shadow-lg transition-all duration-300 text-left group hover-lift hover-glow transform hover:scale-105"
                  >
                    <div className="flex items-center mb-2 sm:mb-3">
                      {config.faviconUrl ? (
                        <div className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 relative hover-scale flex-shrink-0">
                          <Image
                            src={config.faviconUrl}
                            alt={`${getLocalizedGroupName(config)} favicon`}
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
                                  '<svg class="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 transition-colors animate-bounce-gentle" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0118.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" /></svg>';
                              }
                            }}
                          />
                        </div>
                      ) : (
                        <ComputerDesktopIcon className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500 mr-2 sm:mr-3 group-hover:text-yellow-600 transition-colors animate-bounce-gentle flex-shrink-0" />
                      )}
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 uppercase group-hover:text-yellow-500 transition-colors leading-tight break-words">
                        {getLocalizedGroupName(config)}
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-800 transition-colors leading-relaxed">
                      {t("homepage.clickToAccess", {
                        identity: getLocalizedGroupName(config),
                      })}
                    </p>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 hover-glow">
                <InformationCircleIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 text-sm sm:text-base">
                  {t("homepage.noGroupsAvailable")}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-6 sm:mt-8 text-gray-500 text-xs sm:text-sm px-4">
            <p className="leading-relaxed">{t("homepage.footer")}</p>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useTranslation } from "../../../components/I18nProvider";
import Image from "next/image";
import LanguageSwitcher from "../../../components/LanguageSwitcher";

export default function IdentityShowCodePage() {
  const router = useRouter();
  const params = useParams();
  const identity = params.identity as string;
  const { t, mounted, loadIdentityTranslations, clearIdentityTranslations } =
    useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [groupName, setGroupName] = useState<string>("");

  useEffect(() => {
    const checkVerification = () => {
      const verificationPassed = sessionStorage.getItem("verificationPassed");
      const verificationFrom = sessionStorage.getItem("verificationFrom");
      const currentIdentity = sessionStorage.getItem("currentIdentity");

      if (
        verificationPassed !== "true" ||
        verificationFrom !== "verify" ||
        currentIdentity !== identity
      ) {
        router.replace(`/${identity}`);
        return false;
      }
      return true;
    };

    // 立即执行验证检查
    const isValid = checkVerification();

    if (isValid) {
      // 验证通过，设置状态
      setIsVerified(true);
      setIsCheckingVerification(false);

      // 加载身份相关的资源
      const loadIdentityResources = async () => {
        try {
          const response = await fetch(
            `/api/identity/${identity.toLowerCase()}`
          );
          if (response.ok) {
            const config = await response.json();
            setQrCodeUrl(config.qrCodeUrl || "/qrcode.jpg");
            setGroupName(config.groupName || identity.toUpperCase());
            // Load identity-specific translations
            if (config.locales) {
              loadIdentityTranslations(config.locales);
            }
          }
        } catch (error) {
          console.error("Failed to load identity resources:", error);
          setQrCodeUrl("/qrcode.jpg");
          setGroupName(identity.toUpperCase());
        }
      };

      loadIdentityResources();

      // 检测是否为移动设备
      const checkDevice = () => {
        const userAgent = navigator.userAgent || navigator.vendor || "";
        setIsMobile(
          /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
            userAgent
          )
        );
      };

      checkDevice();

      // 监听窗口大小变化
      window.addEventListener("resize", checkDevice);

      return () => {
        window.removeEventListener("resize", checkDevice);
        // Clear identity translations when leaving the page
        clearIdentityTranslations();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, identity]); // Remove callback dependencies

  // 在水合完成前或验证检查期间显示加载状态
  if (!mounted || isCheckingVerification) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* 二维码显示区域 */}
        <div className="mb-6">
          <Image
            src={qrCodeUrl}
            alt={`${groupName} QR Code`}
            width={300}
            height={300}
            className="mx-auto rounded-lg shadow-md"
            priority
          />
        </div>

        {/* 提示文字 */}
        <div className="text-gray-800 space-y-3">
          <h1 className="text-xl font-bold">
            {t("show.successTitle", { groupName })}
          </h1>
          <div className="text-sm space-y-2">
            <p>{t("show.instructions")}</p>
            {isMobile ? (
              <p className="text-blue-600 font-medium">
                {t("show.mobileInstructions")}
              </p>
            ) : (
              <p className="text-green-600 font-medium">
                {t("show.desktopInstructions")}
              </p>
            )}
          </div>
        </div>

        {/* 返回首页按钮 */}
        <div className="mt-6">
          <button
            onClick={() => router.push("/")}
            className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t("show.backToHome")}
          </button>
        </div>

        {/* 注意事项 */}
        <div className="mt-6 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
          <p>{t("show.notice")}</p>
        </div>
      </div>
    </div>
  );
}

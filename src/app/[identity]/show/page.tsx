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
  const [translationsLoaded, setTranslationsLoaded] = useState(false);

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
              // Add a small delay to ensure translations are processed
              setTimeout(() => setTranslationsLoaded(true), 100);
            } else {
              setTranslationsLoaded(true);
            }
          } else {
            setTranslationsLoaded(true);
          }
        } catch {
          setQrCodeUrl("/qrcode.jpg");
          setGroupName(identity.toUpperCase());
          setTranslationsLoaded(true);
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

  // 在水合完成前或验证检查期间或翻译加载期间显示加载状态
  if (!mounted || isCheckingVerification || !translationsLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full hover-lift">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full hover-lift">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md w-full hover-lift">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* 标题 */}
        <div className="text-gray-800 space-y-3">
          <h1 className="text-xl font-bold">
            {t("show.successTitle", { groupName })}
          </h1>
        </div>

        {/* 二维码显示区域 */}
        <div className="mb-6">
          {qrCodeUrl ? (
            <div className="transition-transform duration-300">
              <Image
                src={qrCodeUrl}
                alt={`${groupName} QR Code`}
                width={300}
                height={300}
                className="mx-auto rounded-lg shadow-md"
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </div>
          ) : (
            <div className="w-[300px] h-[300px] mx-auto bg-gray-200 rounded-lg shadow-md flex items-center justify-center hover-glow">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            </div>
          )}
        </div>

        {/* 提示文字 */}
        <div className="text-gray-800 text-sm space-y-2">
          {isMobile ? (
            <p className="text-yellow-600 font-medium animate-pulse">
              {t("show.mobileInstructions")}
            </p>
          ) : (
            <p className="text-green-600 font-medium">
              {t("show.desktopInstructions")}
            </p>
          )}
        </div>

        {/* 返回首页按钮 */}
        <div className="mt-6">
          <button
            onClick={() => router.push("/")}
            className="bg-yellow-400 text-white py-2 px-6 rounded-lg hover:bg-yellow-500 transition-all duration-300 hover-scale hover-glow transform active:scale-95"
          >
            {t("show.backToHome")}
          </button>
        </div>
      </div>
    </div>
  );
}

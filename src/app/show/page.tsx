"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../components/I18nProvider";
import Image from "next/image";
import LanguageSwitcher from "../../components/LanguageSwitcher";

export default function ShowCodePage() {
  const router = useRouter();
  const { t, mounted } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(true);

  useEffect(() => {
    const checkVerification = () => {
      const verificationPassed = sessionStorage.getItem("verificationPassed");
      const verificationFrom = sessionStorage.getItem("verificationFrom");

      if (verificationPassed !== "true" || verificationFrom !== "verify") {
        router.replace("/");
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
      };
    }
  }, [router]);

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
            src="/qrcode.jpg"
            alt="微信群二维码"
            width={300}
            height={300}
            className="mx-auto rounded-lg shadow-md"
            priority
          />
        </div>

        {/* 提示文字 */}
        <p className="text-gray-600 text-sm">
          {isMobile
            ? t("qrcode.mobileInstruction")
            : t("qrcode.desktopInstruction")}
        </p>

        {/* 返回按钮 */}
        <button
          onClick={() => {
            // 清除验证状态
            sessionStorage.removeItem("verificationPassed");
            sessionStorage.removeItem("verificationFrom");
            router.push("/");
          }}
          className="mt-6 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
}

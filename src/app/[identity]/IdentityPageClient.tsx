"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../../components/I18nProvider";
import axios from "axios";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "../../components/LanguageSwitcher";

interface IdentityPageClientProps {
  identity: string;
  identityTranslations: Record<string, Record<string, unknown>>;
  identityLocales: string[];
}

export default function IdentityPageClient({
  identity,
  identityTranslations,
  identityLocales,
}: IdentityPageClientProps) {
  const router = useRouter();
  const { t, mounted, loadIdentityTranslations, clearIdentityTranslations } =
    useTranslation();

  const [formData, setFormData] = useState({
    userid: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Load identity-specific translations
    if (Object.keys(identityTranslations).length > 0) {
      if (identityLocales.length > 0) {
        loadIdentityTranslations(identityTranslations, identityLocales);
      } else {
        loadIdentityTranslations(identityTranslations);
      }
    }

    // Cleanup function to clear identity translations when leaving the page
    return () => {
      clearIdentityTranslations();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [identity, identityTranslations, identityLocales]);

  // 在水合完成前显示加载状态
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 hover-lift">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // 验证表单
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.userid) {
      newErrors.userid = t("validation.idRequired");
    } else if (formData.userid.length !== 18) {
      newErrors.userid = t("validation.idLength");
    }

    if (!formData.username) {
      newErrors.username = t("validation.nameRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 提交表单
  const submitForm = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      // 创建 FormData 发送到我们的 API
      const formDataToSend = new FormData();
      formDataToSend.append("userid", formData.userid);
      formDataToSend.append("username", formData.username);

      const response = await axios.post("/api/verify", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // 检查返回的 JSON 响应
      const result = response.data;
      if (result.success) {
        // console.log("验证通过:", result.content);
        // 设置验证通过状态到 sessionStorage
        sessionStorage.setItem("verificationPassed", "true");
        sessionStorage.setItem("verificationFrom", "verify");
        sessionStorage.setItem("currentIdentity", identity);
        // 跳转到展示页面
        router.push(`/${identity}/show`);
      } else {
        // 提示查询不到录取信息
        alert(t("verify.verifyFailed"));
      }
    } catch (error) {
      console.error("请求失败:", error);
      alert(t("verify.requestFailed"));
    } finally {
      setLoading(false);
    }
  };

  const openExternalLink = () => {
    window.open(
      "https://github.com/HNRobert/UNNC-Freshman-Verify-Gateway",
      "_blank"
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 hover-lift">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 hover-scale">
            {t("verify.groupName")}
          </h1>
          <h2 className="text-lg text-yellow-500 font-semibold">
            {t("verify.title")}
          </h2>
        </div>

        {/* Alert */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 hover-glow transition-all duration-300">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">{t("verify.verifyIdentity")}</p>
              <p className="break-words">{t("verify.description")}</p>
            </div>
          </div>
        </div>

        {/* Warning and Help */}
        <div className="mb-6 space-y-2">
          <div className="flex items-start text-sm text-red-600">
            <ExclamationTriangleIcon className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span className="break-words">{t("verify.warningText")}</span>
          </div>

          <div className="group relative">
            <button
              className="text-xs text-yellow-600 hover:text-yellow-800 underline hover-scale transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                const tooltip = document.querySelector(".tooltip-mobile");
                tooltip?.classList.toggle("visible");

                const handleClick = (event: MouseEvent) => {
                  if (
                    tooltip &&
                    !tooltip.contains(event.target as Node) &&
                    !(e.target as Node).contains(event.target as Node)
                  ) {
                    tooltip.classList.remove("visible");
                    document.removeEventListener("click", handleClick);
                  }
                };
                document.addEventListener("click", handleClick);
              }}
            >
              {t("verify.unableToVerify")}
            </button>
            <div
              className="tooltip-mobile invisible group-hover:visible md:group-hover:visible absolute bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-gray-900 text-white text-xs rounded-lg p-2 z-10 break-words animate-glow md:invisible"
              onClick={(e) => e.stopPropagation()}
            >
              {t("verify.unableToVerifyMessage")}
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitForm();
          }}
          className="space-y-4"
        >
          {/* 身份证号 */}
          <div>
            <label
              htmlFor="userid"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("verify.idNumber")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <IdentificationIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="userid"
                maxLength={18}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 hover-glow transition-all duration-300 ${
                  errors.userid
                    ? "border-red-300"
                    : "border-gray-300 hover:border-yellow-400"
                }`}
                placeholder={t("verify.idNumberPlaceholder")}
                value={formData.userid}
                onChange={(e) =>
                  setFormData({ ...formData, userid: e.target.value })
                }
              />
            </div>
            {errors.userid && (
              <p className="mt-1 text-sm text-red-600">{errors.userid}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.userid.length}/18
            </p>
          </div>

          {/* 姓名 */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("verify.name")}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="username"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-900 hover-glow transition-all duration-300 ${
                  errors.username
                    ? "border-red-300"
                    : "border-gray-300 hover:border-yellow-400"
                }`}
                placeholder={t("verify.namePlaceholder")}
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: "#fed200" }}
            className="w-full text-gray-700 py-2 px-4 rounded-lg focus:outline-none focus:ring-2 disabled:cursor-not-allowed transition-all duration-300 hover-scale hover-glow transform active:scale-95"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {t("verify.verifying")}
              </div>
            ) : (
              t("verify.submitButton")
            )}
          </button>
        </form>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-xs text-gray-500 space-y-1 px-4 max-w-sm">
        <div>©2025 HNRobert | All rights reserved.</div>
        <div className="flex items-center justify-center space-x-1 flex-wrap">
          <span>&gt; {t("verify.openSourceText")}</span>
          <button
            onClick={openExternalLink}
            className="text-yellow-600 hover:text-yellow-800 underline hover-scale transition-all duration-200"
          >
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

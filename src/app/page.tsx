"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "../components/I18nProvider";
import axios from "axios";
import {
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function VerifyPage() {
  const router = useRouter();
  const { t, mounted } = useTranslation();
  const [formData, setFormData] = useState({
    userid: "",
    username: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // 在水合完成前显示加载状态
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
      // 自动进行 URL 编码
      const params = new URLSearchParams();
      params.append("userid", formData.userid);
      params.append("username", formData.username);

      const cookie =
        "AMCVS_4D6368F454EC41940A4C98A6%40AdobeOrg=1; _gcl_au=1.1.145204148.1747475311; _ga=GA1.1.539725090.1747475312; AMCV_4D6368F454EC41940A4C98A6%40AdobeOrg=-2121179033%7CMCIDTS%7C20226%7CMCMID%7C19596142359291472354115984324568118060%7CMCAAMLH-1748082574%7C3%7CMCAAMB-1748082574%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCOPTOUT-1747484974s%7CNONE%7CMCAID%7CNONE%7CvVersion%7C5.3.0; s_pers=%20v8%3D1747477774243%7C1842085774243%3B%20v8_s%3DMore%2520than%25207%2520days%7C1747479574243%3B%20c19%3Dpr%253Apure%2520portal%253Apersons%253Aview%7C1747479574244%3B%20v68%3D1747477773255%7C1747479574244%3B; s_sess=%20s_cpc%3D0%3B%20c21%3Dchin%2520poo%2520lee%3B%20e13%3Dchin%2520poo%2520lee%253A1%3B%20c13%3Drating-desc%3B%20s_ppvl%3Dpr%25253Apure%252520portal%25253Apublications%25253Aview%252C35%252C35%252C893%252C1274%252C893%252C1512%252C982%252C2%252CP%3B%20s_ppv%3Dpr%25253Apure%252520portal%25253Apublications%25253Aview%252C100%252C35%252C2559%252C1274%252C893%252C1512%252C982%252C2%252CP%3B%20e41%3D1%3B%20s_cc%3Dtrue%3B; _ga_D0L9JPJXFY=GS2.1.s1747900771$o6$g0$t1747900772$j0$l0$h0; CID=BgAAALyG+ymghw6DbQhG6KSkYZU=; PHPSESSID=q392hr54b3iabr7rajp0vs5p0k; TS013cc1fd=010f85e1d816b1696c78c64f1e299c8633d80747b48d24489bc1bb445973251e4d6b10e176d97b7e5cde5a52fc668cb838e1a21c027f81c891fd3ecbcedbe35f704df622e1";

      const response = await axios.post(
        "https://cors.ibuduan.com/https://entry.nottingham.edu.cn/result.php",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            cookie: cookie,
            Origin: "http://entry.nottingham.edu.cn",
          },
        }
      );

      // 检查返回内容
      const content = response.data;
      if (
        content &&
        typeof content === "string" &&
        content.includes("Congratulations!") &&
        content.includes("专业录取")
      ) {
        console.log("验证通过:", content);
        // 设置验证通过状态到 sessionStorage
        sessionStorage.setItem("verificationPassed", "true");
        sessionStorage.setItem("verificationFrom", "verify");
        // 跳转到展示页面
        router.push("/show");
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
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <LanguageSwitcher />
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("verify.groupName")}
          </h1>
          <h2 className="text-lg text-blue-600 font-semibold">
            {t("verify.title")}
          </h2>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">{t("verify.verifyIdentity")}</p>
              <p className="break-words">
                {t("verify.description", { groupName: t("verify.groupName") })}
              </p>
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
            <button className="text-xs text-blue-600 hover:text-blue-800 underline">
              {t("verify.unableToVerify")}
            </button>
            <div className="invisible group-hover:visible absolute bottom-full left-0 mb-2 w-72 max-w-[calc(100vw-2rem)] bg-gray-900 text-white text-xs rounded-lg p-2 z-10 break-words">
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
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.userid ? "border-red-300" : "border-gray-300"
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
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.username ? "border-red-300" : "border-gray-300"
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
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? t("verify.verifying") : t("verify.submitButton")}
          </button>
        </form>
      </div>

      {/* Copyright */}
      <div className="mt-8 text-center text-xs text-gray-500 space-y-1 px-4 max-w-sm">
        <div>©2025 HNRobert 2025 | All rights reserved.</div>
        <div className="flex items-center justify-center space-x-1 flex-wrap">
          <span>&gt; {t("verify.openSourceText")}</span>
          <button
            onClick={openExternalLink}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

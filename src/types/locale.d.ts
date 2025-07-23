// YAML locale 文件的类型定义
export interface LocaleData {
  metadata: {
    title: string;
    description: string;
  };
  common: {
    switchLanguage: string;
    english: string;
    chinese: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    cancel: string;
  };
  verify: {
    groupName: string;
    unableToVerifyMessage: string;
    title: string;
    verifyIdentity: string;
    description: string;
    warningText: string;
    unableToVerify: string;
    idNumber: string;
    idNumberPlaceholder: string;
    name: string;
    namePlaceholder: string;
    submitButton: string;
    verifying: string;
    verifySuccess: string;
    verifyFailed: string;
    requestFailed: string;
    invalidUsage: string;
    openSourceText: string;
  };
  qrcode: {
    mobileInstruction: string;
    desktopInstruction: string;
  };
  validation: {
    idRequired: string;
    idLength: string;
    nameRequired: string;
  };
}

export default {
  expo: {
    name: "BiometricAuthApp",
    slug: "biometric-auth-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      infoPlist: {
        NSFaceIDUsageDescription:
          "This app uses Face ID for secure authentication.",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#FFFFFF",
      },
      permissions: ["USE_FINGERPRINT", "USE_BIOMETRIC"],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
  },
};

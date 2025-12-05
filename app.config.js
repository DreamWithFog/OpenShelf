const IS_DEV = process.env.APP_VARIANT === 'development';

export default {
  expo: {
    name: "OpenShelf",
    slug: "openshelf",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    jsEngine: "hermes",
    plugins: [
      "expo-image-picker",
      "expo-sqlite",
      [
        "expo-camera",
        {
          "cameraPermission": "Allow OpenShelf to access your camera to scan ISBN barcodes."
        }
      ],
      "expo-font",
      // --- NEW PLUGIN BLOCK STARTS HERE ---
      [
        "expo-build-properties",
        {
          "android": {
            "extraGradleProps": {
              // This forces the build to ONLY create binary code for modern phones (arm64).
              // It effectively deletes x86 (emulator) and armv7 (ancient phones) from the file.
              "reactNativeArchitectures": "arm64-v8a"
            }
          }
        }
      ]
      // --- NEW PLUGIN BLOCK ENDS HERE ---
    ],
    splash: {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#13142b"
    },
    ios: {
      "supportsTablet": true,
      "bundleIdentifier": "com.iandiaz.openshelf",
      "jsEngine": "hermes"
    },
    android: {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "package": "com.iandiaz.openshelf",
      "permissions": [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO"
      ],
      "jsEngine": "hermes",
      "enableProguardInReleaseBuilds": true,
      "enableShrinkResourcesInReleaseBuilds": true
      // REMOVED: buildOptions block (it wasn't doing anything!)
    },
    web: {
      "favicon": "./assets/favicon.png"
    },
    extra: {
      eas: {
        "projectId": "812e1eb0-7534-4a72-9966-af97d246b755"
      }
    },
    owner: "iandm",
    assetBundlePatterns: [
      "**/*"
    ]
  }
};

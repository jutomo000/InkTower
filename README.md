# 《墨阵》 (InkTower) - Mobile Build Instructions

This project uses **Vite** for the web build and **Capacitor** to wrap it for Android.

## Local APK Build
To build the APK on your machine, follow these steps:

1.  **Build the Web App**:
    ```bash
    npm run build
    ```
2.  **Add Android Platform** (if not already added):
    ```bash
    npx cap add android
    ```
3.  **Sync Web Assets to Android**:
    ```bash
    npx cap sync
    ```
4.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
5.  **Generate APK**:
    *   In Android Studio, go to **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
    *   The APK will be located at `android/app/build/outputs/apk/debug/app-debug.apk`.

## Automatic Build (GitHub)
I have added a GitHub Action workflow in `.github/workflows/build.yml`. 
*   Simply push your code to GitHub.
*   Go to the **Actions** tab in your repository.
*   Wait for the build to finish, and you can download the APK from the **Artifacts** section of the run.

## Tech Details
- **Engine**: Custom Canvas Engine (src/engine.ts)
- **UI**: HTML/CSS Overlay (src/game/ui/UpgradeUI.ts)
- **Styles**: Ink-wash aesthetic (style.css)

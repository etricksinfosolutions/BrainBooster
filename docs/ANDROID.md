# 📱 Brain Booster Kids — Android app (EtricksGames)

The Android app is the same React/TypeScript PWA wrapped in a native shell with
**Capacitor**. All the game code is shared — no rewrite. The app runs fully
offline (bundled `content.json`, logos and assets); point `VITE_API_BASE` at your
server before building if you want live server-driven content.

- **App ID:** `com.etricksgames.brainboosterkids`
- **App name:** Brain Booster Kids
- **Native project:** `apps/web/android/` (generated, committed)
- **Icon & splash:** generated from `apps/web/public/etricks-logo.png` into every density

## Fastest way to get an APK — GitHub Actions (no local tools)

1. Push the repo to GitHub.
2. Open the **Actions** tab → **Android build** → **Run workflow**.
3. When it finishes, download the **`brain-booster-kids-debug-apk`** artifact and
   install `app-debug.apk` on any Android device (enable “install unknown apps”).

The workflow ([.github/workflows/android.yml](../.github/workflows/android.yml))
sets up Node, JDK 17 and the Android SDK, builds the web app, syncs Capacitor and
runs `./gradlew assembleDebug`.

## Build locally

Prerequisites (one-time):
- **Node 18+**
- **JDK 17** (Temurin/OpenJDK)
- **Android Studio** (includes the Android SDK + platform tools). Open it once and
  let it install the SDK; it sets `ANDROID_HOME`.

From `apps/web/`:

```bash
npm install
npm run android:open      # build web + cap sync, then open Android Studio
```

Then in Android Studio press **Run ▶** (device/emulator), or build an APK from
**Build → Build Bundle(s)/APK(s) → Build APK(s)**.

### Command-line APK (no Studio UI)

```bash
cd apps/web
npm run android:apk       # → android/app/build/outputs/apk/debug/app-debug.apk
```

### Handy scripts (in `apps/web/package.json`)

| Script | What it does |
|---|---|
| `npm run android:sync` | build web + copy into the native project |
| `npm run android:open` | sync + open Android Studio |
| `npm run android:apk` | sync + build a **debug APK** |
| `npm run android:bundle` | sync + build a **release AAB** (for Play Store) |
| `npm run android:assets` | regenerate icon/splash from the logo |

## Native integrations already wired

- **Splash screen** — native white splash with the EtricksGames logo, hands off to
  the in-app animated splash, then the game.
- **Status bar** — tinted to the app theme.
- **Share** — the “Share App” button uses the real Android share sheet
  (`@capacitor/share`) on device, and the Web Share API / clipboard on the web.

## Play Store release checklist

1. Bump `versionCode` / `versionName` in `apps/web/android/app/build.gradle`.
2. Create a keystore and configure signing (`android/app/build.gradle` → `signingConfigs`)
   or use Play App Signing.
3. `npm run android:bundle` → upload `android/app/build/outputs/bundle/release/app-release.aab`.
4. Fill the store listing (the icon/splash/logo are ready in `apps/web/public/`).
5. Payments & ads: the app currently ships the web/simulated flows — swap in Google
   Play Billing and AdMob (react-native-style native plugins or Capacitor community
   plugins) before monetized release. See inline notes in `AdBreak` and the payments route.

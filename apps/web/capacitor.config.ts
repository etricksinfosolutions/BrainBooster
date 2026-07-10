import type { CapacitorConfig } from '@capacitor/cli'

// Brain Booster Kids — native shell config (EtricksGames).
// The built PWA in `dist/` (fully offline: bundled content.json, logos, service
// worker) is packaged as-is. Point VITE_API_BASE at your production API before
// `npm run build` if you want live server content; otherwise it runs offline.
const config: CapacitorConfig = {
  appId: 'com.etricksgames.brainboosterkids',
  appName: 'Brain Booster Kids',
  webDir: 'dist',
  backgroundColor: '#efe9fb',
  android: {
    backgroundColor: '#efe9fb',
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: '#ffffff',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#efe9fb',
    },
  },
}

export default config

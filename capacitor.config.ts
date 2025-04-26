
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.06d8eed1e2ac4012848190a4ca5a6b1a',
  appName: 'egypt-temp-explorer-app',
  webDir: 'dist',
  server: {
    url: 'https://06d8eed1-e2ac-4012-8481-90a4ca5a6b1a.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  android: {
    buildOptions: {
      androidxCore: '1.5.0',
      androidxAppcompat: '1.3.0',
    }
  }
};

export default config;
